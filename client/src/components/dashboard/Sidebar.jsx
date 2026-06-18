import { Link } from 'react-router-dom'
import {
  Brain, ChevronLeft, ChevronRight, LayoutDashboard,
  Code2, Mic, Briefcase, FileText, User,
  Settings, LogOut, BarChart3, Bot
} from 'lucide-react'

// ── Navigation items ────────────────────────────────────────────────
const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard',       href: '/dashboard',  active: false },
  { icon: Brain,           label: 'Aptitude',        href: '/aptitude',   active: false },
  { icon: Code2,           label: 'Coding',          href: '/coding',     active: false },
  { icon: FileText,        label: 'Resume Analyzer', href: '/resume',     soon: true },
  { icon: Mic,             label: 'HR Interview',    href: '/hr',         soon: true },
]

const NAV_BOTTOM = [
  { icon: User,     label: 'Profile',  href: '/profile'  },
]

export default function Sidebar({ collapsed, setCollapsed, onLogout, currentPath }) {
  // Update active state based on currentPath
  const items = NAV_ITEMS.map(item => ({
    ...item,
    active: item.href === currentPath
  }))

  return (
    <aside
      className={`flex flex-col h-screen bg-[#0d0d1a] border-r border-[#1e1e35] transition-all duration-300 flex-shrink-0 ${
        collapsed ? 'w-[68px]' : 'w-64'
      }`}
    >
      {/* Brand */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-[#1e1e35] ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center flex-shrink-0">
          <Brain className="w-4 h-4 text-indigo-400" />
        </div>
        {!collapsed && (
          <span className="text-white font-bold text-base whitespace-nowrap">MockWise AI</span>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute top-5 -right-3 w-6 h-6 rounded-full bg-[#1e1e35] border border-[#2d2d4e] flex items-center justify-center text-slate-400 hover:text-white hover:bg-indigo-600/30 transition-all duration-200 z-50"
        style={{ position: 'absolute', left: collapsed ? '54px' : '245px' }}
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>

      {/* Main nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {!collapsed && (
          <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest px-3 mb-2">
            Menu
          </p>
        )}
        {items.map(({ icon: Icon, label, href, active, soon }) => (
          <Link
            key={label}
            to={soon ? '#' : href}
            className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative ${
              active
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            } ${collapsed ? 'justify-center' : ''}`}
            title={collapsed ? label : undefined}
          >
            <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-indigo-400' : ''}`} />
            {!collapsed && (
              <>
                <span className="flex-1">{label}</span>
                {soon && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-slate-700 text-slate-400">
                    Soon
                  </span>
                )}
              </>
            )}
            {/* Active indicator */}
            {active && (
              <span className="absolute right-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-indigo-500 rounded-l-full" />
            )}
          </Link>
        ))}
      </nav>

      {/* Bottom nav */}
      <div className="px-2 pb-4 pt-2 border-t border-[#1e1e35] space-y-1">
        {NAV_BOTTOM.map(({ icon: Icon, label, href, soon }) => (
          <Link
            key={label}
            to={soon ? '#' : href}
            className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-200 ${
              collapsed ? 'justify-center' : ''
            }`}
            title={collapsed ? label : undefined}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span>{label}</span>}
          </Link>
        ))}

        {/* Logout */}
        <button
          onClick={onLogout}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200 ${
            collapsed ? 'justify-center' : ''
          }`}
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  )
}
