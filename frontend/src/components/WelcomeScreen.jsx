import React from 'react'
import { Sparkles, Brain, Target } from 'lucide-react'

const WelcomeScreen = ({ onStart }) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-4xl w-full text-center">
        <div className="mb-8 flex justify-center">
          <div className="bg-primary-100 p-6 rounded-full">
            <Brain className="w-16 h-16 text-primary-600" />
          </div>
        </div>

        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
          AI Interview Platform
        </h1>
        
        <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
          Experience the future of technical interviews. Get real-time feedback, 
          adaptive questions, and comprehensive evaluation powered by advanced AI.
        </p>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="card hover:shadow-xl transition-shadow">
            <Sparkles className="w-12 h-12 text-primary-600 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">AI-Powered</h3>
            <p className="text-gray-600 text-sm">
              Smart question generation based on your profile and job requirements
            </p>
          </div>

          <div className="card hover:shadow-xl transition-shadow">
            <Target className="w-12 h-12 text-primary-600 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">Adaptive Difficulty</h3>
            <p className="text-gray-600 text-sm">
              Questions adjust in real-time based on your performance
            </p>
          </div>

          <div className="card hover:shadow-xl transition-shadow">
            <Brain className="w-12 h-12 text-primary-600 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">Instant Feedback</h3>
            <p className="text-gray-600 text-sm">
              Get detailed evaluation and insights after each answer
            </p>
          </div>
        </div>

        <button
          onClick={onStart}
          className="btn-primary text-lg px-12 py-4 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
        >
          Start Interview
        </button>

        <p className="mt-6 text-sm text-gray-500">
          No login required • Free to use • Takes about 20-30 minutes
        </p>
      </div>
    </div>
  )
}

export default WelcomeScreen
