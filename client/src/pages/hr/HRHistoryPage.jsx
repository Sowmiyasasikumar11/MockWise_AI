import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Sidebar from '../../components/dashboard/Sidebar'
import { getHRHistory } from '../../services/hrService'
import {
  Menu, ChevronLeft, Mic, Search, Filter, ArrowUpRight, Target
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function HRHistoryPage() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await getHRHistory()
        if (data.success) {
          setHistory(data.data)
        }
      } catch (error) {
        toast.error('Failed to load history')
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
              <Link to="/hr" className="p-2 -ml-2 text-slate-400 hover:text-white rounded-lg hover:bg-[#1e1e35] transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </Link>
              <div className="w-8 h-8 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center">
                <Mic className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-white">HR Interview History</h1>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8 custom-scrollbar">
          <div className="max-w-6xl mx-auto space-y-6">
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div>
                <h2 className="text-2xl font-bold text-white">Past Interviews</h2>
                <p className="text-sm text-slate-400 mt-1">Review your performance and AI feedback</p>
              </div>
              
              <Link 
                to="/hr" 
                className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
              >
                Start New Interview
              </Link>
            </div>

            {loading ? (
              <div className="flex justify-center py-20">
                <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : history.length === 0 ? (
              <div className="bg-[#131323] border border-[#1e1e35] rounded-2xl p-12 text-center">
                <div className="w-20 h-20 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mic className="w-10 h-10 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No Interviews Yet</h3>
                <p className="text-slate-400 max-w-md mx-auto mb-6">
                  You haven't taken any HR interviews yet. Start your first interview to get AI-powered feedback!
                </p>
                <Link 
                  to="/hr" 
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-medium inline-block transition-colors"
                >
                  Start Practice
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {history.map((item) => (
                  <div key={item._id} className="bg-[#131323] border border-[#1e1e35] rounded-2xl p-6 hover:border-purple-500/30 transition-colors flex flex-col h-full">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-white mb-1 line-clamp-1" title={item.role}>
                          {item.role}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <Target className="w-3.5 h-3.5" />
                          {item.experience} Exp
                        </div>
                      </div>
                      <div className="bg-purple-500/10 border border-purple-500/20 text-purple-400 px-3 py-1 rounded-lg text-sm font-bold shrink-0">
                        {item.status === 'completed' ? `${item.overallScore}%` : 'Pending'}
                      </div>
                    </div>
                    
                    <div className="mt-auto pt-6 border-t border-[#1e1e35] flex items-center justify-between">
                      <span className="text-xs text-slate-500">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                      {item.status === 'completed' ? (
                        <Link 
                          to={`/hr/result/${item._id}`}
                          className="flex items-center gap-1.5 text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors"
                        >
                          View Report <ArrowUpRight className="w-4 h-4" />
                        </Link>
                      ) : (
                        <span className="text-sm font-medium text-amber-500">Incomplete</span>
                      )}
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
