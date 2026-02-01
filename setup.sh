#!/bin/bash

# AI Interview Platform - Frontend Setup Script
# Run this script in your project root directory

echo "🚀 Setting up AI Interview Platform Frontend..."

# Create frontend directory structure
mkdir -p frontend/src/{components,contexts,services,utils,assets}
mkdir -p frontend/public

cd frontend

# Create package.json
cat > package.json << 'EOF'
{
  "name": "ai-interviewer-frontend",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "axios": "^1.6.2",
    "lucide-react": "^0.294.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32",
    "tailwindcss": "^3.3.6",
    "vite": "^5.0.8"
  }
}
EOF

# Create vite.config.js
cat > vite.config.js << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
EOF

# Create tailwind.config.js
cat > tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
        }
      }
    },
  },
  plugins: [],
}
EOF

# Create postcss.config.js
cat > postcss.config.js << 'EOF'
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF

# Create index.html
cat > index.html << 'EOF'
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>AI Interview Platform</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
EOF

# Create src/main.jsx
cat > src/main.jsx << 'EOF'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
EOF

# Create src/index.css
cat > src/index.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-gray-50 text-gray-900;
  }
}

@layer components {
  .btn-primary {
    @apply bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed;
  }
  
  .btn-secondary {
    @apply bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors;
  }
  
  .card {
    @apply bg-white rounded-xl shadow-lg p-6 border border-gray-200;
  }
  
  .input-field {
    @apply w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all;
  }
}
EOF

# Create src/App.jsx
cat > src/App.jsx << 'EOF'
import React, { useState } from 'react'
import { InterviewProvider } from './contexts/InterviewContext'
import WelcomeScreen from './components/WelcomeScreen'
import SetupScreen from './components/SetupScreen'
import InterviewScreen from './components/InterviewScreen'
import SummaryScreen from './components/SummaryScreen'

function App() {
  const [currentScreen, setCurrentScreen] = useState('welcome') // welcome, setup, interview, summary

  return (
    <InterviewProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {currentScreen === 'welcome' && (
          <WelcomeScreen onStart={() => setCurrentScreen('setup')} />
        )}
        {currentScreen === 'setup' && (
          <SetupScreen 
            onStart={() => setCurrentScreen('interview')}
            onBack={() => setCurrentScreen('welcome')}
          />
        )}
        {currentScreen === 'interview' && (
          <InterviewScreen 
            onComplete={() => setCurrentScreen('summary')}
            onExit={() => setCurrentScreen('summary')}
          />
        )}
        {currentScreen === 'summary' && (
          <SummaryScreen 
            onRestart={() => setCurrentScreen('setup')}
            onHome={() => setCurrentScreen('welcome')}
          />
        )}
      </div>
    </InterviewProvider>
  )
}

export default App
EOF

# Create src/contexts/InterviewContext.jsx
cat > src/contexts/InterviewContext.jsx << 'EOF'
import React, { createContext, useContext, useState } from 'react'

const InterviewContext = createContext()

export const useInterview = () => {
  const context = useContext(InterviewContext)
  if (!context) {
    throw new Error('useInterview must be used within InterviewProvider')
  }
  return context
}

export const InterviewProvider = ({ children }) => {
  const [candidateId, setCandidateId] = useState(null)
  const [sessionId, setSessionId] = useState(null)
  const [currentQuestion, setCurrentQuestion] = useState(null)
  const [difficulty, setDifficulty] = useState('EASY')
  const [questionCount, setQuestionCount] = useState(0)
  const [scores, setScores] = useState([])
  const [timeUsed, setTimeUsed] = useState(0)
  const [interviewData, setInterviewData] = useState(null)

  const resetInterview = () => {
    setCandidateId(null)
    setSessionId(null)
    setCurrentQuestion(null)
    setDifficulty('EASY')
    setQuestionCount(0)
    setScores([])
    setTimeUsed(0)
    setInterviewData(null)
  }

  const value = {
    candidateId,
    setCandidateId,
    sessionId,
    setSessionId,
    currentQuestion,
    setCurrentQuestion,
    difficulty,
    setDifficulty,
    questionCount,
    setQuestionCount,
    scores,
    setScores,
    timeUsed,
    setTimeUsed,
    interviewData,
    setInterviewData,
    resetInterview
  }

  return (
    <InterviewContext.Provider value={value}>
      {children}
    </InterviewContext.Provider>
  )
}
EOF

