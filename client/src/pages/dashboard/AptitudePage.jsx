import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  Brain, Menu, X, BrainCircuit, Activity, BookOpen,
  ChevronRight, ChevronLeft, CheckCircle2, XCircle, History
} from 'lucide-react'
import Sidebar from '../../components/dashboard/Sidebar'
import { generateAptitudeQuestions, submitAptitudeTest } from '../../services/aptitudeService'
import authService from '../../services/authService'
import toast from 'react-hot-toast'

export default function AptitudePage() {
  const { user, logout, updateUser } = useAuth()
  const navigate = useNavigate()

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  // ── State for Aptitude Flow ──────────────────────────────────────
  const [step, setStep] = useState('SETUP') // SETUP, LOADING, COOLDOWN, TEST, RESULT, REVIEW
  const [category, setCategory] = useState('Quantitative Aptitude')
  const [difficulty, setDifficulty] = useState('Medium')
  const [questions, setQuestions] = useState([])

  // Cooldown countdown (rate limit)
  const [countdown, setCountdown] = useState(0)
  const countdownRef = useRef(null)

  // Test State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState({}) // { questionId: selectedOption }
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false)

  // Result State
  const [result, setResult] = useState(null)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleStartTest = async () => {
    setStep('LOADING')
    try {
      const data = await generateAptitudeQuestions(category, difficulty)
      if (data.success && data.data.length > 0) {
        setQuestions(data.data)
        setStep('TEST')
      } else {
        throw new Error('Failed to load questions')
      }
    } catch (err) {
      console.error(err)
      const responseData = err.response?.data

      if (err.response?.status === 429 && responseData?.retryAfterSeconds) {
        // Start auto-retry countdown instead of showing error toast
        const secs = responseData.retryAfterSeconds
        setCountdown(secs)
        setStep('COOLDOWN')

        countdownRef.current = setInterval(() => {
          setCountdown(prev => {
            if (prev <= 1) {
              clearInterval(countdownRef.current)
              // Auto-retry when countdown hits 0
              handleStartTest()
              return 0
            }
            return prev - 1
          })
        }, 1000)
      } else {
        const errorMsg = responseData?.message || 'Failed to generate questions. Please try again.'
        toast.error(errorMsg)
        setStep('SETUP')
      }
    }
  }

  const handleOptionSelect = (questionId, option) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: option
    }))
  }

  const handlePreSubmit = () => {
    // Check if any questions are unanswered
    const answeredCount = Object.keys(answers).length
    if (answeredCount < questions.length) {
      setShowSubmitConfirm(true)
    } else {
      handleSubmitTest()
    }
  }

  const handleSubmitTest = async () => {
    setShowSubmitConfirm(false)
    const formattedAnswers = Object.entries(answers).map(([questionId, selectedAnswer]) => ({
      questionId,
      selectedAnswer
    }))
    
    // Fill in unanswered questions
    questions.forEach(q => {
      if (!answers[q._id]) {
        formattedAnswers.push({ questionId: q._id, selectedAnswer: null })
      }
    })

    setStep('LOADING')
    try {
      const res = await submitAptitudeTest(formattedAnswers, category, difficulty)
      if (res.success) {
        setResult(res.data)
        setStep('RESULT')
        // Re-fetch fresh user data so dashboard stats update immediately
        try {
          const meRes = await authService.getMe()
          if (meRes.data?.user && updateUser) {
            updateUser(meRes.data.user)
          }
        } catch (_) { /* non-critical — stats will refresh on next page load */ }
      }
    } catch (err) {
      console.error(err)
      toast.error('Failed to submit test.')
      setStep('TEST')
    }
  }

  const handleRetake = () => {
    setStep('SETUP')
    setQuestions([])
    setAnswers({})
    setCurrentQuestionIndex(0)
    setResult(null)
  }

  // ── Render Helpers ────────────────────────────────────────────────
  const renderSetup = () => (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mx-auto mb-4">
          <BrainCircuit className="w-8 h-8 text-indigo-400" />
        </div>
        <h2 className="text-3xl font-bold text-white">Aptitude Test Generator</h2>
        <p className="text-slate-400">Powered by Gemini AI. Customise your test parameters below.</p>
      </div>

      <div className="bg-[#0d0d1a]/60 border border-[#1e1e35] rounded-3xl p-8 space-y-8">
        
        {/* Category Selection */}
        <div className="space-y-4">
          <label className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-400" />
            Select Category
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {['Quantitative Aptitude', 'Logical Reasoning', 'Verbal Ability'].map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`p-4 rounded-2xl border text-sm font-medium transition-all duration-200 flex flex-col items-center gap-2 ${
                  category === cat
                    ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 ring-1 ring-indigo-500'
                    : 'bg-[#1e1e35]/50 border-[#2d2d4e] text-slate-400 hover:bg-[#1e1e35] hover:text-slate-200'
                }`}
              >
                <span>{cat}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty Selection */}
        <div className="space-y-4">
          <label className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-purple-400" />
            Select Difficulty
          </label>
          <div className="grid grid-cols-3 gap-4">
            {[
              { level: 'Easy', color: 'green' },
              { level: 'Medium', color: 'amber' },
              { level: 'Hard', color: 'red' }
            ].map(({ level, color }) => (
              <button
                key={level}
                onClick={() => setDifficulty(level)}
                className={`p-3 rounded-2xl border text-sm font-medium transition-all duration-200 ${
                  difficulty === level
                    ? `bg-${color}-500/10 border-${color}-500/50 text-${color}-400 ring-1 ring-${color}-500/50`
                    : 'bg-[#1e1e35]/50 border-[#2d2d4e] text-slate-400 hover:bg-[#1e1e35] hover:text-slate-200'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Start Button */}
        <button
          onClick={handleStartTest}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:from-indigo-500 hover:to-purple-500 transition-all shadow-lg shadow-indigo-500/20 active:scale-[0.98]"
        >
          Generate Questions with AI
        </button>
      </div>
    </div>
  )

  const renderLoading = () => (
    <div className="flex flex-col items-center justify-center h-[60vh] space-y-6 animate-in fade-in duration-500">
      <div className="relative w-24 h-24">
        <div className="absolute inset-0 border-t-4 border-indigo-500 border-solid rounded-full animate-spin"></div>
        <div className="absolute inset-2 border-r-4 border-purple-500 border-solid rounded-full animate-[spin_1.5s_linear_infinite_reverse]"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <BrainCircuit className="w-8 h-8 text-indigo-400 animate-pulse" />
        </div>
      </div>
      <div className="text-center">
        <h3 className="text-xl font-bold text-white mb-2">Generating Questions...</h3>
        <p className="text-slate-400 text-sm">Gemini AI is crafting your {difficulty.toLowerCase()} {category} test.</p>
        <p className="text-slate-500 text-xs mt-2">⏳ This may take up to 30 seconds — please don't close this page.</p>
      </div>
    </div>
  )

  const renderCooldown = () => {
    const radius = 54
    const circumference = 2 * Math.PI * radius
    // countdown goes from N down to 0; fill from 0% to 100%
    const totalSecs = countdown  // we'll use a ref-captured initial value
    const dashOffset = circumference  // always filling, simplified

    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-6 animate-in fade-in duration-500">
        {/* Countdown Ring */}
        <div className="relative w-36 h-36 flex items-center justify-center">
          <svg className="absolute inset-0 -rotate-90" width="144" height="144" viewBox="0 0 144 144">
            <circle cx="72" cy="72" r={radius} fill="none" stroke="#1e1e35" strokeWidth="8" />
            <circle
              cx="72" cy="72" r={radius} fill="none"
              stroke="#f59e0b" strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={0}
              className="transition-all duration-1000"
            />
          </svg>
          <div className="z-10 text-center">
            <span className="text-4xl font-black text-amber-400">{countdown}</span>
            <p className="text-slate-500 text-xs">seconds</p>
          </div>
        </div>

        <div className="text-center space-y-1">
          <h3 className="text-xl font-bold text-white">AI Quota Cooldown</h3>
          <p className="text-slate-400 text-sm">All models are temporarily rate-limited.</p>
          <p className="text-amber-400 text-sm font-medium">Auto-retrying when countdown ends...</p>
        </div>

        <button
          onClick={() => {
            clearInterval(countdownRef.current)
            setStep('SETUP')
          }}
          className="text-slate-500 hover:text-slate-300 text-xs underline transition-colors"
        >
          Cancel and go back
        </button>
      </div>
    )
  }

  const renderTest = () => {
    const q = questions[currentQuestionIndex]
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100

    return (
      <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm mb-2 text-slate-400">
            <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
            <span>{Math.round(progress)}% Completed</span>
          </div>
          <div className="w-full bg-[#1e1e35] rounded-full h-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-[#0d0d1a]/80 border border-[#1e1e35] rounded-3xl p-6 sm:p-10 shadow-xl mb-6">
          <h3 className="text-xl sm:text-2xl text-white font-medium leading-relaxed mb-8">
            {q.question}
          </h3>

          <div className="space-y-3">
            {q.options.map((opt, i) => {
              const isSelected = answers[q._id] === opt
              return (
                <button
                  key={i}
                  onClick={() => handleOptionSelect(q._id, opt)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 flex items-center gap-4 ${
                    isSelected
                      ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-200'
                      : 'bg-[#1e1e35]/40 border-[#2d2d4e] text-slate-300 hover:bg-[#1e1e35] hover:border-[#3d3d5e]'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    isSelected ? 'border-indigo-500 bg-indigo-500' : 'border-slate-500'
                  }`}>
                    {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                  <span className="text-base">{opt}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
            disabled={currentQuestionIndex === 0}
            className="px-6 py-3 rounded-xl border border-[#2d2d4e] text-slate-300 hover:bg-[#1e1e35] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>

          {currentQuestionIndex === questions.length - 1 ? (
            <button
              onClick={handlePreSubmit}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold hover:from-green-500 hover:to-emerald-500 transition-all shadow-lg shadow-green-500/20"
            >
              Submit Test
            </button>
          ) : (
            <button
              onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors flex items-center gap-2"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Submit Confirmation Modal */}
        {showSubmitConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#151525] border border-slate-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="flex items-center gap-3 mb-4 text-amber-400">
                <Activity className="w-6 h-6" />
                <h3 className="text-xl font-bold">Unanswered Questions</h3>
              </div>
              <p className="text-slate-300 mb-6">
                You have answered <span className="font-bold text-white">{Object.keys(answers).length}</span> out of <span className="font-bold text-white">{questions.length}</span> questions. Are you sure you want to submit?
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowSubmitConfirm(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors font-medium"
                >
                  Go Back
                </button>
                <button
                  onClick={handleSubmitTest}
                  className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold transition-colors shadow-lg shadow-emerald-500/20"
                >
                  Submit Anyway
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderResult = () => {
    let message = 'Needs Improvement'
    let messageColor = 'text-red-400'
    if (result.percentage >= 80) {
      message = 'Excellent'
      messageColor = 'text-green-400'
    } else if (result.percentage >= 50) {
      message = 'Good'
      messageColor = 'text-amber-400'
    }

    return (
      <div className="max-w-2xl mx-auto animate-in zoom-in-95 duration-500">
        <div className="bg-[#0d0d1a]/80 border border-[#1e1e35] rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden">
          {/* Decorative gradients */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10">
            <h2 className="text-3xl font-bold text-white mb-2">Test Completed</h2>
            <p className="text-slate-400 mb-8">Here is your performance breakdown</p>

            {/* Big Score */}
            <div className="relative w-48 h-48 mx-auto flex items-center justify-center mb-8">
              <svg className="absolute inset-0 -rotate-90" width="192" height="192" viewBox="0 0 192 192">
                <circle cx="96" cy="96" r="80" fill="none" stroke="#1e1e35" strokeWidth="12" />
                <circle
                  cx="96" cy="96" r="80" fill="none"
                  stroke={result.percentage >= 70 ? '#10b981' : result.percentage >= 40 ? '#f59e0b' : '#ef4444'}
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 80}
                  strokeDashoffset={(2 * Math.PI * 80) - ((result.percentage / 100) * (2 * Math.PI * 80))}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="z-10 text-center">
                <span className="text-5xl font-black text-white">{Math.round(result.percentage)}%</span>
                <p className="text-slate-500 text-sm mt-1">Score</p>
              </div>
            </div>

            <p className={`text-2xl font-bold mb-8 ${messageColor}`}>{message}</p>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mb-10">
              <div className="p-4 rounded-2xl bg-green-500/10 border border-green-500/20">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  <span className="text-green-400 font-semibold text-sm">Correct</span>
                </div>
                <p className="text-2xl font-bold text-white">{result.correctAnswers}</p>
              </div>
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <XCircle className="w-5 h-5 text-red-400" />
                  <span className="text-red-400 font-semibold text-sm">Wrong</span>
                </div>
                <p className="text-2xl font-bold text-white">{result.wrongAnswers}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setStep('REVIEW')}
                className="px-6 py-3 rounded-xl bg-slate-800 text-white font-medium hover:bg-slate-700 transition-colors"
              >
                Review Answers
              </button>
              <button
                onClick={handleRetake}
                className="px-6 py-3 rounded-xl border border-indigo-500 text-indigo-400 font-medium hover:bg-indigo-500/10 transition-colors"
              >
                Retake Test
              </button>
              <Link
                to="/dashboard"
                className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-500 transition-colors"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderReview = () => {
    return (
      <div className="animate-in slide-up duration-500 max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-white">Answer Review</h2>
            <p className="text-slate-400">Check what you got right and wrong.</p>
          </div>
          <button
            onClick={() => setStep('RESULT')}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors"
          >
            Back to Result
          </button>
        </div>

        <div className="space-y-6">
          {questions.map((q, idx) => {
            const userAnswer = answers[q._id]
            const isCorrect = userAnswer === q.correctAnswer
            const isSkipped = !userAnswer

            return (
              <div key={q._id} className={`p-6 rounded-2xl border ${isCorrect ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isCorrect ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {isCorrect ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                  </div>
                  <h3 className="text-lg text-white font-medium mt-1">
                    <span className="text-slate-500 mr-2">{idx + 1}.</span>
                    {q.question}
                  </h3>
                </div>

                <div className="ml-12 grid gap-2">
                  {q.options.map((opt, oIdx) => {
                    const isSelected = userAnswer === opt
                    const isActualCorrect = q.correctAnswer === opt

                    let optionClass = "p-3 rounded-xl border border-slate-700 bg-slate-800/50 text-slate-300"
                    
                    if (isActualCorrect) {
                      optionClass = "p-3 rounded-xl border border-green-500 bg-green-500/20 text-green-400 font-semibold"
                    } else if (isSelected && !isActualCorrect) {
                      optionClass = "p-3 rounded-xl border border-red-500 bg-red-500/20 text-red-400 font-semibold"
                    }

                    return (
                      <div key={oIdx} className={optionClass}>
                        <div className="flex items-center justify-between">
                          <span>{opt}</span>
                          {isActualCorrect && <span className="text-xs uppercase tracking-wider font-bold opacity-80">Correct Answer</span>}
                          {isSelected && !isActualCorrect && <span className="text-xs uppercase tracking-wider font-bold opacity-80">Your Answer</span>}
                        </div>
                      </div>
                    )
                  })}
                  {isSkipped && (
                    <div className="mt-2 text-sm text-slate-400 font-medium">You skipped this question.</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
        
        <div className="mt-8 flex justify-center pb-12">
          <button
            onClick={() => setStep('RESULT')}
            className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-500 transition-colors"
          >
            Back to Score
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'linear-gradient(135deg, #0f0f1a 0%, #0d0d1a 100%)' }}>
      
      {/* ── Desktop Sidebar ─────────────────────────────────────────── */}
      <div className="hidden md:block relative">
        <Sidebar
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
          onLogout={handleLogout}
          currentPath="/aptitude"
        />
      </div>

      {/* ── Mobile Sidebar Overlay ───────────────────────────────────── */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-64 relative">
            <Sidebar
              collapsed={false}
              setCollapsed={() => {}}
              onLogout={handleLogout}
              currentPath="/aptitude"
            />
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* ── Main Content ─────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top bar */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-[#1e1e35] flex-shrink-0">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="md:hidden text-slate-400 hover:text-white transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="hidden md:flex items-center gap-2">
            <Brain className="w-4 h-4 text-indigo-400" />
            <span className="text-white font-semibold text-sm">Aptitude Module</span>
          </div>

          <div className="flex items-center gap-4 ml-auto">
            <Link 
              to="/aptitude/history"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors border border-slate-700"
            >
              <History className="w-4 h-4" />
              History
            </Link>

            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white cursor-pointer">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
          </div>
        </header>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
            {step === 'SETUP'    && renderSetup()}
            {step === 'LOADING'  && renderLoading()}
            {step === 'COOLDOWN' && renderCooldown()}
            {step === 'TEST'     && renderTest()}
            {step === 'RESULT'   && renderResult()}
            {step === 'REVIEW'   && renderReview()}
          </div>
        </div>

      </main>
    </div>
  )
}
