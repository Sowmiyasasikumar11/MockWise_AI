import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { Eye, EyeOff, UserPlus, Brain, CheckCircle2 } from 'lucide-react'

function RegisterPage() {
  const navigate    = useNavigate()
  const { register } = useAuth()

  const [formData, setFormData] = useState({
    name:            '',
    email:           '',
    password:        '',
    confirmPassword: '',
  })
  const [showPassword,        setShowPassword]        = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading,             setLoading]             = useState(false)

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  // Password strength indicator
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { level: 0, label: '', color: '' }
    let score = 0
    if (pwd.length >= 6)          score++
    if (pwd.length >= 10)         score++
    if (/\d/.test(pwd))           score++
    if (/[A-Z]/.test(pwd))        score++
    if (/[^a-zA-Z0-9]/.test(pwd)) score++
    if (score <= 1) return { level: 1, label: 'Weak',   color: 'bg-red-500' }
    if (score <= 3) return { level: 2, label: 'Fair',   color: 'bg-yellow-500' }
    return              { level: 3, label: 'Strong', color: 'bg-green-500' }
  }

  const strength = getPasswordStrength(formData.password)
  const passwordsMatch = formData.confirmPassword && formData.password === formData.confirmPassword

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      toast.error('Please fill in all fields')
      return
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    if (!/\d/.test(formData.password)) {
      toast.error('Password must contain at least one number')
      return
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      await register({
        name:     formData.name.trim(),
        email:    formData.email.trim(),
        password: formData.password,
      })
      toast.success('Account created! Let\'s set up your profile 🎉')
      navigate('/onboarding')
    } catch (error) {
      const msg = error?.response?.data?.message || 'Registration failed. Please try again.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12"
         style={{ background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #0f0f1a 100%)' }}>

      {/* Background decorative circles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-indigo-600/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-purple-600/10 blur-3xl" />
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

            {/* Full Name */}
            <div>
              <label htmlFor="name" className="label">Full Name <span className="text-red-400">*</span></label>
              <input
                id="name" name="name" type="text"
                placeholder="e.g. Sowmiya M S"
                value={formData.name}
                onChange={handleChange}
                className="input-field"
                autoComplete="name"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="label">Email Address <span className="text-red-400">*</span></label>
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
              <label htmlFor="password" className="label">Password <span className="text-red-400">*</span></label>
              <div className="relative">
                <input
                  id="password" name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 6 characters with a number"
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field pr-12"
                  autoComplete="new-password"
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
              {/* Password strength bar */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          i <= strength.level ? strength.color : 'bg-[#2d2d4e]'
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`text-xs ${
                    strength.level === 1 ? 'text-red-400' :
                    strength.level === 2 ? 'text-yellow-400' : 'text-green-400'
                  }`}>{strength.label} password</p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="label">Confirm Password <span className="text-red-400">*</span></label>
              <div className="relative">
                <input
                  id="confirmPassword" name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Repeat your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`input-field pr-12 ${
                    formData.confirmPassword && !passwordsMatch
                      ? 'border-red-500/50 focus:border-red-500'
                      : passwordsMatch
                        ? 'border-green-500/50 focus:border-green-500'
                        : ''
                  }`}
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-400 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {formData.confirmPassword && (
                <p className={`text-xs mt-1 flex items-center gap-1 ${passwordsMatch ? 'text-green-400' : 'text-red-400'}`}>
                  {passwordsMatch
                    ? <><CheckCircle2 className="w-3 h-3" /> Passwords match</>
                    : 'Passwords do not match'
                  }
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating account...</>
              ) : (
                <><UserPlus className="w-4 h-4" /> Create Account</>
              )}
            </button>
          </form>

          {/* Footer link */}
          <p className="text-center text-sm text-slate-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>

        {/* Back to login */}
        <p className="text-center text-sm text-slate-500 mt-6">
          <Link to="/" className="hover:text-slate-300 transition-colors">← Back to Login</Link>
        </p>
      </div>
    </div>
  )
}

export default RegisterPage
