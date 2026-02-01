# BuildxHire - AI-Powered Interview & Resume Analysis Platform

> A modern, full-stack platform that combines **AI-powered technical interviews** with **intelligent resume-job description analysis**. Built with React, Flask, and Groq AI.

## 🚀 Project Overview

**BuildxHire** is a comprehensive platform designed to help candidates prepare for technical interviews and optimize their resumes for specific job opportunities. It provides:

- **Smart Resume Analysis**: Upload your resume (PDF/TXT) and get detailed insights about your skills, experience, and ATS compatibility
- **Resume-JD Matching**: Compare your resume against a job description to see skill gaps, missing keywords, and match percentage
- **AI Resume Rewriting**: Get an AI-powered rewrite of your resume optimized for a specific job description
- **Adaptive Technical Interviews**: Take dynamic interviews with questions that adjust difficulty based on your performance
- **Performance Tracking**: Get detailed reports on your performance, strengths, and areas to improve

This is a **single full-stack application** with the React frontend integrated directly with the Flask backend, deployed as one service on Render.

---

## ✨ Key Features

### 📄 Resume Analysis Module
✅ **PDF & Text Upload** - Support for multiple file formats  
✅ **Skill Extraction** - AI-powered extraction of skills, experience, and certifications  
✅ **Profile Building** - Automatically creates a candidate profile  
✅ **Resume Management** - View, edit, and clear uploaded resumes  

### 🎯 Resume-JD Matching
✅ **Compatibility Scoring** - Overall match percentage (0-100%)  
✅ **Skill Matching** - Identifies matched and missing skills with visual badges  
✅ **ATS Score** - Evaluates how well your resume passes Applicant Tracking Systems  
✅ **Requirements Tracking** - Shows which job requirements are met/unmet  
✅ **Data Visualizations** - Bar charts and pie charts for easy understanding  
✅ **Detailed Breakdown** - Summary, strengths, gaps, and recommendations  

### 🔄 AI Resume Rewriting
✅ **Smart Rewriting** - AI generates optimized version of your resume  
✅ **JD-Focused** - Rewrites specifically target the job description keywords  
✅ **Download as TXT** - Download the rewritten resume as a text file  
✅ **Modal Preview** - Review before downloading  

### 🎤 Technical Interviews
✅ **Adaptive Questioning** - Question difficulty adjusts based on performance (EASY → MEDIUM → HARD)  
✅ **Time Management** - Enforces time limits with visual countdown  
✅ **Smart Evaluation** - AI-powered answer evaluation using semantic similarity  
✅ **Early Termination** - Stops after 3 consecutive failures  
✅ **Comprehensive Reports** - Final scores, strengths, weaknesses, and hiring readiness  

### 💻 Modern UI/UX
✅ **Professional Landing Page** - Beautiful hero section with navigation tabs  
✅ **Responsive Design** - Works perfectly on desktop, tablet, and mobile  
✅ **Light Theme** - Eye-friendly blue gradient design  
✅ **Intuitive Navigation** - Smooth routing between features  
✅ **Loading States** - Clear feedback during processing  

---

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern component-based UI
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first CSS framework
- **React Router v6** - Client-side routing
- **Recharts** - Beautiful data visualizations (bar charts, pie charts)
- **Lucide React** - Beautiful, consistent icons
- **pdfjs-dist** - Client-side PDF text extraction
- **Axios** - HTTP client for API calls

### Backend
- **Flask** - Lightweight Python web framework
- **Flask-CORS** - Cross-origin resource sharing
- **Groq API** - High-performance LLM inference (llama-3.3-70b-versatile)
- **NumPy & Scikit-learn** - Machine learning utilities for embeddings
- **Gunicorn** - Production WSGI server

### AI/ML
- **Groq LLM** - Fast, powerful language model for interview questions, resume analysis, and rewriting
- **Cosine Similarity** - Semantic answer evaluation
- **Word Embeddings** - Understanding resume and JD context

