import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { Eye, EyeOff, LogIn, Brain } from 'lucide-react'

function LoginPage() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const { login } = useAuth()

  // If user was redirected here from a protected page, go back there after login
  // But always honour isProfileComplete — incomplete profiles go to onboarding first
  const intendedDestination = location.state?.from?.pathname || '/dashboard'

  const [formData,     setFormData]     = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading,      setLoading]      = useState(false)

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.email || !formData.password) {
      toast.error('Please enter your email and password')
      return
    }

    setLoading(true)
    try {
      const data = await login({ email: formData.email.trim(), password: formData.password })
      toast.success('Welcome back! 👋')

      // Route based on profile completion status
      if (!data.user?.isProfileComplete) {
        navigate('/onboarding', { replace: true })
      } else {
        navigate(intendedDestination, { replace: true })
      }
    } catch (error) {
      const msg = error?.response?.data?.message || 'Login failed. Please check your credentials.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
         style={{ background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #0f0f1a 100%)' }}>

      {/* Background decorative circles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-indigo-600/10 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-purple-600/10 blur-3xl" />
      </div>

      <div className="w-full max-w-md animate-slide-up relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 mb-4">
            <Brain className="w-7 h-7 text-indigo-400" />
          </div>
          <h1 className="text-3xl font-bold text-white">MockWise AI</h1>
          <p className="text-slate-400 mt-1 text-sm">AI-Powered Interview Preparation Platform</p>
        </div>

        {/* Card */}
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div>
              <label htmlFor="email" className="label">Email Address</label>
              <input
                id="email" name="email" type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                className="input-field"
                autoComplete="email"
                required
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="label mb-0">Password</label>
                {/* Forgot password placeholder — can be wired up later */}
                <button type="button" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  id="password" name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field pr-12"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-400 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in...</>
              ) : (
                <><LogIn className="w-4 h-4" /> Sign In</>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-[#2d2d4e]" />
            <span className="text-xs text-slate-500">Don't have an account?</span>
            <div className="flex-1 h-px bg-[#2d2d4e]" />
          </div>

          {/* Register link */}
          <Link
            to="/register"
            className="btn-secondary w-full flex items-center justify-center gap-2 text-sm"
          >
            Create a free account
          </Link>
        </div>

      </div>
    </div>
  )
}

export default LoginPage
