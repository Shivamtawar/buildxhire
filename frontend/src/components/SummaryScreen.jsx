import React, { useState, useEffect } from 'react'
import { CheckCircle, XCircle, TrendingUp, TrendingDown, Award, Home, RotateCcw, AlertCircle, Lightbulb, FileText, Zap, Loader } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useInterview } from '../contexts/InterviewContext'
import api from '../services/api'

const SummaryScreen = ({ onRestart, onHome }) => {
  const { interviewData, resetInterview, candidateId, jobDescription, resumeText } = useInterview()

  // Tab state
  const [activeTab, setActiveTab] = useState('interview')

  // Resume matching state
  const [matchingData, setMatchingData] = useState(null)
  const [loadingMatch, setLoadingMatch] = useState(false)
  const [matchError, setMatchError] = useState(null)

  // Auto-analyze resume when Resume tab is clicked
  useEffect(() => {
    if (activeTab === 'resume' && !matchingData && !loadingMatch) {
      handleAnalyzeResume()
    }
  }, [activeTab])

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

  const handleAnalyzeResume = async () => {
    try {
      setLoadingMatch(true)
      setMatchError(null)

      if (!resumeText || !jobDescription) {
        setMatchError('Resume or Job Description is missing')
        setLoadingMatch(false)
        return
      }

      const response = await api.post('/resume/match-jd', {
        resume_text: resumeText,
        job_description: jobDescription,
        candidate_id: candidateId
      })

      setMatchingData(response.data)
    } catch (error) {
      console.error('Resume matching error:', error)
      console.error('Error details:', error.response?.data || error.message)
      setMatchError(error.response?.data?.error || 'Failed to analyze resume. Please try again.')
    } finally {
      setLoadingMatch(false)
    }
  }

  const generateApplicationRecommendation = () => {
    let recommendation = {
      shouldApply: 'MAYBE',
      confidence: 0,
      reasoning: [],
      riskLevel: 'MEDIUM'
    }

    if (final_score >= 75) {
      recommendation.shouldApply = 'YES'
      recommendation.confidence = 95
      recommendation.reasoning = [
        'Excellent performance score',
        'Strong technical knowledge demonstrated',
        'High job fit indicated'
      ]
      recommendation.riskLevel = 'LOW'
    } else if (final_score >= 60) {
      recommendation.shouldApply = 'YES'
      recommendation.confidence = 70
      recommendation.reasoning = [
        'Good performance overall',
        'Most key skills aligned with role',
        'Some minor gaps that can be addressed'
      ]
      recommendation.riskLevel = 'LOW'
    } else if (final_score >= 50) {
      recommendation.shouldApply = 'MAYBE'
      recommendation.confidence = 50
      recommendation.reasoning = [
        'Average performance score',
        'Basic competencies demonstrated',
        'Significant skill gaps identified',
        'Would benefit from targeted preparation'
      ]
      recommendation.riskLevel = 'MEDIUM'
    } else {
      recommendation.shouldApply = 'NO'
      recommendation.confidence = 80
      recommendation.reasoning = [
        'Performance below threshold',
        'Significant skill gaps',
        'Job requirements not adequately met',
        'Recommend further preparation before applying'
      ]
      recommendation.riskLevel = 'HIGH'
    }

    return recommendation
  }

  const generateFocusAreas = () => {
    const focusAreas = []

    if (final_score < 70) {
      if (weaknesses) {
        focusAreas.push({
          priority: 'HIGH',
          topic: 'Core Competencies',
          description: weaknesses[0] || 'Technical fundamentals',
          timeEstimate: '2-4 weeks'
        })

        if (weaknesses.length > 1) {
          focusAreas.push({
            priority: 'MEDIUM',
            topic: 'Advanced Concepts',
            description: weaknesses[1] || 'Advanced topics',
            timeEstimate: '3-5 weeks'
          })
        }
      }
    }

    if (score_breakdown && score_breakdown.HARD && score_breakdown.HARD.length > 0) {
      const hardAverage = score_breakdown.HARD.reduce((a, b) => a + b, 0) / score_breakdown.HARD.length
      if (hardAverage < 60) {
        focusAreas.push({
          priority: 'HIGH',
          topic: 'System Design & Architecture',
          description: 'Complex problem-solving and system architecture',
          timeEstimate: '3-6 weeks'
        })
      }
    }

    if (score_breakdown && score_breakdown.MEDIUM && score_breakdown.MEDIUM.length > 0) {
      const mediumAverage = score_breakdown.MEDIUM.reduce((a, b) => a + b, 0) / score_breakdown.MEDIUM.length
      if (mediumAverage < 65) {
        focusAreas.push({
          priority: 'MEDIUM',
          topic: 'Practical Application & Problem-Solving',
          description: 'Real-world problem solving and implementation skills',
          timeEstimate: '2-3 weeks'
        })
      }
    }

    if (focusAreas.length === 0) {
      focusAreas.push({
        priority: 'LOW',
        topic: 'Continuous Learning',
        description: 'Keep up with latest technologies and best practices',
        timeEstimate: 'Ongoing'
      })
    }

    return focusAreas
  }

  const prepareChartData = () => {
    const difficultyStats = {
      EASY: score_breakdown?.EASY?.length || 0,
      MEDIUM: score_breakdown?.MEDIUM?.length || 0,
      HARD: score_breakdown?.HARD?.length || 0
    }

    const difficultyAverage = {
      EASY: score_breakdown?.EASY?.length > 0
        ? (score_breakdown.EASY.reduce((a, b) => a + b, 0) / score_breakdown.EASY.length).toFixed(1)
        : 0,
      MEDIUM: score_breakdown?.MEDIUM?.length > 0
        ? (score_breakdown.MEDIUM.reduce((a, b) => a + b, 0) / score_breakdown.MEDIUM.length).toFixed(1)
        : 0,
      HARD: score_breakdown?.HARD?.length > 0
        ? (score_breakdown.HARD.reduce((a, b) => a + b, 0) / score_breakdown.HARD.length).toFixed(1)
        : 0
    }

    return { difficultyStats, difficultyAverage }
  }

  return (
    <div className="min-h-screen p-4 py-12 bg-gradient-to-b from-gray-50 to-white">
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

        {/* Tab Navigation */}
        <div className="flex gap-0 mb-8 border-b-2 border-gray-200 bg-white rounded-t-lg">
          <button
            onClick={() => setActiveTab('interview')}
            className={`flex-1 py-4 px-6 font-semibold text-center transition-all ${activeTab === 'interview'
              ? 'border-b-4 border-primary-600 text-primary-600 bg-primary-50'
              : 'text-gray-600 hover:text-gray-800'
              }`}
          >
            📊 Interview Results
          </button>
          <button
            onClick={() => setActiveTab('resume')}
            className={`flex-1 py-4 px-6 font-semibold text-center transition-all ${activeTab === 'resume'
              ? 'border-b-4 border-primary-600 text-primary-600 bg-primary-50'
              : 'text-gray-600 hover:text-gray-800'
              }`}
          >
            📄 Resume Analysis
          </button>
        </div>

        {/* Interview Tab Content */}
        {activeTab === 'interview' && (
          <div className="space-y-6">
            {/* Score Card */}
            <div className="card mb-6 text-center">
              <div className="mb-4">
                <div className={`text-6xl font-bold ${getCategoryColor(category)}`}>
                  {final_score}
                </div>
                <div className="text-gray-600 mt-2">Final Score</div>
              </div>
              <div className={`inline-block px-6 py-2 rounded-full text-lg font-semibold ${category === 'STRONG' ? 'bg-green-100 text-green-700' :
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
                            className={`flex-1 h-8 rounded flex items-center justify-center text-white text-sm font-semibold ${score >= 70 ? 'bg-green-500' : score >= 50 ? 'bg-yellow-500' : 'bg-red-500'
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
                            className={`flex-1 h-8 rounded flex items-center justify-center text-white text-sm font-semibold ${score >= 70 ? 'bg-green-500' : score >= 50 ? 'bg-yellow-500' : 'bg-red-500'
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
                            className={`flex-1 h-8 rounded flex items-center justify-center text-white text-sm font-semibold ${score >= 70 ? 'bg-green-500' : score >= 50 ? 'bg-yellow-500' : 'bg-red-500'
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

            {/* Detailed Analytics */}
            <div className="card mb-6">
              <h3 className="text-2xl font-bold mb-6">Detailed Performance Analysis</h3>

              <div className="mb-8 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-lg font-semibold mb-4">Performance by Difficulty Level</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[
                    {
                      difficulty: 'Easy',
                      avgScore: prepareChartData().difficultyAverage.EASY,
                      count: prepareChartData().difficultyStats.EASY
                    },
                    {
                      difficulty: 'Medium',
                      avgScore: prepareChartData().difficultyAverage.MEDIUM,
                      count: prepareChartData().difficultyStats.MEDIUM
                    },
                    {
                      difficulty: 'Hard',
                      avgScore: prepareChartData().difficultyAverage.HARD,
                      count: prepareChartData().difficultyStats.HARD
                    }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="difficulty" />
                    <YAxis />
                    <Tooltip formatter={(value) => value.toFixed(1)} />
                    <Bar dataKey="avgScore" fill="#3b82f6" name="Average Score" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mb-8 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-lg font-semibold mb-4">Question Distribution</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Easy', value: prepareChartData().difficultyStats.EASY, color: '#10b981' },
                        { name: 'Medium', value: prepareChartData().difficultyStats.MEDIUM, color: '#f59e0b' },
                        { name: 'Hard', value: prepareChartData().difficultyStats.HARD, color: '#ef4444' }
                      ].filter(item => item.value > 0)}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      <Cell fill="#10b981" />
                      <Cell fill="#f59e0b" />
                      <Cell fill="#ef4444" />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Focus Areas */}
            <div className="card mb-6">
              <div className="flex items-center mb-4">
                <Lightbulb className="w-6 h-6 text-yellow-600 mr-2" />
                <h3 className="text-xl font-bold">Recommended Focus Areas</h3>
              </div>
              <div className="space-y-3">
                {generateFocusAreas().map((area, idx) => (
                  <div key={idx} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-1">
                          <span className={`text-xs font-bold px-3 py-1 rounded-full ${area.priority === 'HIGH' ? 'bg-red-100 text-red-800' :
                            area.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                            {area.priority} PRIORITY
                          </span>
                        </div>
                        <h4 className="font-semibold text-lg text-gray-900">{area.topic}</h4>
                        <p className="text-gray-600 text-sm mt-1">{area.description}</p>
                        <p className="text-xs text-gray-500 mt-2">⏱️ Estimated time: {area.timeEstimate}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Application Recommendation */}
            {(() => {
              const rec = generateApplicationRecommendation()
              return (
                <div className={`card mb-6 border-2 ${rec.shouldApply === 'YES' ? 'border-green-500 bg-green-50' :
                  rec.shouldApply === 'MAYBE' ? 'border-yellow-500 bg-yellow-50' :
                    'border-red-500 bg-red-50'
                  }`}>
                  <div className="flex items-start">
                    <div className="mr-4">
                      {rec.shouldApply === 'YES' && (
                        <CheckCircle className="w-8 h-8 text-green-600" />
                      )}
                      {rec.shouldApply === 'MAYBE' && (
                        <AlertCircle className="w-8 h-8 text-yellow-600" />
                      )}
                      {rec.shouldApply === 'NO' && (
                        <XCircle className="w-8 h-8 text-red-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold mb-2">
                        {rec.shouldApply === 'YES' && '✓ You Should Apply'}
                        {rec.shouldApply === 'MAYBE' && '⚠ Consider Preparing More'}
                        {rec.shouldApply === 'NO' && '✗ Not Ready Yet'}
                      </h3>
                      <p className={`text-sm mb-4 ${rec.shouldApply === 'YES' ? 'text-green-700' :
                        rec.shouldApply === 'MAYBE' ? 'text-yellow-700' :
                          'text-red-700'
                        }`}>
                        Confidence Level: {rec.confidence}%
                      </p>

                      <div className="space-y-2">
                        {rec.reasoning.map((reason, idx) => (
                          <div key={idx} className="flex items-start">
                            <span className={`mr-2 text-lg ${rec.shouldApply === 'YES' ? '✓' :
                              rec.shouldApply === 'MAYBE' ? '•' :
                                '✗'
                              }`}>
                            </span>
                            <span className="text-gray-700">{reason}</span>
                          </div>
                        ))}
                      </div>

                      {rec.shouldApply === 'MAYBE' && (
                        <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
                          <p className="text-sm text-blue-800">
                            <strong>Recommendation:</strong> Focus on the areas above for 2-4 weeks, then retake the assessment.
                          </p>
                        </div>
                      )}

                      {rec.shouldApply === 'NO' && (
                        <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
                          <p className="text-sm text-blue-800">
                            <strong>Recommendation:</strong> Dedicate time to your weak areas. Target improvement in 4-8 weeks, then reassess.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })()}
          </div>
        )}

        {/* Resume Tab Content */}
        {activeTab === 'resume' && (
          <div className="space-y-6">
            {loadingMatch && (
              <div className="card mb-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 flex items-center justify-center">
                <Loader className="w-6 h-6 animate-spin text-blue-600 mr-3" />
                <span className="text-blue-600 font-semibold">Analyzing your resume...</span>
              </div>
            )}

            {matchingData && (
              <>
                {/* Header */}
                <div className="card">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-3xl font-bold">Resume & Job Description Analysis</h2>
                  </div>
                  <p className="text-gray-600">Detailed compatibility assessment between your resume and the job requirements</p>
                </div>

                {/* Score Cards */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="card text-center">
                    <div className="mb-3">
                      <div className={`text-5xl font-bold ${matchingData.ats_score >= 70 ? 'text-green-600' : matchingData.ats_score >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {matchingData.ats_score}
                      </div>
                      <div className="text-sm text-gray-600 mt-2">ATS Score</div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${matchingData.ats_score >= 70 ? 'bg-green-600' : matchingData.ats_score >= 50 ? 'bg-yellow-600' : 'bg-red-600'}`}
                        style={{ width: `${matchingData.ats_score}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-600 mt-2">ATS compatibility</p>
                  </div>

                  <div className="card text-center">
                    <div className="mb-3">
                      <div className={`text-5xl font-bold ${matchingData.overall_match >= 70 ? 'text-green-600' : matchingData.overall_match >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {matchingData.overall_match}%
                      </div>
                      <div className="text-sm text-gray-600 mt-2">Overall Match</div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${matchingData.overall_match >= 70 ? 'bg-green-600' : matchingData.overall_match >= 50 ? 'bg-yellow-600' : 'bg-red-600'}`}
                        style={{ width: `${matchingData.overall_match}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-600 mt-2">Job fit percentage</p>
                  </div>

                  <div className="card text-center">
                    <div className="mb-3">
                      <div className={`text-5xl font-bold ${matchingData.skill_match_percentage >= 70 ? 'text-green-600' : matchingData.skill_match_percentage >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {matchingData.skill_match_percentage}%
                      </div>
                      <div className="text-sm text-gray-600 mt-2">Skill Match</div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${matchingData.skill_match_percentage >= 70 ? 'bg-green-600' : matchingData.skill_match_percentage >= 50 ? 'bg-yellow-600' : 'bg-red-600'}`}
                        style={{ width: `${matchingData.skill_match_percentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-600 mt-2">Skills alignment</p>
                  </div>
                </div>

                {/* Summary */}
                <div className="card">
                  <h3 className="text-lg font-bold mb-2">Assessment Summary</h3>
                  <p className="text-gray-700">{matchingData.summary}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${matchingData.experience_match === 'Suitable' ? 'bg-green-100 text-green-700' : matchingData.experience_match === 'Under-experienced' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}`}>
                      {matchingData.experience_match}
                    </span>
                  </div>
                </div>

                {/* Matched Skills */}
                <div className="card">
                  <div className="flex items-center mb-4">
                    <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
                    <h3 className="text-lg font-bold">Matched Skills ({matchingData.matched_skills?.length || 0})</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {matchingData.matched_skills?.map((skill, idx) => (
                      <span key={idx} className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                        ✓ {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Missing Skills */}
                <div className="card">
                  <div className="flex items-center mb-4">
                    <XCircle className="w-6 h-6 text-red-600 mr-2" />
                    <h3 className="text-lg font-bold">Missing Skills ({matchingData.missing_skills?.length || 0})</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {matchingData.missing_skills?.map((skill, idx) => (
                      <span key={idx} className="px-4 py-2 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
                        ✗ {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Matched Requirements */}
                {matchingData.matched_requirements?.length > 0 && (
                  <div className="card">
                    <h3 className="text-lg font-bold mb-4">Matched Job Requirements</h3>
                    <ul className="space-y-2">
                      {matchingData.matched_requirements?.map((req, idx) => (
                        <li key={idx} className="flex items-start">
                          <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Unmet Requirements */}
                {matchingData.unmet_requirements?.length > 0 && (
                  <div className="card">
                    <h3 className="text-lg font-bold mb-4">Unmet Job Requirements</h3>
                    <ul className="space-y-2">
                      {matchingData.unmet_requirements?.map((req, idx) => (
                        <li key={idx} className="flex items-start">
                          <AlertCircle className="w-5 h-5 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Strengths & Gaps */}
                <div className="grid md:grid-cols-2 gap-6">
                  {matchingData.strengths?.length > 0 && (
                    <div className="card">
                      <div className="flex items-center mb-4">
                        <TrendingUp className="w-6 h-6 text-green-600 mr-2" />
                        <h3 className="text-lg font-bold">Your Strengths</h3>
                      </div>
                      <ul className="space-y-2">
                        {matchingData.strengths?.map((strength, idx) => (
                          <li key={idx} className="flex items-start">
                            <Zap className="w-4 h-4 text-green-600 mr-2 flex-shrink-0 mt-1" />
                            <span className="text-gray-700">{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {matchingData.gaps?.length > 0 && (
                    <div className="card">
                      <div className="flex items-center mb-4">
                        <TrendingDown className="w-6 h-6 text-yellow-600 mr-2" />
                        <h3 className="text-lg font-bold">Skill Gaps</h3>
                      </div>
                      <ul className="space-y-2">
                        {matchingData.gaps?.map((gap, idx) => (
                          <li key={idx} className="flex items-start">
                            <AlertCircle className="w-4 h-4 text-yellow-600 mr-2 flex-shrink-0 mt-1" />
                            <span className="text-gray-700">{gap}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Recommendations */}
                {matchingData.recommendations?.length > 0 && (
                  <div className="card bg-blue-50 border-blue-200 border-2">
                    <div className="flex items-center mb-4">
                      <Lightbulb className="w-6 h-6 text-blue-600 mr-2" />
                      <h3 className="text-lg font-bold">Recommendations</h3>
                    </div>
                    <ul className="space-y-3">
                      {matchingData.recommendations?.map((rec, idx) => (
                        <li key={idx} className="flex items-start bg-white p-3 rounded">
                          <span className="text-blue-600 font-bold mr-3">{idx + 1}.</span>
                          <span className="text-gray-700">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Match Visualization */}
                <div className="card">
                  <h3 className="text-lg font-bold mb-4">Matching Metrics Overview</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={[
                      {
                        metric: 'ATS Score',
                        value: matchingData.ats_score || 0,
                        max: 100
                      },
                      {
                        metric: 'Overall Match',
                        value: matchingData.overall_match || 0,
                        max: 100
                      },
                      {
                        metric: 'Skill Match',
                        value: matchingData.skill_match_percentage || 0,
                        max: 100
                      }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="metric" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip formatter={(value) => `${value}%`} />
                      <Bar dataKey="value" fill="#3b82f6" name="Match Score" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Close Button */}
                <div className="text-center">
                  <button
                    onClick={() => setActiveTab('interview')}
                    className="btn-secondary"
                  >
                    Back to Interview Results
                  </button>
                </div>
              </>
            )}

            {matchError && (
              <div className="card bg-red-50 border-red-200 border-2">
                <p className="text-red-600">{matchError}</p>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
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