### Deployment
- **Render** - Cloud platform for deployment
- **GitHub** - Version control and CI/CD integration

---

## 📁 Project Structure

```
buildxhire/
│
├── app.py                          # Flask backend (main server)
├── requirements.txt                # Python dependencies
├── Procfile                        # Render deployment config
├── .gitignore                      # Git ignore rules
├── DEPLOYMENT.md                   # Detailed deployment guide
│
└── frontend/                       # React frontend
    ├── src/
    │   ├── components/
    │   │   ├── WelcomeScreen.jsx  # Landing page with tabs
    │   │   ├── CompareScreen.jsx  # Resume-JD comparison
    │   │   ├── SetupScreen.jsx    # Interview setup
    │   │   ├── InterviewScreen.jsx # Main interview interface
    │   │   └── SummaryScreen.jsx  # Results/report screen
    │   ├── services/
    │   │   └── api.js             # API service layer
    │   ├── contexts/              # React context for state
    │   ├── utils/                 # Utility functions
    │   ├── assets/                # Images and static files
    │   ├── App.jsx                # Main app router
    │   ├── main.jsx               # React entry point
    │   └── index.css              # Global styles
    ├── dist/                       # Built/compiled app (served by Flask)
    ├── package.json               # Node dependencies
    ├── vite.config.js             # Vite configuration
    └── tailwind.config.js         # Tailwind CSS config
```

---

## 🚀 Getting Started

