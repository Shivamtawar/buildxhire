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
