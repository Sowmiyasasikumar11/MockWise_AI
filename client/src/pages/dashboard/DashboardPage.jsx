import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  Brain, LayoutDashboard,
  Code2, Mic, Briefcase, FileText, BarChart3, User,
  Settings, LogOut, Zap, BookOpen, TrendingUp, Menu, X,
  Target, Award, Clock, Sparkles, ChevronDown, Bot
} from 'lucide-react'
import Sidebar from '../../components/dashboard/Sidebar'
import api from '../../services/api'

// ── 30 Career & Interview-Focused Motivational Quotes ──────────────
const QUOTES = [
  { text: "Every bug you solve today becomes experience you leverage tomorrow.", role: null },
  { text: "Consistency beats intensity in interview preparation.", role: null },
  { text: "The best time to prepare was yesterday. The second best time is now.", role: null },
  { text: "Your skills are your superpower. Keep sharpening them every single day.", role: null },
  { text: "An interview is not a test — it's a conversation about your potential.", role: null },
  { text: "Rejection is redirection. Every 'no' brings you closer to your perfect 'yes'.", role: null },
  { text: "The candidate who prepares the most confidently, wins the most consistently.", role: null },
  { text: "Coding is not about memorisation — it's about problem-solving mindset.", role: null },
  { text: "Every senior engineer was once a junior who didn't give up.", role: null },
  { text: "Data structures and algorithms are the grammar of computer science.", role: null },
  { text: "Build things. Break things. Learn things. That's the engineer's journey.", role: null },
  { text: "Your portfolio speaks louder than your resume. Keep shipping.", role: null },
  { text: "The mock interviews you do today are the real interviews you'll ace tomorrow.", role: null },
  { text: "Speak your thought process aloud — interviewers hire thinkers, not just coders.", role: null },
  { text: "Growth happens outside the comfort zone. Push one step further each day.", role: null },
  { text: "One hour of deep, focused practice is worth more than ten hours of distraction.", role: null },
  { text: "Imposter syndrome is just the feeling of being on the edge of your competence.", role: null },
  { text: "Every great engineer started with 'Hello, World.'", role: null },
  { text: "Your next breakthrough is on the other side of one more practice problem.", role: null },
  { text: "Documentation is the love letter you write to your future self.", role: null },
  { text: "Mastering Full Stack development makes you a builder of the future.", role: "Full Stack Developer" },
  { text: "AI and ML are the new electricity. Keep learning to stay lit.", role: "Machine Learning Engineer" },
  { text: "The backend powers every great user experience. Your work matters deeply.", role: "Backend Developer" },
  { text: "Beautiful interfaces change how people feel. Design with intention.", role: "Frontend Developer" },
  { text: "Data is the new oil — and you're learning to refine it.", role: "Data Scientist" },
  { text: "Reliability at scale is the ultimate engineering achievement.", role: "DevOps Engineer" },
  { text: "The cloud is limitless. Your architecture defines what's possible.", role: "Cloud Architect" },
  { text: "Research today, revolution tomorrow. Keep pushing the boundaries of AI.", role: "AI/ML Researcher" },
  { text: "Clean code is not written for computers. It's written for humans.", role: null },
  { text: "Every expert was once a beginner who simply refused to quit.", role: null },
  { text: "System design is the art of making good trade-offs under real constraints.", role: null },
  { text: "The best preparation is not cramming — it's deep, deliberate practice.", role: null },
]



