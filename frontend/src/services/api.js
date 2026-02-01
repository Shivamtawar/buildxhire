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

export const analyzeMatch = async (resumeText, jobDescription) => {
  const response = await api.post('/resume/match-jd', {
    resume_text: resumeText,
    job_description: jobDescription,
  })
  return response.data
}

export const startInterview = async (candidateId, jobDescription) => {
  const response = await api.post('/interview/start', {
    candidate_id: candidateId,
    job_description: jobDescription,
  })
  return response.data
}

export const submitAnswer = async (sessionId, question, answerText, timeTaken, isCodingQuestion = false) => {
  const response = await api.post('/interview/answer', {
    session_id: sessionId,
    question,
    answer_text: answerText,
    time_taken: timeTaken,
    is_coding_question: isCodingQuestion,
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

export const executeCode = async (code, language) => {
  const response = await api.post('/code/execute', {
    code,
    language,
  })
  return response.data
}

export default api
