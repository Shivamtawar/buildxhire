import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { InterviewProvider, useInterview } from './contexts/InterviewContext'
import WelcomeScreen from './components/WelcomeScreen'
import SetupScreen from './components/SetupScreen'
import CompareScreen from './components/CompareScreen'
import InterviewScreen from './components/InterviewScreen'
import SummaryScreen from './components/SummaryScreen'

function AppContent() {
  const navigate = useNavigate()
  const location = useLocation()
  const { interviewData } = useInterview()

  // Clear localStorage when returning to home
  useEffect(() => {
    if (location.pathname === '/' || location.pathname === '') {
      localStorage.removeItem('currentRoute')
      localStorage.removeItem('interviewState')
    }
  }, [location.pathname])

  // Save current route to localStorage (but not for home)
  useEffect(() => {
    if (location.pathname !== '/' && location.pathname !== '') {
      localStorage.setItem('currentRoute', location.pathname)
    }
  }, [location.pathname])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Routes>
        <Route
          path="/"
          element={
            <WelcomeScreen
              onStart={() => navigate('/setup')}
              onCompare={() => navigate('/compare')}
            />
          }
        />
        <Route
          path="/compare"
          element={
            <CompareScreen
              onBack={() => navigate('/')}
              onHome={() => navigate('/')}
            />
          }
        />
        <Route
          path="/setup"
          element={
            <SetupScreen
              onStart={() => navigate('/interview')}
              onBack={() => {
                localStorage.removeItem('currentRoute')
                navigate('/')
              }}
            />
          }
        />
        <Route
          path="/interview"
          element={
            <InterviewScreen
              onComplete={() => navigate('/summary')}
              onExit={() => navigate('/summary')}
            />
          }
        />
        <Route
          path="/summary"
          element={
            <SummaryScreen
              onRestart={() => {
                localStorage.removeItem('currentRoute')
                localStorage.removeItem('interviewState')
                navigate('/setup')
              }}
              onHome={() => {
                localStorage.removeItem('currentRoute')
                localStorage.removeItem('interviewState')
                navigate('/')
              }}
            />
          }
        />
      </Routes>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <InterviewProvider>
        <AppContent />
      </InterviewProvider>
    </BrowserRouter>
  )
}

export default App