### Prerequisites
- Python 3.8+
- Node.js 16+
- Groq API Key ([Get it free](https://console.groq.com))

### Installation

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd buildxhire

# 2. Install Python dependencies
python -m venv env
source env/bin/activate  # On Windows: env\Scripts\activate
pip install -r requirements.txt

# 3. Install Node dependencies
cd frontend
npm install
cd ..

# 4. Create .env file with your API key
echo "GROQ_API_KEY=your_actual_groq_api_key_here" > .env
```

### Running Locally

**Development Mode:**
```bash
# Terminal 1: Start Flask backend (runs on port 5000)
python app.py

# Terminal 2: Start React frontend (runs on port 3000)
cd frontend
npm run dev
```

Then open `http://localhost:3000` in your browser.

**Production Mode (like Render):**
```bash
# Build the frontend
cd frontend
npm run build
cd ..

# Run with Gunicorn
gunicorn app:app
```

---

## 📡 API Endpoints

### Resume Endpoints

**POST `/resume/analyze`**
- Analyzes an uploaded resume and extracts candidate profile
- Body: `{ "resume_text": "..." }`
- Returns: Extracted profile data (name, skills, experience, etc.)

**POST `/resume/match-jd`**
- Compares resume against a job description
- Body: `{ "resume_text": "...", "job_description": "..." }`
- Returns: Match percentage, skill breakdown, ATS score, met/unmet requirements

**POST `/resume/rewrite`**
- Generates an AI-optimized version of the resume for a job description
- Body: `{ "resume_text": "...", "job_description": "..." }`
- Returns: `{ "rewritten_resume": "..." }`

### Interview Endpoints

**POST `/interview/start`**
- Initiates a new interview session
- Body: `{ "candidate_profile": {...}, "job_description": "..." }`
- Returns: `{ "session_id": "...", "first_question": "..." }`

**GET `/interview/next-question`**
- Retrieves the next interview question
- Params: `?session_id=...&previous_answer=...&score=...`
- Returns: Next question with time limit and difficulty

**POST `/interview/answer`**
- Submits an answer and gets evaluation
- Body: `{ "session_id": "...", "answer": "..." }`
- Returns: Score, feedback, and whether to continue

**POST `/interview/end`**
- Ends the interview and generates final report
- Body: `{ "session_id": "..." }`
- Returns: Final report with scores, strengths, weaknesses, recommendations

### Utility Endpoints

**GET `/health`**
- Health check endpoint
- Returns: `{ "status": "ok" }`

---

## 💡 How It Works

### Interview Flow
1. User uploads resume or enters text
2. System extracts candidate profile
3. User enters job description
4. Interview begins with a random question
5. System evaluates each answer using semantic similarity
6. Question difficulty adapts based on performance
7. Interview stops after 3 fails or 10 questions
8. Final report generated with insights

### Resume-JD Matching Flow
1. User uploads resume and enters job description
2. Backend analyzes resume content and extracts skills
3. System matches resume skills against JD requirements
4. Calculates ATS compatibility score
5. Generates recommendations for improvement
6. AI rewrites resume if requested (optimized for JD)
7. User can download rewritten resume

---

## 🌐 Deployment to Render

### Quick Deploy Steps

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Go to Render Dashboard** - https://dashboard.render.com

3. **Create New Web Service**
   - Connect your GitHub repository
   - Set Name: `buildxhire`
   - Environment: `Python 3`
   - Build Command: `pip install -r requirements.txt && cd frontend && npm install && npm run build && cd ..`
   - Start Command: `gunicorn app:app`

4. **Add Environment Variables**
   - `GROQ_API_KEY`: Your Groq API key

5. **Deploy**
   - Click "Create Web Service"
   - Wait 3-5 minutes for build to complete
   - Get your live URL!

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment guide.

---

## 📊 What We've Built

### Phase 1: Resume Analysis ✅
- PDF/text upload support
- AI-powered skill extraction
- Candidate profile creation

### Phase 2: Resume-JD Comparison ✅
- Resume matching against job descriptions
- Skill gap analysis
- ATS score calculation
- Visual progress bars and charts

### Phase 3: Data Visualization ✅
- Bar charts for score distribution
- Pie charts for skill breakdown
- Color-coded badges (matched/missing skills)
- Professional UI with Tailwind CSS

### Phase 4: Resume Rewriting ✅
- AI-powered resume optimization
- Modal popup for preview
- Download as text file
- Content optimization for specific JDs

### Phase 5: Full-Stack Integration ✅
- React frontend built and integrated with Flask
- Single deployment process
- No CORS issues (same-origin serving)
- Production-ready configuration

### Phase 6: Deployment Ready ✅
- Procfile configured for Render
- Build scripts optimized
- Environment variables setup
- Gunicorn production server

---

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:
```
GROQ_API_KEY=your_groq_api_key_here
```

### Optional Configurations
- `PORT`: Server port (default: 5000, Render sets automatically)
- `DEBUG`: Flask debug mode (set to False in production)

---

## 📈 Performance & Optimization

- **Frontend**: Vite build produces optimized ~330KB gzipped JavaScript
- **Backend**: Groq API provides fast LLM inference (sub-second responses)
- **PDF Processing**: Client-side extraction reduces server load
- **Caching**: Session-based storage for interview data
- **Static Files**: Served directly by Flask with proper caching headers

---

## 🐛 Troubleshooting

### Common Issues

**Port already in use**
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9
```

**Module not found errors**
```bash
# Reinstall dependencies
pip install -r requirements.txt
cd frontend && npm install
```

**Build fails on Render**
- Check that frontend/dist is NOT in .gitignore (we use `!frontend/dist/` to include it)
- Verify all dependencies are listed in requirements.txt and package.json

**API endpoints returning 404**
- Ensure backend is running
- Check that API calls use correct endpoint paths
- Verify GROQ_API_KEY is set

---

## 📝 License

This project is open source and available under the MIT License.

---

## 👨‍💻 Creator

**Shivam Tawar**  
Built with ❤️ for the hackathon

- 🔗 LinkedIn: [shivam-tawar](https://linkedin.com/in/shivam-tawar)
- 💻 GitHub: [@shivamtawar](https://github.com/shivamtawar)
- 📧 Email: contact@shivamtawar.dev
