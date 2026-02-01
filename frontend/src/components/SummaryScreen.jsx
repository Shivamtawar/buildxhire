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
