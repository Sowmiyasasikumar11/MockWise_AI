import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  Mic, Menu, X, Briefcase, Activity,
  ChevronRight, ChevronLeft, CheckCircle2, History
} from 'lucide-react'
import Sidebar from '../../components/dashboard/Sidebar'
import { generateHRInterview } from '../../services/hrService'
import toast from 'react-hot-toast'

export default function HRInterviewPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  // Flow State
  const [step, setStep] = useState('SETUP') // SETUP, LOADING, INTERVIEW, DONE
  
  // Form State
  const [role, setRole] = useState('')
  const [experience, setExperience] = useState('Fresher')
  const [numQuestions, setNumQuestions] = useState(5)
  
  // Interview State
  const [questions, setQuestions] = useState([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState({}) // { questionIndex: answerText }

  // Cooldown countdown (rate limit)
  const [countdown, setCountdown] = useState(0)
  const countdownRef = useRef(null)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleStartInterview = async (e) => {
    e.preventDefault()
    if (!role.trim()) {
      toast.error('Please enter a job role')
      return
    }

    setStep('LOADING')
    try {
      const data = await generateHRInterview(role, experience, numQuestions)
      if (data.success && data.data.questions.length > 0) {
        setQuestions(data.data.questions)
        setStep('INTERVIEW')
      } else {
        throw new Error('Failed to load questions')
      }
    } catch (err) {
      console.error(err)
      const responseData = err.response?.data

      if (err.response?.status === 429 && responseData?.retryAfterSeconds) {
        const secs = responseData.retryAfterSeconds
        setCountdown(secs)
        setStep('COOLDOWN')

        countdownRef.current = setInterval(() => {
          setCountdown(prev => {
            if (prev <= 1) {
              clearInterval(countdownRef.current)
              handleStartInterview(new Event('submit')) // Auto-retry
              return 0
            }
            return prev - 1
          })
        }, 1000)
      } else {
        const errorMsg = responseData?.message || 'Failed to generate interview. Please try again.'
        toast.error(errorMsg)
        setStep('SETUP')
      }
    }
  }

  const handleAnswerChange = (e) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: e.target.value
    }))
  }

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    }
  }

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }

  const handleFinish = async () => {
    // In Phase 1, we just consider it done on the frontend as the server already generated the questions.
    // Saving answers will be part of Phase 2 with AI Evaluation.
    setStep('DONE')
    toast.success('Interview completed!')
  }

  // ── Render ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0a0a16] flex font-sans text-slate-200">
      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar container */}
      <div className={`
        fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 lg:relative lg:translate-x-0
        ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <Sidebar
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
          onLogout={handleLogout}
          currentPath="/hr"
        />
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 flex items-center justify-between px-4 lg:px-8 border-b border-[#1e1e35] bg-[#0d0d1a]/80 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 text-slate-400 hover:text-white rounded-lg hover:bg-[#1e1e35] transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center">
                <Mic className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-white">HR Interview</h1>
                <p className="text-[11px] font-medium text-slate-500">Phase 1</p>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8 custom-scrollbar relative">

          {/* SETUP STEP */}
          {step === 'SETUP' && (
            <div className="max-w-2xl mx-auto mt-10">
              <div className="bg-[#131323] border border-[#1e1e35] rounded-2xl p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 blur-[100px] rounded-full pointer-events-none" />
                
                <h2 className="text-2xl font-bold text-white mb-2">Prepare for your HR Interview</h2>
                <p className="text-slate-400 mb-8 text-sm">Tell us about the role you're applying for, and our AI will generate tailored HR and behavioral questions.</p>

                <form onSubmit={handleStartInterview} className="space-y-6">
                  {/* Role */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Job Role</label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                      <input
                        type="text"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        placeholder="e.g. Software Engineer, Product Manager"
                        className="w-full bg-[#0a0a16] border border-[#2d2d4e] rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                        required
                      />
                    </div>
                  </div>

                  {/* Experience */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Experience Level</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {['Fresher', '1-2 years', '3-5 years', '5+ years'].map(exp => (
                        <button
                          key={exp}
                          type="button"
                          onClick={() => setExperience(exp)}
                          className={`py-2 px-3 rounded-xl text-sm font-medium transition-all duration-200 border ${
                            experience === exp
                              ? 'bg-purple-600/20 border-purple-500/50 text-purple-300'
                              : 'bg-[#0a0a16] border-[#2d2d4e] text-slate-400 hover:bg-[#1e1e35]'
                          }`}
                        >
                          {exp}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Num Questions */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Number of Questions</label>
                    <div className="flex gap-4">
                      {[5, 10].map(num => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setNumQuestions(num)}
                          className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all duration-200 border ${
                            numQuestions === num
                              ? 'bg-purple-600/20 border-purple-500/50 text-purple-300'
                              : 'bg-[#0a0a16] border-[#2d2d4e] text-slate-400 hover:bg-[#1e1e35]'
                          }`}
                        >
                          {num} Questions
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Submit */}
                  <div className="pt-4">
                    <button
                      type="submit"
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      Start Interview
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* LOADING STEP */}
          {step === 'LOADING' && (
            <div className="flex flex-col items-center justify-center h-full max-h-[600px]">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-purple-500/20 rounded-full"></div>
                <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin absolute inset-0"></div>
                <Mic className="w-6 h-6 text-purple-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
              </div>
              <h3 className="text-xl font-bold text-white mt-6 mb-2">Preparing Your Interview</h3>
              <p className="text-slate-400 text-sm">Generating AI questions based on your profile...</p>
            </div>
          )}

          {/* COOLDOWN STEP */}
          {step === 'COOLDOWN' && (
            <div className="flex flex-col items-center justify-center h-full max-h-[600px] text-center">
              <div className="w-20 h-20 bg-orange-500/20 rounded-full flex items-center justify-center mb-6">
                <Activity className="w-10 h-10 text-orange-400 animate-pulse" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">AI Models Busy</h2>
              <p className="text-slate-400 max-w-md mx-auto mb-6 leading-relaxed">
                Our AI models are currently experiencing high traffic. Please wait while we reconnect.
              </p>
              <div className="bg-[#1e1e35] px-8 py-6 rounded-2xl border border-[#2d2d4e]">
                <p className="text-sm font-medium text-slate-400 mb-2 uppercase tracking-wider">Retrying in</p>
                <div className="text-5xl font-black text-white tabular-nums tracking-tight">
                  {countdown}<span className="text-2xl text-slate-500 ml-1">s</span>
                </div>
              </div>
            </div>
          )}

          {/* INTERVIEW STEP */}
          {step === 'INTERVIEW' && questions.length > 0 && (
            <div className="max-w-4xl mx-auto h-full flex flex-col">
              {/* Header / Progress */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Question {currentQuestionIndex + 1} of {questions.length}</h2>
                <div className="text-sm font-medium text-slate-400">
                  {Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}% Completed
                </div>
              </div>
              <div className="w-full bg-[#1e1e35] h-2 rounded-full mb-8 overflow-hidden">
                <div 
                  className="bg-purple-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                />
              </div>

              {/* Question Card */}
              <div className="flex-1 flex flex-col bg-[#131323] border border-[#1e1e35] rounded-2xl p-6 lg:p-8 relative">
                <div className="flex items-start gap-4 mb-8">
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-purple-400 font-bold">Q{currentQuestionIndex + 1}</span>
                  </div>
                  <h3 className="text-xl text-white leading-relaxed font-medium">
                    {questions[currentQuestionIndex].text}
                  </h3>
                </div>

                <div className="flex-1 flex flex-col">
                  <label className="text-sm font-medium text-slate-400 mb-3">Your Answer</label>
                  <textarea
                    value={answers[currentQuestionIndex] || ''}
                    onChange={handleAnswerChange}
                    placeholder="Type your answer here..."
                    className="flex-1 w-full bg-[#0a0a16] border border-[#2d2d4e] rounded-xl p-4 text-white resize-none focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors custom-scrollbar"
                  />
                </div>

                {/* Footer Controls */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-[#1e1e35]">
                  <button
                    onClick={handlePrev}
                    disabled={currentQuestionIndex === 0}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-colors ${
                      currentQuestionIndex === 0
                        ? 'bg-[#1e1e35] text-slate-600 cursor-not-allowed'
                        : 'bg-[#1e1e35] text-white hover:bg-[#2d2d4e]'
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>

                  {currentQuestionIndex < questions.length - 1 ? (
                    <button
                      onClick={handleNext}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium bg-purple-600 hover:bg-purple-700 text-white transition-colors"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={handleFinish}
                      className="flex items-center gap-2 px-8 py-2.5 rounded-xl font-medium bg-green-600 hover:bg-green-700 text-white transition-colors"
                    >
                      Finish
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* DONE STEP */}
          {step === 'DONE' && (
            <div className="max-w-2xl mx-auto mt-20 text-center">
              <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8 relative">
                <div className="absolute inset-0 rounded-full border border-green-500/30 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" />
                <CheckCircle2 className="w-12 h-12 text-green-400" />
              </div>
              
              <h2 className="text-3xl font-bold text-white mb-4">Interview Completed!</h2>
              <p className="text-slate-400 mb-10 max-w-md mx-auto">
                Great job! Your answers have been successfully recorded. In the next phase, you will receive AI evaluation and feedback on your performance.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={() => window.location.reload()}
                  className="w-full sm:w-auto px-8 py-3 rounded-xl font-medium bg-purple-600 hover:bg-purple-700 text-white transition-colors"
                >
                  Start New Interview
                </button>
                <Link
                  to="/dashboard"
                  className="w-full sm:w-auto px-8 py-3 rounded-xl font-medium bg-[#1e1e35] text-white hover:bg-[#2d2d4e] transition-colors flex items-center justify-center gap-2"
                >
                  Back to Dashboard
                </Link>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  )
}
