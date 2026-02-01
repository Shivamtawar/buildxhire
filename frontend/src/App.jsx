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
