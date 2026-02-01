import React, { useState } from 'react'
import { Upload, FileText, Loader2, ArrowRight, Home, CheckCircle, AlertCircle, TrendingUp, Wand2, Download, X } from 'lucide-react'
import * as pdfjsLib from 'pdfjs-dist'
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { analyzeMatch } from '../services/api'

pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc

const CompareScreen = ({ onBack, onHome }) => {
    const [resumeText, setResumeText] = useState('')
    const [jobDescription, setJobDescription] = useState('')
    const [loading, setLoading] = useState(false)
    const [results, setResults] = useState(null)
    const [error, setError] = useState('')
    const [fileName, setFileName] = useState('')
    const [rewrittenResume, setRewrittenResume] = useState(null)
    const [showRewriteModal, setShowRewriteModal] = useState(false)

    const extractTextFromPDF = async (file) => {
        try {
            const arrayBuffer = await file.arrayBuffer()
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
                        continue
                    }
                }

                if (!extractedText.trim()) {
                    throw new Error('Could not extract text from PDF')
                }

                return extractedText.trim()
            } catch (pdfErr) {
                const text = new TextDecoder('utf-8', { ignoreBOM: true }).decode(arrayBuffer)
                const matches = text.match(/BT[\s\S]*?ET/g) || []

                if (matches.length > 0) {
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
            throw new Error('Failed to read PDF. Please upload a valid PDF or TXT file.')
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

            setResumeText(extractedText)
            setFileName(file.name)
            setError('')
        } catch (err) {
            setError(err.message || 'Failed to process file')
        } finally {
            setLoading(false)
        }
    }

    const handleCompare = async () => {
        if (!resumeText.trim() || !jobDescription.trim()) {
            setError('Please provide both resume and job description')
            return
        }

        setLoading(true)
        setError('')

        try {
            const data = await analyzeMatch(resumeText, jobDescription)
            setResults(data)
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to analyze. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleRewriteResume = async () => {
        setLoading(true)
        setError('')

        try {
            const response = await fetch('http://localhost:5000/resume/rewrite', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    resume_text: resumeText,
                    job_description: jobDescription,
                    focus_areas: results?.missing_skills || [],
                }),
            })

            if (!response.ok) {
                throw new Error('Failed to rewrite resume')
            }

            const data = await response.json()
            setRewrittenResume(data.rewritten_resume)
            setShowRewriteModal(true)
        } catch (err) {
            setError('Failed to rewrite resume. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleDownloadResume = () => {
        const element = document.createElement('a')
        const file = new Blob([rewrittenResume], { type: 'text/plain' })
        element.href = URL.createObjectURL(file)
        element.download = 'rewritten_resume.txt'
        document.body.appendChild(element)
        element.click()
        document.body.removeChild(element)
    }

    // Results View
    if (results) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 py-12">
                <div className="max-w-6xl mx-auto px-6">
                    {/* Header */}
                    <div className="mb-8">
                        <button
                            onClick={onHome}
                            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mb-6"
                        >
                            <Home className="w-5 h-5" />
                            Back to Home
                        </button>
                        <h1 className="text-4xl font-bold text-slate-900 mb-2">Resume-JD Analysis</h1>
                        <p className="text-slate-600">Your resume matching report</p>
                    </div>

                    {/* Score Cards */}
                    <div className="grid md:grid-cols-3 gap-6 mb-8">
                        <div className="card p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-slate-900">Overall Match</h3>
                                <TrendingUp className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="text-4xl font-bold text-blue-600 mb-2">{results.overall_match}%</div>
                            <div className="w-full bg-slate-200 rounded-full h-2">
                                <div
                                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full"
                                    style={{ width: `${results.overall_match}%` }}
                                ></div>
                            </div>
                        </div>

                        <div className="card p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-slate-900">Skill Match</h3>
                                <CheckCircle className="w-5 h-5 text-green-600" />
                            </div>
                            <div className="text-4xl font-bold text-green-600 mb-2">{results.skill_match_percentage}%</div>
                            <p className="text-sm text-slate-600">of required skills</p>
                        </div>

                        <div className="card p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-slate-900">ATS Score</h3>
                                <FileText className="w-5 h-5 text-purple-600" />
                            </div>
                            <div className="text-4xl font-bold text-purple-600 mb-2">{results.ats_score}%</div>
                            <p className="text-sm text-slate-600">ATS friendly</p>
                        </div>
                    </div>

                    {/* Charts Section */}
                    <div className="grid lg:grid-cols-2 gap-6 mb-8">
                        {/* Score Distribution Chart */}
                        <div className="card p-6">
                            <h3 className="font-semibold text-slate-900 mb-4">Score Distribution</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={[
                                    { name: 'Overall', value: results.overall_match },
                                    { name: 'Skills', value: results.skill_match_percentage },
                                    { name: 'ATS', value: results.ats_score },
                                ]}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Skills Breakdown Pie Chart */}
                        <div className="card p-6">
                            <h3 className="font-semibold text-slate-900 mb-4">Skills Breakdown</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={[
                                            { name: 'Matched', value: results.matched_skills.length },
                                            { name: 'Missing', value: results.missing_skills.length },
                                        ]}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, value }) => `${name}: ${value}`}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        <Cell fill="#10b981" />
                                        <Cell fill="#ef4444" />
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid lg:grid-cols-2 gap-6 mb-8">
                        {/* Matched Skills */}
                        <div className="card p-6">
                            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                                Matched Skills ({results.matched_skills.length})
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {results.matched_skills.map((skill, idx) => (
                                    <span key={idx} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Missing Skills */}
                        <div className="card p-6">
                            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                <AlertCircle className="w-5 h-5 text-red-600" />
                                Missing Skills ({results.missing_skills.length})
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {results.missing_skills.map((skill, idx) => (
                                    <span key={idx} className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Requirements */}
                    <div className="grid lg:grid-cols-2 gap-6 mb-8">
                        <div className="card p-6">
                            <h3 className="font-semibold text-slate-900 mb-4">Met Requirements</h3>
                            <ul className="space-y-2">
                                {results.matched_requirements.map((req, idx) => (
                                    <li key={idx} className="flex items-start gap-3 text-slate-700">
                                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                        <span>{req}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="card p-6">
                            <h3 className="font-semibold text-slate-900 mb-4">Unmet Requirements</h3>
                            <ul className="space-y-2">
                                {results.unmet_requirements.map((req, idx) => (
                                    <li key={idx} className="flex items-start gap-3 text-slate-700">
                                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                        <span>{req}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Summary & Recommendations */}
                    <div className="card p-6 mb-8">
                        <h3 className="font-semibold text-slate-900 mb-4">Summary</h3>
                        <p className="text-slate-700 mb-6">{results.summary}</p>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-semibold text-slate-900 mb-3">Strengths</h4>
                                <ul className="space-y-2">
                                    {results.strengths.map((strength, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-slate-700">
                                            <span className="text-green-600 font-bold">✓</span>
                                            <span>{strength}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div>
                                <h4 className="font-semibold text-slate-900 mb-3">Gaps to Address</h4>
                                <ul className="space-y-2">
                                    {results.gaps.map((gap, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-slate-700">
                                            <span className="text-orange-600 font-bold">!</span>
                                            <span>{gap}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Recommendations */}
                    <div className="card p-6 bg-blue-50 border-blue-200">
                        <h3 className="font-semibold text-slate-900 mb-4">Recommendations</h3>
                        <ul className="space-y-3">
                            {results.recommendations.map((rec, idx) => (
                                <li key={idx} className="flex items-start gap-3 text-slate-700">
                                    <ArrowRight className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                    <span>{rec}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            onClick={() => {
                                setResults(null)
                                setResumeText('')
                                setJobDescription('')
                            }}
                            className="flex-1 px-6 py-3 bg-white border-2 border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
                        >
                            Analyze Another
                        </button>
                        <button
                            onClick={handleRewriteResume}
                            disabled={loading}
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-purple-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Rewriting...
                                </>
                            ) : (
                                <>
                                    <Wand2 className="w-5 h-5" />
                                    Rewrite Resume
                                </>
                            )}
                        </button>
                        <button
                            onClick={onHome}
                            className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Back to Home
                        </button>
                    </div>
                </div>

                {/* Rewritten Resume Modal */}
                {showRewriteModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
                            {/* Modal Header */}
                            <div className="flex items-center justify-between p-6 border-b border-slate-200">
                                <h2 className="text-2xl font-bold text-slate-900">Rewritten Resume</h2>
                                <button
                                    onClick={() => setShowRewriteModal(false)}
                                    className="text-slate-500 hover:text-slate-700 transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="flex-1 overflow-y-auto p-6">
                                <div className="bg-slate-50 rounded-lg p-4 whitespace-pre-wrap font-mono text-sm text-slate-800 leading-relaxed">
                                    {rewrittenResume}
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="flex gap-3 p-6 border-t border-slate-200 bg-slate-50">
                                <button
                                    onClick={handleDownloadResume}
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-lg hover:from-green-700 hover:to-green-800 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Download className="w-5 h-5" />
                                    Download Resume
                                </button>
                                <button
                                    onClick={() => setShowRewriteModal(false)}
                                    className="flex-1 px-6 py-3 bg-slate-200 text-slate-900 font-semibold rounded-lg hover:bg-slate-300 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        )
    }

    // Input View
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 py-12">
            <div className="max-w-6xl mx-auto px-6">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mb-6"
                    >
                        <Home className="w-5 h-5" />
                        Back
                    </button>
                    <h1 className="text-4xl font-bold text-slate-900 mb-2">Resume & JD Comparison</h1>
                    <p className="text-slate-600">Upload your resume and job description to see how well they match</p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <p className="text-red-700">{error}</p>
                    </div>
                )}

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Resume Section */}
                    <div className="card p-6">
                        <h2 className="text-2xl font-bold text-slate-900 mb-6">Your Resume</h2>

                        {!resumeText ? (
                            <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                                <input
                                    type="file"
                                    accept=".pdf,.txt"
                                    onChange={handleFileUpload}
                                    className="hidden"
                                    id="resume-upload"
                                    disabled={loading}
                                />
                                <label htmlFor="resume-upload" className="cursor-pointer">
                                    <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                                    <p className="text-slate-600 font-medium">
                                        {loading ? 'Processing...' : 'Upload PDF or TXT file'}
                                    </p>
                                    <p className="text-sm text-slate-500 mt-2">or paste text below</p>
                                </label>
                            </div>
                        ) : (
                            <div className="bg-green-50 rounded-lg p-4 mb-4">
                                <p className="text-sm text-green-700 flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4" />
                                    {fileName || 'Resume loaded'}
                                </p>
                            </div>
                        )}

                        <textarea
                            value={resumeText}
                            onChange={(e) => setResumeText(e.target.value)}
                            placeholder="Paste your resume here..."
                            className="input-field min-h-[300px] mb-4"
                        />

                        {resumeText && (
                            <button
                                onClick={() => {
                                    setResumeText('')
                                    setFileName('')
                                }}
                                className="text-sm text-red-600 hover:text-red-700 font-medium"
                            >
                                Clear Resume
                            </button>
                        )}
                    </div>

                    {/* Job Description Section */}
                    <div className="card p-6">
                        <h2 className="text-2xl font-bold text-slate-900 mb-6">Job Description</h2>

                        <div className="border-2 border-slate-300 rounded-lg p-4 mb-4">
                            <p className="text-sm text-slate-600">Paste the job description here</p>
                        </div>

                        <textarea
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                            placeholder="Paste the job description here..."
                            className="input-field min-h-[300px] mb-4"
                        />

                        {jobDescription && (
                            <button
                                onClick={() => setJobDescription('')}
                                className="text-sm text-red-600 hover:text-red-700 font-medium"
                            >
                                Clear JD
                            </button>
                        )}
                    </div>
                </div>

                {/* Compare Button */}
                <div className="mt-8 flex justify-center">
                    <button
                        onClick={handleCompare}
                        disabled={!resumeText.trim() || !jobDescription.trim() || loading}
                        className="px-12 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Analyzing...
                            </>
                        ) : (
                            <>
                                <ArrowRight className="w-5 h-5" />
                                Compare Now
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default CompareScreen
