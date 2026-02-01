import React, { useState, useEffect } from 'react'
import { Upload, FileText, Briefcase, Loader2, ChevronLeft, X } from 'lucide-react'
import * as pdfjsLib from 'pdfjs-dist'
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import { analyzeResume, startInterview } from '../services/api'
import { useInterview } from '../contexts/InterviewContext'

// Set up PDF.js worker using the bundled worker file
pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc

const SetupScreen = ({ onStart, onBack }) => {
  const [candidateText, setCandidateText] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(1) // 1: candidate info, 2: job desc
  const [fileName, setFileName] = useState('')
  const [uploadMethod, setUploadMethod] = useState('text') // 'text' or 'file'
  const { candidateId, setCandidateId, setSessionId, setCurrentQuestion, setDifficulty, setJobDescription: setContextJobDescription, setResumeText } = useInterview()

  const extractTextFromPDF = async (file) => {
    try {
      const arrayBuffer = await file.arrayBuffer()

      // Try to use pdf.js to extract text
      try {
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
        let extractedText = ''

        for (let i = 1; i <= pdf.numPages; i++) {
          try {
            const page = await pdf.getPage(i)
            const textContent = await page.getTextContent()
            const pageText = textContent.items
              .map(item => {
                if (typeof item === 'object' && item.str) {
                  return item.str
                }
                return ''
              })
              .join(' ')
            extractedText += pageText + ' '
          } catch (pageErr) {
            console.error(`Error extracting page ${i}:`, pageErr)
            continue // Skip problematic pages
          }
        }

        if (!extractedText.trim()) {
          throw new Error('Could not extract text from PDF. The PDF might be image-based.')
        }

        return extractedText.trim()
      } catch (pdfErr) {
        // Fallback: try basic text extraction without worker
        console.warn('PDF.js extraction failed, trying fallback method:', pdfErr)

        // Try to extract text directly from PDF buffer
        const text = new TextDecoder('utf-8', { ignoreBOM: true }).decode(arrayBuffer)
        const matches = text.match(/BT[\s\S]*?ET/g) || []

        if (matches.length > 0) {
          // Very basic PDF text extraction
          const extractedText = matches
            .join(' ')
            .replace(/[^\w\s]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()

          if (extractedText.length > 20) {
            return extractedText
          }
        }

        throw new Error('Failed to extract text from PDF')
      }
    } catch (err) {
      console.error('PDF extraction error:', err)
      throw new Error(
        'Failed to read PDF. Please ensure it\'s a valid PDF file with selectable text, or try uploading a TXT file instead.'
      )
    }
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    setError('')

    try {
      let extractedText = ''

      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        extractedText = await extractTextFromPDF(file)
      } else if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
        extractedText = await file.text()
      } else {
        throw new Error('Please upload a PDF or TXT file')
      }

      if (!extractedText.trim()) {
        throw new Error('Could not extract text from file')
      }

      setCandidateText(extractedText)
      setFileName(file.name)
      setError('')
    } catch (err) {
      setError(err.message || 'Failed to process file')
      console.error('File upload error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCandidateSubmit = async () => {
    if (!candidateText.trim()) {
      setError('Please enter your information - either paste text or upload a file')
      return
    }

    setLoading(true)
    setError('')

    try {
      const data = await analyzeResume(candidateText)
      console.log('Candidate info analyzed:', data)

      // Save candidate_id in both context and sessionStorage
      setCandidateId(data.candidate_id)
      sessionStorage.setItem('candidateId', data.candidate_id)

      setStep(2)
    } catch (err) {
      console.error('Analysis error:', err)
      setError(err.response?.data?.error || 'Failed to analyze. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleStartInterview = async () => {
    if (!jobDescription.trim()) {
      setError('Please enter job description')
      return
    }

    // Get candidate_id from context or sessionStorage
    const currentCandidateId = candidateId || sessionStorage.getItem('candidateId')

    if (!currentCandidateId) {
      setError('Candidate ID not found. Please go back and resubmit your resume.')
      return
    }

    setLoading(true)
    setError('')

    try {
      console.log('Starting interview with candidate_id:', currentCandidateId)

      const data = await startInterview(currentCandidateId, jobDescription)
      console.log('Interview started:', data)

      // Save session data
      setSessionId(data.session_id)
      setCurrentQuestion(data.first_question)
      setDifficulty(data.difficulty)
      setContextJobDescription(jobDescription)
      setResumeText(candidateText)

      sessionStorage.setItem('sessionId', data.session_id)
      sessionStorage.setItem('currentQuestion', data.first_question)

      onStart()
    } catch (err) {
      console.error('Start interview error:', err)
      setError(err.response?.data?.error || 'Failed to start interview. Please try again.')
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
              <h2 className="text-2xl font-bold mb-2">Tell Us About Yourself</h2>
              <p className="text-gray-600 mb-6">
                Upload a file (PDF/TXT) or write about yourself. We'll analyze your background and tailor interview questions.
              </p>

              {/* Upload Method Tabs */}
              <div className="flex gap-3 mb-6">
                <button
                  onClick={() => setUploadMethod('text')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${uploadMethod === 'text'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    }`}
                >
                  Write Text
                </button>
                <button
                  onClick={() => setUploadMethod('file')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${uploadMethod === 'file'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    }`}
                >
                  Upload File
                </button>
              </div>

              {/* Text Input Method */}
              {uploadMethod === 'text' && (
                <div>
                  <textarea
                    value={candidateText}
                    onChange={(e) => setCandidateText(e.target.value)}
                    placeholder="Write about yourself, your experience, skills, projects, education, or paste your resume...

Examples:
- I'm a full-stack developer with 5 years of experience
- My skills include JavaScript, React, Node.js, Python
- I've worked on e-commerce platforms and real-time chat apps
- Currently interested in backend engineering roles

Just write naturally - it can be your resume text, or simply tell us about yourself!"
                    className="input-field min-h-[300px] font-mono text-sm"
                  />

                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-900">
                      <strong>Tip:</strong> Include your experience, technical skills, projects, and education. You can write naturally or paste a resume.
                    </p>
                  </div>
                </div>
              )}

              {/* File Upload Method */}
              {uploadMethod === 'file' && (
                <div>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-500 transition-colors cursor-pointer"
                    onClick={() => document.getElementById('fileInput').click()}
                  >
                    <Upload className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                    <p className="text-lg font-medium text-gray-900 mb-1">
                      Upload Your File
                    </p>
                    <p className="text-sm text-gray-600 mb-4">
                      Supports PDF and TXT files
                    </p>
                    <input
                      id="fileInput"
                      type="file"
                      accept=".pdf,.txt"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={loading}
                    />
                    <button className="inline-block px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                      Choose File
                    </button>
                  </div>

                  {fileName && !error && (
                    <div className="mt-4 p-3 bg-green-50 rounded-lg flex items-center justify-between">
                      <span className="text-sm text-green-800">
                        ✓ File loaded: <strong>{fileName}</strong>
                      </span>
                      <button
                        onClick={() => {
                          setFileName('')
                          setCandidateText('')
                        }}
                        className="text-green-600 hover:text-green-800"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {error && (
                    <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
                      <p className="text-sm font-semibold text-red-800 mb-2">
                        ✕ {error}
                      </p>
                      <p className="text-xs text-red-700">
                        Try: (1) Make sure PDF has selectable text (not scanned image), (2) Check file isn't corrupted, (3) Use TXT format instead
                      </p>
                    </div>
                  )}

                  {candidateText && !error && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-600 mb-2">Extracted text preview (first 300 characters):</p>
                      <p className="text-sm text-gray-700 bg-white p-3 rounded max-h-32 overflow-y-auto font-mono">
                        {candidateText.substring(0, 300)}...
                      </p>
                    </div>
                  )}
                </div>
              )}

              {error && (
                <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg">
                  {error}
                </div>
              )}

              <button
                onClick={handleCandidateSubmit}
                disabled={loading || !candidateText.trim()}
                className="btn-primary w-full mt-6"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="animate-spin mr-2" />
                    {uploadMethod === 'file' ? 'Processing File...' : 'Analyzing...'}
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
                placeholder="Paste job description here...

Example:
We are looking for a Senior Full Stack Developer with 4+ years of experience.

Required Skills:
- Strong proficiency in React and Node.js
- Experience with RESTful API development
- Knowledge of SQL and NoSQL databases
- Familiarity with cloud platforms (AWS/GCP/Azure)
- Understanding of microservices architecture

Responsibilities:
- Design and develop scalable web applications
- Collaborate with cross-functional teams
- Write clean, maintainable code
- Participate in code reviews
- Mentor junior developers"
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

              {candidateId && (
                <div className="mt-4 p-3 bg-green-50 rounded-lg text-sm text-green-800">
                  ✓ Resume analyzed successfully
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