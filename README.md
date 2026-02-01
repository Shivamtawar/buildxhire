## Video Submission

View the project demonstration and submission: https://drive.google.com/drive/folders/17wR3Gvnd_k41IlKuLDndLatJuya1calV?usp=drive_link

---

# BuildxHire - AI-Powered Interview & Resume Analysis Platform

A modern, full-stack platform that combines AI-powered technical interviews with intelligent resume-job description analysis. Built with React, Flask, and Groq AI.

## Project Overview

BuildxHire is a comprehensive platform designed to help candidates prepare for technical interviews and optimize their resumes for specific job opportunities. The platform provides:

- **Smart Resume Analysis**: Upload your resume (PDF/TXT) and get detailed insights about your skills, experience, and ATS compatibility
- **Resume-JD Matching**: Compare your resume against a job description to see skill gaps, missing keywords, and match percentage
- **AI Resume Rewriting**: Get an AI-powered rewrite of your resume optimized for a specific job description
- **Adaptive Technical Interviews**: Take dynamic interviews with questions that adjust difficulty based on your performance
- **Performance Tracking**: Get detailed reports on your performance, strengths, and areas to improve

This is a single full-stack application with the React frontend integrated directly with the Flask backend, deployed as one service on Render.

---

## Key Features

### Resume Analysis Module

- **PDF & Text Upload** - Support for multiple file formats
- **Skill Extraction** - AI-powered extraction of skills, experience, and certifications
- **Profile Building** - Automatically creates a candidate profile
- **Resume Management** - View, edit, and clear uploaded resumes

### Resume-JD Matching

- **Compatibility Scoring** - Overall match percentage (0-100%)
- **Skill Matching** - Identifies matched and missing skills with visual indicators
- **ATS Score** - Evaluates how well your resume passes Applicant Tracking Systems
- **Requirements Tracking** - Shows which job requirements are met/unmet
- **Data Visualizations** - Bar charts and pie charts for easy understanding
- **Detailed Breakdown** - Summary, strengths, gaps, and recommendations

### AI Resume Rewriting

- **Smart Rewriting** - AI generates optimized version of your resume
- **JD-Focused** - Rewrites specifically target the job description keywords
- **Download as TXT** - Download the rewritten resume as a text file
- **Modal Preview** - Review before downloading

### Technical Interviews

- **Adaptive Questioning** - Question difficulty adjusts based on performance (EASY to HARD)
- **Time Management** - Enforces time limits with visual countdown
- **Smart Evaluation** - AI-powered answer evaluation using semantic similarity
- **Early Termination** - Stops after 3 consecutive failures
- **Comprehensive Reports** - Final scores, strengths, weaknesses, and hiring recommendations

### Modern User Interface

- **Professional Landing Page** - Clean hero section with navigation tabs
- **Responsive Design** - Works perfectly on desktop, tablet, and mobile devices
- **Light Theme** - Clean blue gradient design
- **Intuitive Navigation** - Smooth routing between features
- **Clear Feedback** - Loading states and user notifications  

---

## Technology Stack

### Frontend
- React 18 - Modern component-based UI
- Vite - Lightning-fast build tool
- Tailwind CSS - Utility-first CSS framework
- React Router v6 - Client-side routing
- Recharts - Data visualizations (bar charts, pie charts)
- Lucide React - Consistent icon library
- pdfjs-dist - Client-side PDF text extraction
- Axios - HTTP client for API calls

### Backend
- Flask - Lightweight Python web framework
- Flask-CORS - Cross-origin resource sharing
- Groq API - High-performance LLM inference (llama-3.3-70b-versatile)
- NumPy & Scikit-learn - Machine learning utilities for embeddings
- Gunicorn - Production WSGI server

### AI & Machine Learning
- Groq LLM - Language model for interview questions, resume analysis, and rewriting
- Cosine Similarity - Semantic answer evaluation
- Word Embeddings - Resume and job description context understanding

### Deployment
- Render - Cloud deployment platform
- GitHub - Version control and CI/CD integration

---

## Project Structure

```
buildxhire/
│
├── app.py                          # Flask backend (main server)
├── requirements.txt                # Python dependencies
├── Procfile                        # Render deployment config
├── .gitignore                      # Git ignore rules
├── DEPLOYMENT.md                   # Deployment guide
│
└── frontend/                       # React frontend
    ├── src/
    │   ├── components/
    │   │   ├── WelcomeScreen.jsx  # Landing page
    │   │   ├── CompareScreen.jsx  # Resume-JD comparison
    │   │   ├── SetupScreen.jsx    # Interview setup
    │   │   ├── InterviewScreen.jsx # Interview interface
    │   │   └── SummaryScreen.jsx  # Results page
    │   ├── services/
    │   │   └── api.js             # API service layer
    │   ├── contexts/              # React context state
    │   ├── utils/                 # Utility functions
    │   ├── assets/                # Images and static files
    │   ├── App.jsx                # Main app router
    │   ├── main.jsx               # React entry point
    │   └── index.css              # Global styles
    ├── dist/                       # Built app (served by Flask)
    ├── package.json               # Node dependencies
    ├── vite.config.js             # Vite configuration
    └── tailwind.config.js         # Tailwind CSS config
```

---

## Getting Started

