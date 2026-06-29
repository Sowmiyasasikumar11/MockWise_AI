import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Sidebar from '../../components/dashboard/Sidebar'
import { getHistory } from '../../services/codingService'
import {
  Menu, ChevronLeft, Code2, History, Clock,
  CheckCircle2, ArrowRight
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function CodingHistoryPage() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await getHistory()
        if (data.success) {
          setHistory(data.data)
        }
      } catch (err) {
        console.error('Error fetching coding history:', err)
        toast.error('Failed to load coding history')
      } finally {
        setLoading(false)
      }
    }
    fetchHistory()
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const difficultyColor = (d) => {
    if (d === 'Easy')   return 'bg-green-500/10 text-green-400 border-green-500/20'
    if (d === 'Medium') return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
    return                     'bg-red-500/10 text-red-400 border-red-500/20'
  }

  const langColor = (l) => {
    if (l === 'Python')     return 'text-blue-400 bg-blue-500/10 border-blue-500/20'
    if (l === 'Java')       return 'text-orange-400 bg-orange-500/10 border-orange-500/20'
    if (l === 'C++')        return 'text-purple-400 bg-purple-500/10 border-purple-500/20'
    if (l === 'JavaScript') return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
    return 'text-slate-400 bg-slate-500/10 border-slate-500/20'
  }

  return (
    <div className="min-h-screen bg-[#0a0a16] flex font-sans text-slate-200">

      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      <div className={`
        fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 lg:relative lg:translate-x-0
        ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <Sidebar
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
          onLogout={handleLogout}
          currentPath="/coding"
        />
      </div>

      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">

        <header className="h-16 flex items-center justify-between px-4 lg:px-8 border-b border-[#1e1e35] bg-[#0d0d1a]/80 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 text-slate-400 hover:text-white rounded-lg hover:bg-[#1e1e35] transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <Link
                to="/coding"
                className="p-2 -ml-2 text-slate-400 hover:text-white rounded-lg hover:bg-[#1e1e35] transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </Link>
              <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
                <Code2 className="w-4 h-4 text-indigo-400" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-white">Coding History</h1>
                <p className="text-[11px] text-slate-500">Past submissions</p>
              </div>
            </div>
          </div>
          <Link
            to="/coding"
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
          >
            New Problem
          </Link>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8 custom-scrollbar">
          <div className="max-w-5xl mx-auto space-y-6">

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div>
                <h2 className="text-2xl font-bold text-white">Past Submissions</h2>
                <p className="text-sm text-slate-400 mt-1">Review your coding interview solutions</p>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-20">
                <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : history.length === 0 ? (
              <div className="bg-[#131323] border border-[#1e1e35] rounded-2xl p-12 text-center">
                <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <History className="w-10 h-10 text-indigo-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No Submissions Yet</h3>
                <p className="text-slate-400 max-w-md mx-auto mb-6">
                  You haven&apos;t submitted any coding solutions yet. Start solving problems to build your history!
                </p>
                <Link
                  to="/coding"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-medium inline-block transition-colors"
                >
                  Start Practicing
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {history.map((item, idx) => (
                  <div
                    key={item._id || idx}
                    className="bg-[#131323] border border-[#1e1e35] rounded-2xl p-6 hover:border-indigo-500/30 transition-all duration-200"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                          <Code2 className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold text-base">
                            {item.question?.statement?.slice(0, 100)}
                            {item.question?.statement?.length > 100 ? '\u2026' : ''}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${difficultyColor(item.difficulty)}`}>
                              {item.difficulty}
                            </span>
                            <span className="text-xs text-slate-400 bg-[#1e1e35] px-2 py-0.5 rounded-full">
                              {item.category}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${langColor(item.language)}`}>
                              {item.language}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-emerald-400 flex-shrink-0">
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="text-sm font-medium">Submitted</span>
                      </div>
                    </div>

                    {item.code && (
                      <div className="bg-[#0a0a16] rounded-xl p-4 mb-4 overflow-x-auto border border-[#1e1e35]">
                        <pre className="text-slate-300 text-xs font-mono leading-relaxed whitespace-pre-wrap break-all">
                          {item.code}
                        </pre>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(item.submittedAt || item.createdAt).toLocaleDateString()} at{' '}
                        {new Date(item.submittedAt || item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <Link
                        to="/coding"
                        className="flex items-center gap-1 text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                      >
                        Try Again <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  )
}
