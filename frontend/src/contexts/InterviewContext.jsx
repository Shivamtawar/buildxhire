import React, { createContext, useContext, useState, useEffect } from 'react'

const InterviewContext = createContext()

export const useInterview = () => {
  const context = useContext(InterviewContext)
  if (!context) {
    throw new Error('useInterview must be used within InterviewProvider')
  }
  return context
}

const STORAGE_KEY = 'interviewState'

export const InterviewProvider = ({ children }) => {
  const [candidateId, setCandidateId] = useState(null)
  const [sessionId, setSessionId] = useState(null)
  const [currentQuestion, setCurrentQuestion] = useState(null)
  const [difficulty, setDifficulty] = useState('EASY')
  const [questionCount, setQuestionCount] = useState(0)
  const [scores, setScores] = useState([])
  const [timeUsed, setTimeUsed] = useState(0)
  const [interviewData, setInterviewData] = useState(null)
  const [jobDescription, setJobDescription] = useState(null)
  const [resumeText, setResumeText] = useState(null)
  const [candidateProfile, setCandidateProfile] = useState(null)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem(STORAGE_KEY)
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState)
        setCandidateId(parsed.candidateId)
        setSessionId(parsed.sessionId)
        setCurrentQuestion(parsed.currentQuestion)
        setDifficulty(parsed.difficulty || 'EASY')
        setQuestionCount(parsed.questionCount || 0)
        setScores(parsed.scores || [])
        setTimeUsed(parsed.timeUsed || 0)
        setInterviewData(parsed.interviewData)
        setJobDescription(parsed.jobDescription)
        setResumeText(parsed.resumeText)
        setCandidateProfile(parsed.candidateProfile)
      } catch (error) {
        console.error('Failed to restore interview state:', error)
        localStorage.removeItem(STORAGE_KEY)
      }
    }
    setIsLoaded(true)
  }, [])

  // Save state to localStorage whenever any state changes
  const saveState = (updates = {}) => {
    const state = {
      candidateId: updates.candidateId ?? candidateId,
      sessionId: updates.sessionId ?? sessionId,
      currentQuestion: updates.currentQuestion ?? currentQuestion,
      difficulty: updates.difficulty ?? difficulty,
      questionCount: updates.questionCount ?? questionCount,
      scores: updates.scores ?? scores,
      timeUsed: updates.timeUsed ?? timeUsed,
      interviewData: updates.interviewData ?? interviewData,
      jobDescription: updates.jobDescription ?? jobDescription,
      resumeText: updates.resumeText ?? resumeText,
      candidateProfile: updates.candidateProfile ?? candidateProfile
    }

    // Only save if there's actual interview data
    if (state.candidateId || state.sessionId || state.interviewData) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    }
  }

  // Create wrapper functions that save state after updating
  const handleSetCandidateId = (value) => {
    setCandidateId(value)
    saveState({ candidateId: value })
  }

  const handleSetSessionId = (value) => {
    setSessionId(value)
    saveState({ sessionId: value })
  }

  const handleSetCurrentQuestion = (value) => {
    setCurrentQuestion(value)
    saveState({ currentQuestion: value })
  }

  const handleSetDifficulty = (value) => {
    setDifficulty(value)
    saveState({ difficulty: value })
  }

  const handleSetQuestionCount = (value) => {
    setQuestionCount(value)
    saveState({ questionCount: value })
  }

  const handleSetScores = (value) => {
    setScores(value)
    saveState({ scores: value })
  }

  const handleSetTimeUsed = (value) => {
    setTimeUsed(value)
    saveState({ timeUsed: value })
  }

  const handleSetInterviewData = (value) => {
    setInterviewData(value)
    saveState({ interviewData: value })
  }

  const handleSetJobDescription = (value) => {
    setJobDescription(value)
    saveState({ jobDescription: value })
  }

  const handleSetResumeText = (value) => {
    setResumeText(value)
    saveState({ resumeText: value })
  }

  const handleSetCandidateProfile = (value) => {
    setCandidateProfile(value)
    saveState({ candidateProfile: value })
  }

  const resetInterview = () => {
    setCandidateId(null)
    setSessionId(null)
    setCurrentQuestion(null)
    setDifficulty('EASY')
    setQuestionCount(0)
    setScores([])
    setTimeUsed(0)
    setInterviewData(null)
    setJobDescription(null)
    setResumeText(null)
    setCandidateProfile(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  const value = {
    candidateId,
    setCandidateId: handleSetCandidateId,
    sessionId,
    setSessionId: handleSetSessionId,
    currentQuestion,
    setCurrentQuestion: handleSetCurrentQuestion,
    difficulty,
    setDifficulty: handleSetDifficulty,
    questionCount,
    setQuestionCount: handleSetQuestionCount,
    scores,
    setScores: handleSetScores,
    timeUsed,
    setTimeUsed: handleSetTimeUsed,
    interviewData,
    setInterviewData: handleSetInterviewData,
    jobDescription,
    setJobDescription: handleSetJobDescription,
    resumeText,
    setResumeText: handleSetResumeText,
    candidateProfile,
    setCandidateProfile: handleSetCandidateProfile,
    isLoaded,
    resetInterview
  }

  return (
    <InterviewContext.Provider value={value}>
      {children}
    </InterviewContext.Provider>
  )
}