# Create src/services/api.js
cat > src/services/api.js << 'EOF'
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const analyzeResume = async (resumeText) => {
  const response = await api.post('/resume/analyze', { resume_text: resumeText })
  return response.data
}

export const startInterview = async (candidateId, jobDescription) => {
  const response = await api.post('/interview/start', {
    candidate_id: candidateId,
    job_description: jobDescription,
  })
  return response.data
}

export const submitAnswer = async (sessionId, question, answerText, timeTaken) => {
  const response = await api.post('/interview/answer', {
    session_id: sessionId,
    question,
    answer_text: answerText,
    time_taken: timeTaken,
  })
  return response.data
}

export const getNextQuestion = async (sessionId) => {
  const response = await api.get('/interview/next-question', {
    params: { session_id: sessionId },
  })
  return response.data
}

export const endInterview = async (sessionId) => {
  const response = await api.post('/interview/end', { session_id: sessionId })
  return response.data
}

export const getSessionStatus = async (sessionId) => {
  const response = await api.get(`/session/${sessionId}`)
  return response.data
}

export default api
EOF

# Create src/utils/speech.js
cat > src/utils/speech.js << 'EOF'
export class SpeechRecognitionService {
  constructor() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    this.recognition = SpeechRecognition ? new SpeechRecognition() : null
    
    if (this.recognition) {
      this.recognition.continuous = true
      this.recognition.interimResults = true
      this.recognition.lang = 'en-US'
    }
  }

  isSupported() {
    return this.recognition !== null
  }

  start(onResult, onEnd, onError) {
    if (!this.recognition) {
      onError?.('Speech recognition not supported')
      return
    }

    this.recognition.onresult = (event) => {
      let transcript = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript
      }
      onResult?.(transcript)
    }

    this.recognition.onend = () => {
      onEnd?.()
    }

    this.recognition.onerror = (event) => {
      onError?.(event.error)
    }

    this.recognition.start()
  }

  stop() {
    if (this.recognition) {
      this.recognition.stop()
    }
  }
}

export class TextToSpeechService {
  constructor() {
    this.synth = window.speechSynthesis
  }

  isSupported() {
    return 'speechSynthesis' in window
  }

  speak(text, onEnd) {
    if (!this.isSupported()) return

    this.synth.cancel() // Cancel any ongoing speech

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.9
    utterance.pitch = 1
    utterance.volume = 1

    if (onEnd) {
      utterance.onend = onEnd
    }

    this.synth.speak(utterance)
  }

  stop() {
    if (this.synth) {
      this.synth.cancel()
    }
  }
}
EOF

# Create src/components/WelcomeScreen.jsx
cat > src/components/WelcomeScreen.jsx << 'EOF'
import React from 'react'
import { Sparkles, Brain, Target } from 'lucide-react'

const WelcomeScreen = ({ onStart }) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-4xl w-full text-center">
        <div className="mb-8 flex justify-center">
          <div className="bg-primary-100 p-6 rounded-full">
            <Brain className="w-16 h-16 text-primary-600" />
          </div>
        </div>

        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
          AI Interview Platform
        </h1>
        
        <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
          Experience the future of technical interviews. Get real-time feedback, 
          adaptive questions, and comprehensive evaluation powered by advanced AI.
        </p>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="card hover:shadow-xl transition-shadow">
            <Sparkles className="w-12 h-12 text-primary-600 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">AI-Powered</h3>
            <p className="text-gray-600 text-sm">
              Smart question generation based on your profile and job requirements
            </p>
          </div>

          <div className="card hover:shadow-xl transition-shadow">
            <Target className="w-12 h-12 text-primary-600 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">Adaptive Difficulty</h3>
            <p className="text-gray-600 text-sm">
              Questions adjust in real-time based on your performance
            </p>
          </div>

          <div className="card hover:shadow-xl transition-shadow">
            <Brain className="w-12 h-12 text-primary-600 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">Instant Feedback</h3>
            <p className="text-gray-600 text-sm">
              Get detailed evaluation and insights after each answer
            </p>
          </div>
        </div>

        <button
          onClick={onStart}
          className="btn-primary text-lg px-12 py-4 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
        >
          Start Interview
        </button>

        <p className="mt-6 text-sm text-gray-500">
          No login required • Free to use • Takes about 20-30 minutes
        </p>
      </div>
    </div>
  )
}

