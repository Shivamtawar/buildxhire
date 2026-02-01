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
