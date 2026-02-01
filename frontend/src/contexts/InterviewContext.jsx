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
