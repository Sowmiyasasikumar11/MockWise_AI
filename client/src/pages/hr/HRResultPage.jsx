import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getHRInterviewById } from '../../services/hrService'
import Sidebar from '../../components/dashboard/Sidebar'
import { useAuth } from '../../context/AuthContext'
import {
  Menu, ChevronLeft, Mic, Target, Award,
  Star, MessageCircle, BarChart3, ThumbsUp, TrendingUp, CheckCircle2
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function HRResultPage() {
  const { id } = useParams()
  const { logout } = useAuth()
  const navigate = useNavigate()

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  
  const [interview, setInterview] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const data = await getHRInterviewById(id)
        if (data.success) {
          setInterview(data.data)
        } else {
          toast.error('Failed to load interview results')
        }
      } catch (err) {
        toast.error('Error fetching interview data')
      } finally {
        setLoading(false)
      }
    }
    fetchResult()
  }, [id])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a16] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!interview) {
    return (
      <div className="min-h-screen bg-[#0a0a16] flex items-center justify-center text-white">
        Result not found.
      </div>
    )
  }

  const ScoreCard = ({ label, score, icon: Icon, color }) => (
    <div className={`bg-[#131323] border border-[#1e1e35] rounded-xl p-4 flex flex-col justify-between`}>
      <div className="flex items-center justify-between mb-2">
        <Icon className={`w-5 h-5 ${color}`} />
        <span className="text-2xl font-bold text-white">{score}%</span>
      </div>
      <p className="text-slate-400 text-xs font-medium">{label}</p>
      <div className="w-full bg-[#1e1e35] h-1.5 rounded-full mt-3 overflow-hidden">
        <div className={`h-full rounded-full ${color.replace('text-', 'bg-')}`} style={{ width: `${score}%` }} />
      </div>
    </div>
  )

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
              <Link to="/hr/history" className="p-2 -ml-2 text-slate-400 hover:text-white rounded-lg hover:bg-[#1e1e35] transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </Link>
              <div className="w-8 h-8 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center">
                <Target className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-white">Interview Result</h1>
                <p className="text-[11px] font-medium text-slate-500">{interview.role} ({interview.experience})</p>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8 custom-scrollbar">
          <div className="max-w-5xl mx-auto space-y-6">

            {/* Overall Score Banner */}
            <div className="bg-gradient-to-r from-purple-900/40 to-indigo-900/40 border border-purple-500/20 rounded-2xl p-6 lg:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 blur-[100px] rounded-full pointer-events-none" />
              
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Interview Performance</h2>
                <p className="text-slate-400 text-sm max-w-xl">
                  Your AI-evaluated performance based on Relevance, Communication, Confidence, STAR method, and Professionalism.
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-1">Overall Score</p>
                  <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">
                    {interview.overallScore}%
                  </p>
                </div>
                <div className="w-16 h-16 rounded-full border-4 border-purple-500/30 flex items-center justify-center">
                  <Award className="w-8 h-8 text-purple-400" />
                </div>
              </div>
            </div>

            {/* Detailed Scores */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <ScoreCard label="Communication" score={interview.communicationScore} icon={MessageCircle} color="text-blue-400" />
              <ScoreCard label="Confidence" score={interview.confidenceScore} icon={Target} color="text-emerald-400" />
              <ScoreCard label="STAR Method" score={interview.starScore} icon={Star} color="text-amber-400" />
              <ScoreCard label="Professionalism" score={interview.professionalismScore} icon={CheckCircle2} color="text-rose-400" />
            </div>

            {/* Strengths & Weaknesses */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-[#131323] border border-[#1e1e35] rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <ThumbsUp className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-semibold text-white">Key Strengths</h3>
                </div>
                <ul className="space-y-3">
                  {interview.strengths?.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-slate-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-[#131323] border border-[#1e1e35] rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-rose-400" />
                  <h3 className="font-semibold text-white">Areas to Improve</h3>
                </div>
                <ul className="space-y-3">
                  {interview.weaknesses?.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-slate-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Actionable Suggestions */}
            <div className="bg-[#131323] border border-purple-500/20 rounded-2xl p-6">
               <div className="flex items-center gap-2 mb-4">
                  <Mic className="w-5 h-5 text-purple-400" />
                  <h3 className="font-semibold text-white">Personalized Suggestions</h3>
                </div>
                <ul className="space-y-3">
                  {interview.suggestions?.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-slate-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
            </div>

            {/* Detailed Question Feedback */}
            <div className="mt-8">
              <h3 className="text-xl font-bold text-white mb-6">Question Breakdown</h3>
              <div className="space-y-6">
                {interview.evaluation?.map((evalItem, idx) => (
                  <div key={idx} className="bg-[#131323] border border-[#1e1e35] rounded-2xl p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-purple-400 text-sm font-bold">Q{idx + 1}</span>
                      </div>
                      <h4 className="text-white font-medium leading-relaxed">{evalItem.questionText}</h4>
                    </div>

                    <div className="pl-12 space-y-4">
                      <div className="bg-[#0a0a16] border border-[#2d2d4e] rounded-xl p-4">
                        <p className="text-xs font-semibold text-slate-500 mb-1 uppercase">Your Answer</p>
                        <p className="text-sm text-slate-300 whitespace-pre-wrap">{evalItem.userAnswer || 'No answer provided.'}</p>
                      </div>
                      
                      <div className="bg-purple-500/5 border border-purple-500/10 rounded-xl p-4">
                        <p className="text-xs font-semibold text-purple-400 mb-1 uppercase">AI Feedback</p>
                        <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">{evalItem.feedback}</p>
                      </div>

                      <div className="flex flex-wrap gap-4 pt-2">
                        <div className="flex items-center gap-2 bg-[#0a0a16] px-3 py-1.5 rounded-lg border border-[#2d2d4e]">
                          <span className="text-xs text-slate-400">Relevance</span>
                          <span className="text-sm font-bold text-white">{evalItem.relevanceScore}%</span>
                        </div>
                        <div className="flex items-center gap-2 bg-[#0a0a16] px-3 py-1.5 rounded-lg border border-[#2d2d4e]">
                          <span className="text-xs text-slate-400">Communication</span>
                          <span className="text-sm font-bold text-white">{evalItem.communicationScore}%</span>
                        </div>
                        <div className="flex items-center gap-2 bg-[#0a0a16] px-3 py-1.5 rounded-lg border border-[#2d2d4e]">
                          <span className="text-xs text-slate-400">Confidence</span>
                          <span className="text-sm font-bold text-white">{evalItem.confidenceScore}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}