export default WelcomeScreen
EOF

# Create src/components/SetupScreen.jsx  
cat > src/components/SetupScreen.jsx << 'EOF'
import React, { useState } from 'react'
import { Upload, FileText, Briefcase, Loader2, ChevronLeft } from 'lucide-react'
import { analyzeResume, startInterview } from '../services/api'
import { useInterview } from '../contexts/InterviewContext'

const SetupScreen = ({ onStart, onBack }) => {
  const [resumeText, setResumeText] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(1) // 1: resume, 2: job desc
  const { setCandidateId, setSessionId, setCurrentQuestion, setDifficulty } = useInterview()

  const handleResumeSubmit = async () => {
    if (!resumeText.trim()) {
      setError('Please enter your resume')
      return
    }

    setLoading(true)
    setError('')

    try {
      const data = await analyzeResume(resumeText)
      setCandidateId(data.candidate_id)
      setStep(2)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to analyze resume')
    } finally {
      setLoading(false)
    }
  }

  const handleStartInterview = async () => {
    if (!jobDescription.trim()) {
      setError('Please enter job description')
      return
    }

    setLoading(true)
    setError('')

    try {
      const data = await startInterview(
        JSON.parse(sessionStorage.getItem('candidateId')),
        jobDescription
      )
      
      setSessionId(data.session_id)
      setCurrentQuestion(data.first_question)
      setDifficulty(data.difficulty)
      
      sessionStorage.setItem('sessionId', data.session_id)
      onStart()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to start interview')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-3xl w-full">
        <button
          onClick={onBack}
          className="mb-6 flex items-center text-gray-600 hover:text-gray-900"
        >
          <ChevronLeft className="w-5 h-5" />
          Back
        </button>

        <div className="card">
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center ${step >= 1 ? 'text-primary-600' : 'text-gray-400'}`}>
                <div className="w-8 h-8 rounded-full bg-current bg-opacity-20 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <span className="ml-2 font-medium">Resume</span>
              </div>
              <div className="w-16 h-0.5 bg-gray-300"></div>
              <div className={`flex items-center ${step >= 2 ? 'text-primary-600' : 'text-gray-400'}`}>
                <div className="w-8 h-8 rounded-full bg-current bg-opacity-20 flex items-center justify-center">
                  <Briefcase className="w-4 h-4" />
                </div>
                <span className="ml-2 font-medium">Job Role</span>
              </div>
            </div>
          </div>

          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold mb-2">Upload Your Resume</h2>
              <p className="text-gray-600 mb-6">
                Paste your resume text below. We'll analyze your skills and experience.
              </p>

              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste your resume here... (Name, Experience, Skills, Projects, Education)"
                className="input-field min-h-[300px] font-mono text-sm"
              />

              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-900">
                  <strong>Tip:</strong> Include your work experience, technical skills, projects, and education for best results.
                </p>
              </div>

              {error && (
                <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg">
                  {error}
                </div>
              )}

              <button
                onClick={handleResumeSubmit}
                disabled={loading || !resumeText.trim()}
                className="btn-primary w-full mt-6"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="animate-spin mr-2" />
                    Analyzing Resume...
                  </span>
                ) : (
                  'Continue'
                )}
              </button>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold mb-2">Job Description</h2>
              <p className="text-gray-600 mb-6">
                Paste the job description you're interviewing for. Questions will be tailored to this role.
              </p>

              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste job description here... (Required skills, responsibilities, qualifications)"
                className="input-field min-h-[300px]"
              />

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm font-semibold text-green-900 mb-1">
                    Include:
                  </p>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>• Required skills</li>
                    <li>• Responsibilities</li>
                    <li>• Experience level</li>
                  </ul>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <p className="text-sm font-semibold text-purple-900 mb-1">
                    We'll assess:
                  </p>
                  <ul className="text-sm text-purple-800 space-y-1">
                    <li>• Technical knowledge</li>
                    <li>• Problem-solving</li>
                    <li>• Job fit</li>
                  </ul>
                </div>
              </div>

              {error && (
                <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg">
                  {error}
                </div>
              )}

              <div className="flex space-x-4 mt-6">
                <button
                  onClick={() => setStep(1)}
                  className="btn-secondary flex-1"
                  disabled={loading}
                >
                  Back
                </button>
                <button
                  onClick={handleStartInterview}
                  disabled={loading || !jobDescription.trim()}
                  className="btn-primary flex-1"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <Loader2 className="animate-spin mr-2" />
                      Starting Interview...
                    </span>
                  ) : (
                    'Start Interview'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SetupScreen
EOF

# Create src/components/InterviewScreen.jsx
cat > src/components/InterviewScreen.jsx << 'EOF'
import React, { useState, useEffect, useRef } from 'react'
import { 
  Mic, MicOff, Send, Loader2, Clock, 
  AlertCircle, Volume2, VolumeX, CircleDot 
} from 'lucide-react'
import { submitAnswer, getNextQuestion, endInterview } from '../services/api'
import { useInterview } from '../contexts/InterviewContext'
import { SpeechRecognitionService, TextToSpeechService } from '../utils/speech'

const InterviewScreen = ({ onComplete, onExit }) => {
  const {
    sessionId,
    currentQuestion,
    setCurrentQuestion,
    difficulty,
    setDifficulty,
    questionCount,
    setQuestionCount,
    scores,
    setScores,
    setInterviewData
  } = useInterview()

  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [questionTime, setQuestionTime] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [showExitModal, setShowExitModal] = useState(false)

  const speechRecognition = useRef(new SpeechRecognitionService())
  const textToSpeech = useRef(new TextToSpeechService())
  const timerRef = useRef(null)
  const questionTimerRef = useRef(null)

  useEffect(() => {
    // Start interview timer
    timerRef.current = setInterval(() => {
      setTimeElapsed(prev => prev + 1)
    }, 1000)

    // Start question timer
    questionTimerRef.current = setInterval(() => {
      setQuestionTime(prev => prev + 1)
    }, 1000)

    return () => {
      clearInterval(timerRef.current)
      clearInterval(questionTimerRef.current)
      speechRecognition.current?.stop()
      textToSpeech.current?.stop()
    }
  }, [])

  useEffect(() => {
    // Reset question timer when question changes
    setQuestionTime(0)
    setFeedback(null)
    setAnswer('')
  }, [currentQuestion])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getDifficultyColor = (diff) => {
    switch (diff) {
      case 'EASY': return 'bg-green-100 text-green-700'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-700'
      case 'HARD': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const handleVoiceToggle = () => {
    if (isRecording) {
      speechRecognition.current.stop()
      setIsRecording(false)
    } else {
      speechRecognition.current.start(
        (transcript) => {
          setAnswer(transcript)
        },
        () => {
          setIsRecording(false)
        },
        (error) => {
          console.error('Speech recognition error:', error)
          setIsRecording(false)
          alert('Voice input failed. Please check microphone permissions.')
        }
      )
      setIsRecording(true)
    }
  }

  const handleSpeakQuestion = () => {
    if (isSpeaking) {
      textToSpeech.current.stop()
      setIsSpeaking(false)
    } else {
      setIsSpeaking(true)
      textToSpeech.current.speak(currentQuestion, () => {
        setIsSpeaking(false)
      })
    }
  }

  const handleSubmitAnswer = async () => {
    if (!answer.trim()) {
      alert('Please provide an answer')
      return
    }

    setLoading(true)
    clearInterval(questionTimerRef.current)

    try {
      const data = await submitAnswer(
        sessionId,
        currentQuestion,
        answer,
        questionTime
      )

      setFeedback({
        score: data.score,
        feedback: data.feedback,
        status: data.status
      })

      setScores([...scores, data.score])
      setQuestionCount(questionCount + 1)
      setDifficulty(data.next_difficulty)

      // Auto-fetch next question after 3 seconds
      setTimeout(async () => {
        if (data.status === 'TERMINATED') {
          handleEndInterview()
        } else if (data.questions_remaining > 0) {
          try {
            const nextData = await getNextQuestion(sessionId)
            setCurrentQuestion(nextData.question)
            setFeedback(null)
            setAnswer('')
            questionTimerRef.current = setInterval(() => {
              setQuestionTime(prev => prev + 1)
            }, 1000)
          } catch (err) {
            console.error('Error fetching next question:', err)
            handleEndInterview()
          }
        } else {
          handleEndInterview()
        }
      }, 3000)

    } catch (err) {
      alert(err.response?.data?.error || 'Failed to submit answer')
    } finally {
      setLoading(false)
    }
  }

  const handleEndInterview = async () => {
    try {
      const data = await endInterview(sessionId)
      setInterviewData(data)
      onComplete()
    } catch (err) {
      console.error('Error ending interview:', err)
      onExit()
    }
  }

  return (
    <div className="min-h-screen p-4">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="card flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div>
              <span className="text-sm text-gray-600">Time Elapsed</span>
              <div className="flex items-center text-2xl font-bold text-primary-600">
                <Clock className="w-5 h-5 mr-2" />
                {formatTime(timeElapsed)}
              </div>
            </div>
            <div className="h-12 w-px bg-gray-300"></div>
            <div>
              <span className="text-sm text-gray-600">Questions</span>
              <div className="text-2xl font-bold">{questionCount}/10</div>
            </div>
            <div className="h-12 w-px bg-gray-300"></div>
            <div>
              <span className="text-sm text-gray-600">Difficulty</span>
              <div className={`px-3 py-1 rounded-full font-semibold text-sm ${getDifficultyColor(difficulty)}`}>
                {difficulty}
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowExitModal(true)}
            className="btn-secondary"
          >
            End Interview
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-6">
        {/* Left: Question */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Question {questionCount + 1}</h2>
            <button
              onClick={handleSpeakQuestion}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {isSpeaking ? (
                <VolumeX className="w-5 h-5 text-primary-600" />
              ) : (
                <Volume2 className="w-5 h-5 text-gray-600" />
              )}
            </button>
          </div>

          <div className="bg-gradient-to-br from-primary-50 to-purple-50 p-6 rounded-lg mb-4">
            <p className="text-lg leading-relaxed">{currentQuestion}</p>
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <Clock className="w-4 h-4 mr-2" />
            Time on question: {formatTime(questionTime)}
          </div>

          {feedback && (
            <div className={`mt-6 p-4 rounded-lg ${
              feedback.score >= 70 ? 'bg-green-50' : 
              feedback.score >= 50 ? 'bg-yellow-50' : 
              'bg-red-50'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">Your Score</span>
                <span className="text-2xl font-bold">{feedback.score}/100</span>
              </div>
              <p className="text-sm text-gray-700">{feedback.feedback}</p>
            </div>
          )}
        </div>

        {/* Right: Answer Input */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Your Answer</h2>

          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your answer here or use voice input..."
            className="input-field min-h-[300px] mb-4"
            disabled={loading || feedback !== null}
          />

          <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
            <span>{answer.length} characters</span>
            {isRecording && (
              <span className="flex items-center text-red-600 animate-pulse">
                <CircleDot className="w-4 h-4 mr-1" />
                Recording...
              </span>
            )}
          </div>

          <div className="flex space-x-4">
            <button
              onClick={handleVoiceToggle}
              disabled={loading || feedback !== null}
              className={`flex-1 flex items-center justify-center px-6 py-3 rounded-lg font-semibold transition-colors ${
                isRecording 
                  ? 'bg-red-600 text-white hover:bg-red-700' 
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              } disabled:opacity-50`}
            >
              {isRecording ? (
                <>
                  <MicOff className="w-5 h-5 mr-2" />
                  Stop Recording
                </>
              ) : (
                <>
                  <Mic className="w-5 h-5 mr-2" />
                  Voice Input
                </>
              )}
            </button>

            <button
              onClick={handleSubmitAnswer}
              disabled={loading || !answer.trim() || feedback !== null}
              className="btn-primary flex-1 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin w-5 h-5 mr-2" />
                  Evaluating...
                </>
              ) : feedback ? (
                'Next Question...'
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Submit Answer
                </>
              )}
            </button>
          </div>

          {!speechRecognition.current.isSupported() && (
            <div className="mt-4 p-3 bg-yellow-50 rounded-lg flex items-start">
              <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-800">
                Voice input is not supported in your browser. Please use text input.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Exit Modal */}
      {showExitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-2">End Interview?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to end the interview? Your progress will be saved and you'll see your final report.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowExitModal(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleEndInterview}
                className="btn-primary flex-1"
              >
                End Interview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default InterviewScreen
EOF

# Create src/components/SummaryScreen.jsx
cat > src/components/SummaryScreen.jsx << 'EOF'
import React from 'react'
import { CheckCircle, XCircle, TrendingUp, TrendingDown, Award, Home, RotateCcw } from 'lucide-react'
import { useInterview } from '../contexts/InterviewContext'

const SummaryScreen = ({ onRestart, onHome }) => {
  const { interviewData, resetInterview } = useInterview()

  if (!interviewData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No interview data available</p>
          <button onClick={onHome} className="btn-primary mt-4">
            Go Home
          </button>
        </div>
      </div>
    )
  }

  const {
    final_score,
    category,
    strengths,
    weaknesses,
    hiring_readiness,
    total_questions,
    total_time,
    score_breakdown
  } = interviewData

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  const getCategoryColor = (cat) => {
    switch (cat) {
      case 'STRONG': return 'text-green-600'
      case 'GOOD': return 'text-blue-600'
      case 'AVERAGE': return 'text-yellow-600'
      case 'WEAK': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const handleRestart = () => {
    resetInterview()
    onRestart()
  }

  return (
    <div className="min-h-screen p-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block mb-4">
            {hiring_readiness === 'YES' ? (
              <div className="bg-green-100 p-4 rounded-full">
                <Award className="w-12 h-12 text-green-600" />
              </div>
            ) : (
              <div className="bg-yellow-100 p-4 rounded-full">
                <Award className="w-12 h-12 text-yellow-600" />
              </div>
            )}
          </div>
          <h1 className="text-4xl font-bold mb-2">Interview Complete!</h1>
          <p className="text-gray-600">Here's your comprehensive performance report</p>
        </div>

        {/* Score Card */}
        <div className="card mb-6 text-center">
          <div className="mb-4">
            <div className={`text-6xl font-bold ${getCategoryColor(category)}`}>
              {final_score}
            </div>
            <div className="text-gray-600 mt-2">Final Score</div>
          </div>
          <div className={`inline-block px-6 py-2 rounded-full text-lg font-semibold ${
            category === 'STRONG' ? 'bg-green-100 text-green-700' :
            category === 'GOOD' ? 'bg-blue-100 text-blue-700' :
            category === 'AVERAGE' ? 'bg-yellow-100 text-yellow-700' :
            'bg-red-100 text-red-700'
          }`}>
            {category}
          </div>
          <div className="mt-4 text-lg">
            {hiring_readiness === 'YES' && (
              <span className="text-green-600 font-semibold">✓ Recommended for Hiring</span>
            )}
            {hiring_readiness === 'MAYBE' && (
              <span className="text-yellow-600 font-semibold">⚠ Conditional Recommendation</span>
            )}
            {hiring_readiness === 'NO' && (
              <span className="text-red-600 font-semibold">✗ Not Recommended</span>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="card text-center">
            <div className="text-3xl font-bold text-primary-600">{total_questions}</div>
            <div className="text-sm text-gray-600 mt-1">Questions Answered</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-primary-600">{formatTime(total_time)}</div>
            <div className="text-sm text-gray-600 mt-1">Total Time</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-primary-600">
              {Math.round((total_questions / 10) * 100)}%
            </div>
            <div className="text-sm text-gray-600 mt-1">Completion Rate</div>
          </div>
        </div>

        {/* Score Breakdown */}
        {(score_breakdown.EASY.length > 0 || score_breakdown.MEDIUM.length > 0 || score_breakdown.HARD.length > 0) && (
          <div className="card mb-6">
            <h3 className="text-xl font-bold mb-4">Score Breakdown by Difficulty</h3>
            <div className="space-y-4">
              {score_breakdown.EASY.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-green-600">Easy Questions</span>
                    <span className="text-sm text-gray-600">{score_breakdown.EASY.length} questions</span>
                  </div>
                  <div className="flex gap-2">
                    {score_breakdown.EASY.map((score, idx) => (
                      <div
                        key={idx}
                        className={`flex-1 h-8 rounded flex items-center justify-center text-white text-sm font-semibold ${
                          score >= 70 ? 'bg-green-500' : score >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                      >
                        {Math.round(score)}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {score_breakdown.MEDIUM.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-yellow-600">Medium Questions</span>
                    <span className="text-sm text-gray-600">{score_breakdown.MEDIUM.length} questions</span>
                  </div>
                  <div className="flex gap-2">
                    {score_breakdown.MEDIUM.map((score, idx) => (
                      <div
                        key={idx}
                        className={`flex-1 h-8 rounded flex items-center justify-center text-white text-sm font-semibold ${
                          score >= 70 ? 'bg-green-500' : score >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                      >
                        {Math.round(score)}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {score_breakdown.HARD.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-red-600">Hard Questions</span>
                    <span className="text-sm text-gray-600">{score_breakdown.HARD.length} questions</span>
                  </div>
                  <div className="flex gap-2">
                    {score_breakdown.HARD.map((score, idx) => (
                      <div
                        key={idx}
                        className={`flex-1 h-8 rounded flex items-center justify-center text-white text-sm font-semibold ${
                          score >= 70 ? 'bg-green-500' : score >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                      >
                        {Math.round(score)}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Strengths & Weaknesses */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center mb-4">
              <TrendingUp className="w-6 h-6 text-green-600 mr-2" />
              <h3 className="text-xl font-bold">Strengths</h3>
            </div>
            <ul className="space-y-3">
              {strengths.map((strength, idx) => (
                <li key={idx} className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{strength}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="card">
            <div className="flex items-center mb-4">
              <TrendingDown className="w-6 h-6 text-yellow-600 mr-2" />
              <h3 className="text-xl font-bold">Areas for Improvement</h3>
            </div>
            <ul className="space-y-3">
              {weaknesses.map((weakness, idx) => (
                <li key={idx} className="flex items-start">
                  <XCircle className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{weakness}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleRestart}
            className="btn-primary flex items-center justify-center"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Take Another Interview
          </button>
          <button
            onClick={() => {
              resetInterview()
              onHome()
            }}
            className="btn-secondary flex items-center justify-center"
          >
            <Home className="w-5 h-5 mr-2" />
            Back to Home
          </button>
        </div>
      </div>
    </div>
  )
}

export default SummaryScreen
EOF

# Create .gitignore
cat > .gitignore << 'EOF'
# Dependencies
node_modules/

# Build outputs
dist/
build/

# Environment variables
.env
.env.local
.env.production

# Editor
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
EOF

# Create README
cat > README.md << 'EOF'
# AI Interview Platform - Frontend

React frontend for the AI-powered interview platform.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Backend Setup

Make sure the Flask backend is running on `http://localhost:5000`

## Features

- Resume analysis
- Adaptive interview questions
- Voice input support
- Text-to-speech questions
- Real-time feedback
- Comprehensive summary report

## Tech Stack

- React 18
- Vite
- Tailwind CSS
- Axios
- Lucide Icons
- Web Speech API
EOF

cd ..

echo ""
echo "✅ Frontend setup complete!"
echo ""
echo "📂 Next steps:"
echo "1. cd frontend"
echo "2. npm install"
echo "3. npm run dev"
echo ""
echo "🚀 Frontend will run on: http://localhost:3000"
echo "🔌 Make sure backend is running on: http://localhost:5000"
echo ""