import React, { useState } from 'react'
import { Sparkles, Brain, Target, CheckCircle, Github, Linkedin, Mail, FileText, Zap } from 'lucide-react'
import shivam from '../assets/shivam.png'
const WelcomeScreen = ({ onStart, onCompare }) => {
  const [activeTab, setActiveTab] = useState('home')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-2 rounded-lg">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                BuildxHire
              </h1>
              <p className="text-xs text-slate-500">AI-Powered Interview Platform</p>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-8">
            {[
              { id: 'home', label: 'Home' },
              { id: 'features', label: 'Features' },
              { id: 'about', label: 'About' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 font-medium text-sm border-b-2 transition-all ${activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Home Tab */}
        {activeTab === 'home' && (
          <div className="space-y-12">
            {/* Hero Section */}
            <div className="text-center space-y-6 py-12">
              <h2 className="text-5xl md:text-6xl font-bold text-slate-900">
                Level Up Your <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">Interview Skills</span>
              </h2>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                Practice with AI-powered adaptive interviews. Get real-time feedback,
                compare your resume with job descriptions, and ace your next interview.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
                <button
                  onClick={onStart}
                  className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  <Zap className="w-5 h-5" />
                  Start Interview
                </button>
                <button
                  onClick={onCompare}
                  className="px-8 py-4 bg-white border-2 border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  <FileText className="w-5 h-5" />
                  Get Resume Score
                </button>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="group card hover:shadow-xl hover:border-blue-200 transition-all">
                <div className="bg-blue-100 p-3 rounded-lg w-fit mb-4 group-hover:bg-blue-200 transition-colors">
                  <Sparkles className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-lg text-slate-900 mb-2">AI-Powered</h3>
                <p className="text-slate-600 text-sm">
                  Smart question generation based on your profile and job requirements
                </p>
              </div>

              <div className="group card hover:shadow-xl hover:border-blue-200 transition-all">
                <div className="bg-blue-100 p-3 rounded-lg w-fit mb-4 group-hover:bg-blue-200 transition-colors">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-lg text-slate-900 mb-2">Adaptive Difficulty</h3>
                <p className="text-slate-600 text-sm">
                  Questions adjust in real-time based on your performance
                </p>
              </div>

              <div className="group card hover:shadow-xl hover:border-blue-200 transition-all">
                <div className="bg-blue-100 p-3 rounded-lg w-fit mb-4 group-hover:bg-blue-200 transition-colors">
                  <Brain className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-lg text-slate-900 mb-2">Instant Feedback</h3>
                <p className="text-slate-600 text-sm">
                  Get detailed evaluation and insights after each answer
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Features Tab */}
        {activeTab === 'features' && (
          <div className="space-y-8 py-8">
            <h2 className="text-4xl font-bold text-slate-900 mb-12">Why Choose BuildxHire?</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {[
                { icon: <Brain className="w-6 h-6" />, title: "Adaptive Questions", desc: "Difficulty adjusts based on your performance" },
                { icon: <Zap className="w-6 h-6" />, title: "Real-Time Feedback", desc: "Get instant evaluation and improvement tips" },
                { icon: <Target className="w-6 h-6" />, title: "JD Matching", desc: "Compare your resume against job requirements" },
                { icon: <CheckCircle className="w-6 h-6" />, title: "Performance Analytics", desc: "Track progress with detailed metrics" },
              ].map((feature, idx) => (
                <div key={idx} className="card p-6 hover:shadow-lg transition-shadow">
                  <div className="text-blue-600 mb-4">{feature.icon}</div>
                  <h3 className="font-semibold text-lg text-slate-900 mb-2">{feature.title}</h3>
                  <p className="text-slate-600">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* About Tab */}
        {activeTab === 'about' && (
          <div className="py-12">
            <div className="max-w-2xl mx-auto">
              <div className="card p-8 text-center">
                <div className="w-32 h-32 rounded-full mx-auto mb-6 overflow-hidden border-4 border-blue-200 shadow-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center relative">
                  <img
                    src={shivam}
                    alt="Shivam Tawar"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none'
                    }}
                  />
                  <span className="text-4xl font-bold text-white absolute">ST</span>
                </div>

                <h2 className="text-3xl font-bold text-slate-900 mb-2">Shivam Tawar</h2>
                <p className="text-blue-600 font-semibold mb-6">Full-Stack Developer & AI Enthusiast</p>

                <p className="text-slate-700 text-lg leading-relaxed mb-8">
                  I'm a passionate full-stack developer and AI enthusiast dedicated to transforming the interview preparation experience.
                  I created BuildxHire to combine my love for technology with a practical solution that helps candidates excel in their
                  technical interviews.
                </p>

                <div className="bg-blue-50 rounded-lg p-6 mb-8 text-left space-y-3">
                  <h3 className="font-semibold text-slate-900">What I Built:</h3>
                  <ul className="space-y-2 text-slate-700">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <span>AI-powered adaptive interview system with real-time feedback</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <span>Resume-JD matching and analysis engine</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <span>Full-stack application with React + Flask + Groq API</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <span>Voice recognition and text-to-speech integration</span>
                    </li>
                  </ul>
                </div>

                <div className="flex gap-4 justify-center">
                  <a href="mailto:shivamtawar1804@gmail.com" className="p-3 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors" title="Email">
                    <Mail className="w-6 h-6 text-slate-700" />
                  </a>
                  <a href="https://github.com/Shivamtawar" target="_blank" rel="noopener noreferrer" className="p-3 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors" title="GitHub">
                    <Github className="w-6 h-6 text-slate-700" />
                  </a>
                  <a href="https://www.linkedin.com/in/shivam-tawar-b83111324/" target="_blank" rel="noopener noreferrer" className="p-3 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors" title="LinkedIn">
                    <Linkedin className="w-6 h-6 text-slate-700" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white mt-16">
        <div className="max-w-7xl mx-auto px-6 py-8 text-center text-slate-600">
          <p>© 2026 BuildxHire. Crafted by Shivam Tawar. No login required • Free to use</p>
        </div>
      </footer>
    </div>
  )
}

export default WelcomeScreen