### Prerequisites
- Python 3.8 or later
- Node.js 16 or later
- Groq API Key (free at https://console.groq.com)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd buildxhire

# Install Python dependencies
python -m venv env
source env/bin/activate  # On Windows: env\Scripts\activate
pip install -r requirements.txt

# Install Node dependencies
cd frontend
npm install
cd ..

# Create .env file with API key
echo "GROQ_API_KEY=your_actual_groq_api_key_here" > .env
```

### Running Locally

**Development Mode:**
```bash
# Terminal 1: Start Flask backend (port 5000)
python app.py

# Terminal 2: Start React frontend (port 3000)
cd frontend
npm run dev
```

Open `http://localhost:3000` in your browser.

**Production Mode:**
```bash
# Build the frontend
cd frontend
npm run build
cd ..

# Run with Gunicorn
gunicorn app:app
```

---

## API Endpoints

### Resume Endpoints

POST `/resume/analyze`
- Analyzes an uploaded resume and extracts candidate profile
- Request body: `{ "resume_text": "..." }`
- Returns: Profile data including skills, experience, and certifications

POST `/resume/match-jd`
- Compares resume against a job description
- Request body: `{ "resume_text": "...", "job_description": "..." }`
- Returns: Match percentage, skill breakdown, ATS score, and requirements

POST `/resume/rewrite`
- Generates an AI-optimized resume for a specific job description
- Request body: `{ "resume_text": "...", "job_description": "..." }`
- Returns: `{ "rewritten_resume": "..." }`

### Interview Endpoints

POST `/interview/start`
- Initiates a new interview session
- Request body: `{ "candidate_profile": {...}, "job_description": "..." }`
- Returns: Session ID and first question

GET `/interview/next-question`
- Retrieves the next interview question
- Parameters: `?session_id=...&previous_answer=...&score=...`
- Returns: Next question with time limit and difficulty level

POST `/interview/answer`
- Submits an answer and receives evaluation
- Request body: `{ "session_id": "...", "answer": "..." }`
- Returns: Score, feedback, and continuation status

POST `/interview/end`
- Ends the interview and generates final report
- Request body: `{ "session_id": "..." }`
- Returns: Final report with scores, strengths, gaps, and recommendations

### Utility Endpoints

GET `/health`
- Health check endpoint
- Returns: `{ "status": "ok" }`

---

## How It Works

### Interview Flow
1. User uploads or enters resume text
2. System extracts candidate profile from resume
3. User enters job description
4. Interview begins with a random question
5. System evaluates each answer using semantic similarity analysis
6. Question difficulty adapts based on performance
7. Interview terminates after 3 consecutive failures or 10 questions
8. Final comprehensive report is generated with insights

### Resume-JD Matching Flow
1. User uploads resume and enters job description
2. Backend analyzes resume content and extracts key skills
3. System matches resume skills against job requirements
4. Calculates ATS compatibility score
5. Generates recommendations for improvement
6. Optional: AI rewrites resume optimized for the job description
7. User downloads rewritten resume if requested

---

## Deployment to Render

### Quick Deploy Steps

1. Push to GitHub
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. Go to Render Dashboard at https://dashboard.render.com

3. Create New Web Service
   - Connect your GitHub repository
   - Set Name: `buildxhire`
   - Environment: `Python 3`
   - Build Command: `pip install -r requirements.txt && cd frontend && npm install && npm run build && cd ..`
   - Start Command: `gunicorn app:app`

4. Add Environment Variables
   - Key: `GROQ_API_KEY`
   - Value: Your Groq API key

5. Deploy
   - Click "Create Web Service"
   - Wait 3-5 minutes for build completion
   - Access your live URL

See DEPLOYMENT.md for detailed information.

---

## Implementation Summary

### Phase 1: Resume Analysis
- PDF and text upload support
- AI-powered skill extraction
- Candidate profile creation

### Phase 2: Resume-JD Comparison
- Resume matching against job descriptions
- Skill gap identification
- ATS score calculation
- Visual progress indicators

### Phase 3: Data Visualization
- Bar charts for score distribution
- Pie charts for skill breakdown
- Color-coded skill indicators
- Professional UI design

### Phase 4: Resume Rewriting
- AI-powered resume optimization
- Modal preview interface
- Download as text file
- Content optimization for specific jobs

### Phase 5: Full-Stack Integration
- React frontend built and integrated with Flask
- Single unified deployment
- Same-origin serving (no CORS issues)
- Production-ready configuration

### Phase 6: Deployment Ready
- Procfile configured for Render
- Optimized build scripts
- Environment variable setup
- Gunicorn production server

---

## Configuration

### Environment Variables
Create a `.env` file in the root directory:
```
GROQ_API_KEY=your_groq_api_key_here
```

### Optional Settings
- `PORT`: Server port (default: 5000, Render sets automatically)
- `DEBUG`: Flask debug mode (set to False in production)

---

## Performance & Optimization

- Frontend: Vite build produces optimized ~330KB gzipped JavaScript bundle
- Backend: Groq API provides fast LLM inference with sub-second response times
- PDF Processing: Client-side extraction reduces server load
- Caching: Session-based storage for interview data
- Static Files: Served directly by Flask with proper headers

---

## Troubleshooting

### Common Issues

**Port already in use**
```bash
lsof -ti:5000 | xargs kill -9
```

**Module not found errors**
```bash
pip install -r requirements.txt
cd frontend && npm install
```

**Build fails on Render**
- Verify frontend/dist is NOT in .gitignore (use `!frontend/dist/` to include it)
- Check all dependencies are listed in requirements.txt and package.json

**API endpoints returning 404**
- Ensure backend is running
- Verify API call paths are correct
- Confirm GROQ_API_KEY is set in environment variables

---

## License

This project is open source and available under the MIT License.

---

## Author

Shivam Tawar

- LinkedIn: https://linkedin.com/in/shivam-tawar
- GitHub: https://github.com/shivamtawar
- Email: contact@shivamtawar.dev