// ── Main Dashboard Component ────────────────────────────────────────
function DashboardPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [recentActivity, setRecentActivity] = useState(null)
  
  useEffect(() => {
    const fetchRecentActivity = async () => {
      try {
        const response = await api.get('/aptitude/history')
        if (response.data.success && response.data.data.length > 0) {
          setRecentActivity(response.data.data[0])
        }
      } catch (err) {
        console.error("Failed to fetch recent activity", err)
      }
    }
    fetchRecentActivity()
  }, [])

  // Pick a random quote, biased towards user's target roles if available
  const quote = useMemo(() => {
    const roles = user?.targetRoles || []
    const roleSpecific = QUOTES.filter(
      (q) => q.role && roles.some((r) => r.toLowerCase().includes(q.role.toLowerCase()))
    )
    const pool = roleSpecific.length > 0
      ? [...roleSpecific, ...QUOTES.filter((q) => !q.role)]
      : QUOTES
    return pool[Math.floor(Math.random() * pool.length)]
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only once per mount (page load / login)

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const stats = [
    { label: 'Interviews',  value: user?.totalInterviews ?? 0,                                  icon: Mic,       color: 'from-indigo-500/20 to-indigo-600/10', border: 'border-indigo-500/20', text: 'text-indigo-400'  },
    { label: 'Aptitude Tests', value: user?.aptitudeTestsTaken ?? 0,                             icon: Brain,     color: 'from-blue-500/20 to-blue-600/10', border: 'border-blue-500/20', text: 'text-blue-400'  },
    { label: 'Avg Aptitude', value: user?.averageAptitudeScore ? `${user.averageAptitudeScore.toFixed(0)}%` : '—', icon: TrendingUp, color: 'from-purple-500/20 to-purple-600/10', border: 'border-purple-500/20', text: 'text-purple-400'  },
    { label: 'Coding Solved', value: user?.codingProblemsSolved ?? 0,                            icon: Code2,     color: 'from-emerald-500/20 to-emerald-600/10', border: 'border-emerald-500/20', text: 'text-emerald-400' },
    { label: 'Coding Acc',    value: user?.codingAccuracy ? `${user.codingAccuracy}%` : '—',     icon: Award,     color: 'from-rose-500/20 to-rose-600/10', border: 'border-rose-500/20', text: 'text-rose-400' },
    { label: 'Target Roles',  value: user?.targetRoles?.length ?? 0,                             icon: Target,    color: 'from-amber-500/20  to-amber-600/10',  border: 'border-amber-500/20',  text: 'text-amber-400'   },
  ]

  return (
    <div className="flex h-screen overflow-hidden"
         style={{ background: 'linear-gradient(135deg, #0f0f1a 0%, #0d0d1a 100%)' }}>

      {/* ── Desktop Sidebar ─────────────────────────────────────────── */}
      <div className="hidden md:block relative">
        <Sidebar
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
          onLogout={handleLogout}
          currentPath="/dashboard"
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
              currentPath="/dashboard"
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
          {/* Mobile menu button */}
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="md:hidden text-slate-400 hover:text-white transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Page title */}
          <div className="hidden md:flex items-center gap-2">
            <LayoutDashboard className="w-4 h-4 text-indigo-400" />
            <span className="text-white font-semibold text-sm">Dashboard</span>
          </div>

          {/* User info */}
          <div className="flex items-center gap-3 ml-auto">
            <div className="text-right hidden sm:block">
              <p className="text-white text-sm font-medium leading-tight">{user?.name}</p>
              <p className="text-slate-500 text-xs">{user?.email}</p>
            </div>
            <Link to="/profile">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white cursor-pointer hover:opacity-90 transition-opacity">
                {initials}
              </div>
            </Link>
          </div>
        </header>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">

            {/* ── Welcome section ──────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">
                  Welcome back,{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                    {user?.name?.split(' ')[0]}
                  </span>{' '}
                  👋
                </h1>
                <p className="text-slate-400 mt-1 text-sm">
                  {user?.targetRoles?.length > 0
                    ? `Preparing for: ${user.targetRoles.slice(0, 3).join(' · ')}${user.targetRoles.length > 3 ? ` +${user.targetRoles.length - 3}` : ''}`
                    : 'Start practicing with MockWise AI — ace your next interview'}
                </p>
              </div>

              {/* Target role pills */}
              {user?.targetRoles?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 sm:justify-end">
                  {user.targetRoles.slice(0, 3).map((role) => (
                    <span
                      key={role}
                      className="text-xs px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 whitespace-nowrap"
                    >
                      {role}
                    </span>
                  ))}
                  {user.targetRoles.length > 3 && (
                    <span className="text-xs px-3 py-1 rounded-full bg-slate-500/10 text-slate-400 border border-slate-600/20">
                      +{user.targetRoles.length - 3} more
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.map(({ label, value, icon: Icon, color, border, text }) => (
                <div
                  key={label}
                  className={`rounded-2xl p-5 bg-gradient-to-br ${color} border ${border} hover:scale-[1.02] transition-transform duration-200`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <Icon className={`w-4 h-4 ${text}`} />
                  </div>
                  <p className={`text-2xl font-bold ${text}`}>{value}</p>
                  <p className="text-slate-400 text-xs mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            {/* ── Motivation Quote Card ─────────────────────────────── */}
            <div className="relative rounded-2xl overflow-hidden border border-indigo-500/20 bg-gradient-to-br from-indigo-600/10 via-purple-600/5 to-transparent p-6">
              {/* Decorative glow */}
              <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-purple-600/10 blur-3xl pointer-events-none" />

              <div className="relative z-10 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-indigo-400 uppercase tracking-widest mb-2">
                    Today's Motivation
                  </p>
                  <blockquote className="text-white font-medium text-base sm:text-lg leading-relaxed">
                    "{quote.text}"
                  </blockquote>
                  {quote.role && (
                    <p className="text-indigo-400 text-xs mt-2 flex items-center gap-1.5">
                      <Target className="w-3 h-3" /> For {quote.role}s
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* ── Two-column lower section ──────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Recent Activity */}
              <div className="rounded-2xl border border-[#1e1e35] bg-[#0d0d1a]/60 p-6">
                <div className="flex items-center gap-2 mb-5">
                  <Clock className="w-4 h-4 text-indigo-400" />
                  <h2 className="text-white font-semibold text-sm">Recent Activity</h2>
                </div>
                <div className="space-y-3">
                  {recentActivity ? (
                    <div className="flex items-center gap-4 p-3 rounded-xl bg-[#1e1e35]/40 border border-[#2d2d4e] hover:bg-[#1e1e35]/80 transition-colors">
                      <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                        <Brain className="w-5 h-5 text-indigo-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">Aptitude: {recentActivity.category}</p>
                        <p className="text-slate-400 text-xs mt-0.5">
                          {new Date(recentActivity.completedAt).toLocaleDateString()} · {recentActivity.difficulty}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className={`text-sm font-bold ${
                          recentActivity.percentage >= 70 ? 'text-emerald-400' :
                          recentActivity.percentage >= 40 ? 'text-amber-400' :
                          'text-rose-400'
                        }`}>
                          {Math.round(recentActivity.percentage)}%
                        </p>
                        <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Score</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-500 text-sm text-center py-4">No activity yet. Start an interview!</p>
                  )}
                </div>
              </div>

              {/* Recommended Practice */}
              <div className="rounded-2xl border border-[#1e1e35] bg-[#0d0d1a]/60 p-6">
                <div className="flex items-center gap-2 mb-5">
                  <BookOpen className="w-4 h-4 text-purple-400" />
                  <h2 className="text-white font-semibold text-sm">Recommended Practice</h2>
                </div>
                <div className="space-y-3">
                  <p className="text-slate-500 text-sm text-center py-4">Recommendations will appear here.</p>
                </div>
              </div>
            </div>

            {/* ── Quick Action Banner ───────────────────────────────── */}
            <div className="rounded-2xl border border-[#1e1e35] bg-gradient-to-r from-indigo-600/10 to-purple-600/10 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-white font-semibold text-base">Ready to start your first interview?</h3>
                <p className="text-slate-400 text-sm mt-0.5">
                  Modules are launching soon. Complete your profile to get personalised questions.
                </p>
              </div>
              <Link
                to="/profile"
                className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors duration-200"
              >
                <User className="w-4 h-4" /> Complete Profile
              </Link>
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}

export default DashboardPage
