# AI-Powered Interviewer Backend

Flask-based AI interviewer system that conducts adaptive technical interviews using Gemini AI.

## Features

✅ **Resume Analysis** - AI-powered skill extraction and profile building  
✅ **Adaptive Questioning** - Dynamic difficulty adjustment (EASY → MEDIUM → HARD)  
✅ **Semantic Evaluation** - Objective answer scoring using AI and embeddings  
✅ **Time Management** - Enforces time limits with penalties  
✅ **Early Termination** - Stops interview after 3 consecutive failures  
✅ **Comprehensive Reports** - Final score, strengths, weaknesses, hiring readiness  

## Tech Stack

- **Backend**: Flask (Python)
- **AI Engine**: Google Gemini API
- **Semantic Matching**: Gemini Embeddings + Cosine Similarity
- **Storage**: In-memory (migrate to Firebase for production)

## Setup Instructions

### 1. Prerequisites

- Python 3.8+
- Google Gemini API Key ([Get it here](https://makersuite.google.com/app/apikey))

### 2. Installation

```bash
# Clone or download the project
cd ai-interviewer-backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Configuration

```bash
# Copy .env.example to .env
cp .env.example .env

# Edit .env and add your Gemini API key
# GEMINI_API_KEY=your_actual_api_key_here
```

### 4. Run the Server

```bash
python app.py
```

Server will start at `http://localhost:5000`

## API Documentation

### 1. Analyze Resume

**Endpoint:** `POST /resume/analyze`

**Request:**
```json
{
  "resume_text": "John Doe\nSoftware Engineer with 3 years experience in Python, React..."
}
```

**Response:**
```json
{
  "candidate_id": "uuid-here",
  "candidate_profile": {
    "skills": ["Python", "React", "Docker"],
    "experience_years": 3,
    "projects": ["E-commerce Platform", "ML Model"],
    "primary_domain": "Full Stack Development"
  }
}
```

### 2. Start Interview

**Endpoint:** `POST /interview/start`

**Request:**
```json
{
  "candidate_id": "uuid-from-resume-analysis",
  "job_description": "Looking for a Senior Backend Engineer with Python and microservices experience..."
}
```

**Response:**
```json
{
  "session_id": "session-uuid",
  "first_question": "What is your experience with RESTful API design?",
  "difficulty": "EASY",
  "time_limit": 90
}
```

### 3. Submit Answer

**Endpoint:** `POST /interview/answer`

**Request:**
```json
{
  "session_id": "session-uuid",
  "question": "What is your experience with RESTful API design?",
  "answer_text": "I have designed and implemented RESTful APIs using Flask...",
  "time_taken": 78
}
```

**Response:**
```json
{
  "score": 72,
  "status": "CLEARED",
  "feedback": "Good explanation of REST principles. Consider mentioning versioning strategies.",
  "next_difficulty": "MEDIUM",
  "questions_remaining": 9
}
```

**Status Values:**
- `CLEARED` - Good performance, continue
- `WARNING` - Below threshold, be careful
- `TERMINATED` - 3 consecutive failures

### 4. Get Next Question

**Endpoint:** `GET /interview/next-question?session_id=<session_id>`

**Response:**
```json
{
  "question": "How would you design a caching strategy for a high-traffic API?",
  "difficulty": "MEDIUM",
  "time_limit": 120
}
```

### 5. End Interview

**Endpoint:** `POST /interview/end`

**Request:**
```json
{
  "session_id": "session-uuid"
}
```

**Response:**
```json
{
  "final_score": 76,
  "category": "STRONG",
  "strengths": [
    "Strong understanding of system design principles",
    "Clear communication of technical concepts",
    "Good time management"
  ],
  "weaknesses": [
    "Could improve database optimization knowledge",
    "Limited experience with cloud architecture",
    "Need more depth in security best practices"
  ],
  "hiring_readiness": "YES",
  "total_questions": 10,
  "total_time": 1050,
  "score_breakdown": {
    "EASY": [85, 90],
    "MEDIUM": [75, 78, 72],
    "HARD": [65, 70, 68, 60, 75]
  }
}
```

### 6. Health Check

**Endpoint:** `GET /health`

**Response:**
```json
{
  "status": "healthy",
  "active_sessions": 3
}
```

### 7. Get Session Status

**Endpoint:** `GET /session/<session_id>`

**Response:**
```json
{
  "session": {
    "session_id": "uuid",
    "candidate_id": "uuid",
    "difficulty": "MEDIUM",
    "question_count": 5,
    "scores": [85, 72, 78, 65, 70],
    "fail_streak": 0,
    "time_used": 520,
    "status": "ACTIVE"
  },
  "responses_count": 5,
  "average_score": 74
}
```

## Scoring Logic

### Base Score Calculation
- AI evaluates answer on 0-100 scale based on:
  - Technical accuracy
  - Relevance to question
  - Depth of explanation
  - Job description alignment

### Penalties Applied
- **Overtime Penalty**: Up to -20 points if time exceeds limit
- **Brevity Penalty**: -15 points for answers < 20 characters

### Difficulty Adaptation
- Score ≥ 70 → Increase difficulty
- Score 50-69 → Maintain difficulty
- Score < 50 → Decrease difficulty or warn
- 3 consecutive failures → Terminate interview

## Time Limits by Difficulty

- **EASY**: 90 seconds
- **MEDIUM**: 120 seconds
- **HARD**: 180 seconds

## Interview Flow

1. **Analyze Resume** → Extract candidate profile
2. **Start Interview** → Get first EASY question
3. **Answer Loop** (up to 10 questions):
   - Submit answer
   - Get evaluation & score
   - Receive next question (difficulty adapts)
4. **End Interview** → Generate final report

## Error Handling

All endpoints return appropriate HTTP status codes:
- `200` - Success
- `400` - Bad request (missing parameters)
- `404` - Resource not found (invalid session/candidate ID)
- `500` - Server error

## Production Considerations

### Current Implementation (In-Memory)
- ✅ Fast for development
- ❌ Data lost on server restart
- ❌ Not suitable for production

### Recommended: Firebase Integration
```python
# Replace in-memory dictionaries with Firestore
# sessions → firestore.collection('interviews')
# candidate_profiles → firestore.collection('candidates')
# interview_responses → firestore.collection('responses')
```

### Security Enhancements
- Add authentication (Firebase Auth)
- Rate limiting
- Input validation
- API key rotation

## Testing the API

### Using cURL

```bash
# 1. Analyze Resume
curl -X POST http://localhost:5000/resume/analyze \
  -H "Content-Type: application/json" \
  -d '{"resume_text": "Software Engineer with 5 years Python experience..."}'

# 2. Start Interview
curl -X POST http://localhost:5000/interview/start \
  -H "Content-Type: application/json" \
  -d '{"candidate_id": "your-candidate-id", "job_description": "Backend Engineer role..."}'

# 3. Submit Answer
curl -X POST http://localhost:5000/interview/answer \
  -H "Content-Type: application/json" \
  -d '{"session_id": "your-session-id", "question": "...", "answer_text": "...", "time_taken": 80}'
```

### Using Postman

1. Import the API endpoints
2. Set `Content-Type: application/json`
3. Follow the interview flow from resume analysis to completion

## Troubleshooting

### Gemini API Errors
- Verify API key in `.env` file
- Check API quota/limits
- Ensure internet connectivity

### Import Errors
- Run `pip install -r requirements.txt`
- Activate virtual environment

### CORS Issues
- Flask-CORS is enabled for all origins
- For production, restrict origins in `CORS(app)`

## License

MIT

## Support

For issues or questions, please create an issue in the repository.# buildxhire
