import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  Code2, Menu, X, CheckCircle2, History,
  ChevronRight, ChevronLeft, Lightbulb, PlayCircle
} from 'lucide-react'
import Sidebar from '../../components/dashboard/Sidebar'
import { generateQuestion, getAIHint, submitSolution, runCode as runCodeApi } from '../../services/codingService'
import authService from '../../services/authService'
import toast from 'react-hot-toast'
import Editor from '@monaco-editor/react'

export default function CodingPage() {
  const { user, logout, updateUser } = useAuth()
  const navigate = useNavigate()

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  // ── State for Coding Flow ────────────────────────────────────────
  const [step, setStep] = useState('SETUP') // SETUP, LOADING, CODING, RESULT
  const [category, setCategory] = useState('Arrays')
  const [difficulty, setDifficulty] = useState('Medium')
  const [language, setLanguage] = useState('Python')
  
  // Boilerplate per language
  const getBoilerplate = (lang) => {
    if (lang === 'Python')     return 'def solve():\n    pass'
    if (lang === 'C++')        return '#include <iostream>\nusing namespace std;\n\nint main() {\n    return 0;\n}'
    if (lang === 'Java')       return 'class Solution {\n    public static void main(String[] args) {\n        \n    }\n}'
    if (lang === 'JavaScript') return 'function solve() {\n    // your solution here\n}'
    return ''
  }
  
  const [question, setQuestion] = useState(null)
  const [code, setCode] = useState('')
  const [hints, setHints] = useState([])
  const [isHintLoading, setIsHintLoading] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [runResult, setRunResult] = useState(null)
  const [isSubmitEnabled, setIsSubmitEnabled] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleGenerate = async () => {
    setStep('LOADING')
    try {
      const data = await generateQuestion(category, difficulty)
      if (data.success && data.data) {
        setQuestion(data.data)
        setCode(getBoilerplate(language))
        
        setStep('CODING')
      } else {
        throw new Error('Failed to load question')
      }
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.message || 'Failed to generate question. Please try again.')
      setStep('SETUP')
    }
  }

  const handleGetHint = async (hintLevel) => {
    setIsHintLoading(true)
    try {
      const data = await getAIHint(question, code, language, hintLevel)
      if (data.success && data.data) {
        setHints(prev => [...prev, { level: hintLevel, content: data.data.content }])
        toast.success(`Received ${hintLevel}`)
      }
    } catch (err) {
      console.error(err)
      toast.error('Failed to get hint.')
    } finally {
      setIsHintLoading(false)
    }
  }

  const handleRunCode = async () => {
    setIsRunning(true)
    setRunResult(null)
    try {
      const data = await runCodeApi(question, code, language)
      if (data.success && data.data) {
        setRunResult(data.data)
        if (data.data.passed) {
          setIsSubmitEnabled(true)
          toast.success('Test cases passed! You can now submit.')
        } else {
          toast.error('Test cases failed. Check feedback.')
        }
      }
    } catch (err) {
      console.error(err)
      toast.error('Failed to evaluate code.')
    } finally {
      setIsRunning(false)
    }
  }

  const handleSubmit = async () => {
    setStep('LOADING')
    try {
      // In a real system, we'd run the code against test cases here.
      // We will mock it as passed for now to keep things simple as requested.
      const isPassed = true 
      
      const res = await submitSolution(category, difficulty, language, question, code, isPassed)
      if (res.success) {
        setStep('RESULT')
        // Re-fetch fresh user data so dashboard stats update immediately
        try {
          const meRes = await authService.getMe()
          if (meRes.data?.user && updateUser) {
            updateUser(meRes.data.user)
          }
        } catch (_) { /* non-critical */ }
      }
    } catch (err) {
      console.error(err)
      toast.error('Failed to submit solution.')
      setStep('CODING')
    }
  }

  const handleRetake = () => {
    setStep('SETUP')
    setQuestion(null)
    setCode('')
    setHints([])
    setRunResult(null)
    setIsSubmitEnabled(false)
  }

  const handleCodeChange = (val) => {
    setCode(val || '')
    setIsSubmitEnabled(false)
    setRunResult(null)
  }

  // ── Render Helpers ────────────────────────────────────────────────
  const renderSetup = () => (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mx-auto mb-4">
          <Code2 className="w-8 h-8 text-indigo-400" />
        </div>
        <h2 className="text-3xl font-bold text-white">Coding Interview</h2>
        <p className="text-slate-400">Generate a custom coding problem with Gemini AI.</p>
      </div>

      <div className="bg-[#0d0d1a]/60 border border-[#1e1e35] rounded-3xl p-8 space-y-8">
        
        {/* Category Selection */}
        <div className="space-y-4">
          <label className="text-sm font-semibold text-slate-300 uppercase tracking-wider block">
            Select Category
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {['Arrays', 'Strings', 'Linked Lists', 'Stacks & Queues', 'Trees', 'Graphs', 'Recursion', 'Dynamic Programming'].map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`p-3 rounded-2xl border text-xs font-medium transition-all duration-200 ${
                  category === cat
                    ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 ring-1 ring-indigo-500'
                    : 'bg-[#1e1e35]/50 border-[#2d2d4e] text-slate-400 hover:bg-[#1e1e35] hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty Selection */}
        <div className="space-y-4">
          <label className="text-sm font-semibold text-slate-300 uppercase tracking-wider block">
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

        {/* Language Selection */}
        <div className="space-y-4">
          <label className="text-sm font-semibold text-slate-300 uppercase tracking-wider block">
            Select Language
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {['Python', 'Java', 'C++', 'JavaScript'].map(lang => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`p-3 rounded-2xl border text-sm font-medium transition-all duration-200 ${
                  language === lang
                    ? 'bg-blue-500/10 border-blue-500/50 text-blue-400 ring-1 ring-blue-500/50'
                    : 'bg-[#1e1e35]/50 border-[#2d2d4e] text-slate-400 hover:bg-[#1e1e35] hover:text-slate-200'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleGenerate}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:from-indigo-500 hover:to-purple-500 transition-all shadow-lg shadow-indigo-500/20 active:scale-[0.98]"
        >
          Generate Question
        </button>
      </div>
    </div>
  )

  const renderLoading = () => (
    <div className="flex flex-col items-center justify-center h-[60vh] space-y-6 animate-in fade-in duration-500">
      <div className="relative w-24 h-24">
        <div className="absolute inset-0 border-t-4 border-indigo-500 border-solid rounded-full animate-spin"></div>
        <div className="absolute inset-2 border-r-4 border-purple-500 border-solid rounded-full animate-[spin_1.5s_linear_infinite_reverse]"></div>
      </div>
      <div className="text-center">
        <h3 className="text-xl font-bold text-white mb-2">Processing...</h3>
      </div>
    </div>
  )

  const renderCoding = () => {
    return (
      <div className="max-w-7xl mx-auto h-[80vh] flex flex-col lg:flex-row gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Left Panel: Problem Statement & Hints */}
        <div className="flex-1 lg:w-1/3 bg-[#0d0d1a]/80 border border-[#1e1e35] rounded-3xl p-6 overflow-y-auto flex flex-col gap-6 shadow-xl">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
                difficulty === 'Medium' ? 'bg-amber-500/20 text-amber-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                {difficulty}
              </span>
              <span className="text-slate-400 text-sm font-medium">{category}</span>
            </div>
            <h3 className="text-xl text-white font-semibold mb-4">Problem Statement</h3>
            <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap mb-6">
              {question.statement}
            </p>

            <div className="bg-[#1e1e35]/50 rounded-xl p-4 mb-6">
              <h4 className="text-slate-200 font-medium mb-2 text-sm">Example</h4>
              <p className="text-slate-400 text-xs font-mono mb-2">Input: {question.sampleInput}</p>
              <p className="text-slate-400 text-xs font-mono">Output: {question.sampleOutput}</p>
            </div>

            <div className="mb-6">
              <h4 className="text-slate-200 font-medium mb-2 text-sm">Constraints</h4>
              <ul className="list-disc list-inside text-slate-400 text-xs font-mono space-y-1">
                {question.constraints.map((c, i) => <li key={i}>{c}</li>)}
              </ul>
            </div>
          </div>

          <div className="mt-auto border-t border-[#1e1e35] pt-6">
            <h4 className="text-white font-medium mb-4 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              AI Assistant
            </h4>
            <div className="flex flex-wrap gap-2 mb-4">
              {['Hint 1', 'Hint 2', 'Approach', 'Complexity'].map(level => (
                <button
                  key={level}
                  onClick={() => handleGetHint(level)}
                  disabled={isHintLoading}
                  className="px-3 py-1.5 rounded-lg bg-[#1e1e35] hover:bg-[#2d2d4e] text-slate-300 text-xs font-medium disabled:opacity-50 transition-colors"
                >
                  {level}
                </button>
              ))}
            </div>

            {hints.length > 0 && (
              <div className="space-y-3 mt-4">
                {hints.map((h, i) => (
                  <div key={i} className="p-3 bg-indigo-900/20 border border-indigo-500/30 rounded-xl text-sm">
                    <span className="block text-indigo-400 font-semibold mb-1 text-xs">{h.level}</span>
                    <p className="text-indigo-100 whitespace-pre-wrap">{h.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Editor */}
        <div className="flex-1 lg:w-2/3 bg-[#0d0d1a]/80 border border-[#1e1e35] rounded-3xl overflow-hidden flex flex-col shadow-xl">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e1e35] bg-[#151525]">
            <div className="flex items-center gap-3">
              <span className="text-slate-300 font-medium text-sm">Language:</span>
              <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-[#1e1e35] border-none text-white text-sm rounded-lg px-2 py-1 outline-none"
              >
                <option value="Python">Python</option>
                <option value="Java">Java</option>
                <option value="C++">C++</option>
                <option value="JavaScript">JavaScript</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleRunCode}
                disabled={isRunning}
                className="flex items-center gap-2 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                <PlayCircle className="w-4 h-4" />
                {isRunning ? 'Running...' : 'Run Code'}
              </button>
              <button
                onClick={handleSubmit}
                disabled={!isSubmitEnabled}
                className={`flex items-center gap-2 px-4 py-1.5 text-white rounded-lg text-sm font-medium transition-colors ${
                  isSubmitEnabled 
                    ? 'bg-emerald-600 hover:bg-emerald-500' 
                    : 'bg-[#1e1e35] text-slate-500 cursor-not-allowed'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                Submit
              </button>
            </div>
          </div>
          <div className="flex-1">
            <Editor
              height="100%"
              theme="vs-dark"
              language={language === 'C++' ? 'cpp' : language === 'JavaScript' ? 'javascript' : language.toLowerCase()}
              value={code}
              onChange={handleCodeChange}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: 'JetBrains Mono, monospace',
                lineHeight: 24,
                padding: { top: 16 },
                scrollBeyondLastLine: false,
                roundedSelection: false,
              }}
            />
          </div>
          {runResult && (
            <div className={`p-4 border-t border-[#1e1e35] ${runResult.passed ? 'bg-emerald-900/20 text-emerald-100' : 'bg-red-900/20 text-red-100'} text-sm`}>
              <span className={`font-semibold mb-1 block ${runResult.passed ? 'text-emerald-400' : 'text-red-400'}`}>
                {runResult.passed ? '✅ Passed Test Cases' : '❌ Failed Test Cases'}
              </span>
              <p className="whitespace-pre-wrap">{runResult.feedback}</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  const renderResult = () => (
    <div className="max-w-md mx-auto text-center space-y-6 animate-in zoom-in-95 duration-500 mt-20">
      <div className="w-24 h-24 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
        <CheckCircle2 className="w-12 h-12 text-emerald-400" />
      </div>
      <h2 className="text-3xl font-bold text-white">Solution Submitted!</h2>
      <p className="text-slate-400">Your solution has been saved. Keep practicing to improve your skills.</p>
      
      <div className="pt-8 flex flex-col gap-3">
        <button
          onClick={handleRetake}
          className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors"
        >
          Solve Another Problem
        </button>
        <Link
          to="/coding/history"
          className="px-6 py-3 rounded-xl border border-indigo-500/40 text-indigo-300 hover:bg-indigo-600/10 font-medium transition-colors flex items-center justify-center gap-2"
        >
          <History className="w-4 h-4" />
          View My History
        </Link>
        <Link
          to="/dashboard"
          className="px-6 py-3 rounded-xl border border-[#2d2d4e] text-slate-300 hover:bg-[#1e1e35] font-medium transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'linear-gradient(135deg, #0f0f1a 0%, #0d0d1a 100%)' }}>
      
      {/* ── Desktop Sidebar ─────────────────────────────────────────── */}
      <div className="hidden md:block relative">
        <Sidebar
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
          onLogout={handleLogout}
          currentPath="/coding"
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
              currentPath="/coding"
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

          <div className="hidden md:flex items-center gap-3">
            <Code2 className="w-4 h-4 text-indigo-400" />
            <span className="text-white font-semibold text-sm">Coding Module</span>
          </div>

          <div className="flex items-center gap-4 ml-auto">
            <Link
              to="/coding/history"
              className="hidden md:flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors"
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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
            {step === 'SETUP'    && renderSetup()}
            {step === 'LOADING'  && renderLoading()}
            {step === 'CODING'   && renderCoding()}
            {step === 'RESULT'   && renderResult()}
          </div>
        </div>

      </main>
    </div>
  )
}
