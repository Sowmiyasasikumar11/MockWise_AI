import { createContext, useContext, useEffect, useState } from 'react'
import authService from '../services/authService'

const AuthContext = createContext(null)

/**
 * AuthProvider — wraps the app and provides global auth state.
 * Persists user and token in localStorage across refreshes.
 */
export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)

  // ── Rehydrate on page load ─────────────────────────────────────────
  useEffect(() => {
    const storedUser  = localStorage.getItem('user')
    const storedToken = localStorage.getItem('token')

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  // ── Register ───────────────────────────────────────────────────────
  const register = async (formData) => {
    const { data } = await authService.register(formData)
    localStorage.setItem('token', data.token)
    localStorage.setItem('user',  JSON.stringify(data.user))
    setUser(data.user)
    return data
  }

  // ── Login ──────────────────────────────────────────────────────────
  const login = async (formData) => {
    const { data } = await authService.login(formData)
    localStorage.setItem('token', data.token)
    localStorage.setItem('user',  JSON.stringify(data.user))
    setUser(data.user)
    return data
  }

  // ── Logout ─────────────────────────────────────────────────────────
  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  // ── Update user in context after profile edit / onboarding ────────
  const updateUser = (updatedUser) => {
    localStorage.setItem('user', JSON.stringify(updatedUser))
    setUser(updatedUser)
  }

  // ── Derived helpers ────────────────────────────────────────────────
  /** True once user has completed onboarding */
  const isProfileComplete = !!user?.isProfileComplete

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout, updateUser, isProfileComplete }}>
      {children}
    </AuthContext.Provider>
  )
}

/** Hook to consume AuthContext */
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
