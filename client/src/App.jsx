import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { useAuth } from './context/AuthContext'
import ProtectedRoute from './components/common/ProtectedRoute'

// ── Auth Pages ──────────────────────────────────────────────────────
import LoginPage      from './pages/auth/LoginPage'
import RegisterPage   from './pages/auth/RegisterPage'
import ProfilePage    from './pages/auth/ProfilePage'
import OnboardingPage from './pages/auth/OnboardingPage'

// ── Dashboard ───────────────────────────────────────────────────────
import DashboardPage from './pages/dashboard/DashboardPage'
import AptitudePage from './pages/dashboard/AptitudePage'
import AptitudeHistoryPage from './pages/dashboard/AptitudeHistoryPage'

// ────────────────────────────────────────────────────────────────────
// PublicRoute — redirects already-authenticated users to /dashboard.
// Used for "/" and "/register" so logged-in users skip the auth pages.
// ────────────────────────────────────────────────────────────────────
function PublicRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center"
           style={{ background: '#0f0f1a' }}>
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return user ? <Navigate to="/dashboard" replace /> : children
}

function App() {
  return (
    <AuthProvider>
      <Router>
        {/* Global toast notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background:   '#1e1e35',
              color:        '#f1f5f9',
              border:       '1px solid #2d2d4e',
              borderRadius: '12px',
            },
          }}
        />

        <Routes>
          {/* "/" → LoginPage (redirects to /dashboard if already logged in) */}
          <Route
            path="/"
            element={<PublicRoute><LoginPage /></PublicRoute>}
          />

          {/* "/register" → RegisterPage (redirects to /dashboard if already logged in) */}
          <Route
            path="/register"
            element={<PublicRoute><RegisterPage /></PublicRoute>}
          />

          {/* "/login" → alias for "/" — same behaviour */}
          <Route
            path="/login"
            element={<PublicRoute><LoginPage /></PublicRoute>}
          />

          {/* Protected Routes — require authentication */}
          <Route element={<ProtectedRoute />}>
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/dashboard"  element={<DashboardPage />} />
            <Route path="/profile"    element={<ProfilePage />} />
            <Route path="/aptitude"   element={<AptitudePage />} />
            <Route path="/aptitude/history" element={<AptitudeHistoryPage />} />
            {/* Module routes added in later sprints */}
          </Route>

          {/* Fallback — unknown paths go to login */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
