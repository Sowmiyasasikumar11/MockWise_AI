import API from './api'

/**
 * Auth service — wraps all /auth API calls
 */
const authService = {
  /** Register a new user (name, email, password only) */
  register: (data) => API.post('/auth/register', data),

  /** Login with email & password */
  login: (data) => API.post('/auth/login', data),

  /** Get current authenticated user's profile */
  getMe: () => API.get('/auth/me'),

  /**
   * Complete onboarding — saves targetRoles, experience, skills, resume.
   * Accepts FormData (for file upload support).
   */
  completeOnboarding: (formData) =>
    API.post('/auth/onboarding', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  /**
   * Update profile fields.
   * Accepts FormData (for file upload support).
   */
  updateProfile: (data) => {
    // If it's a FormData instance (has resume), use multipart header
    if (data instanceof FormData) {
      return API.put('/auth/profile', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    }
    return API.put('/auth/profile', data)
  },

  /** Change password */
  changePassword: (data) => API.put('/auth/password', data),
}

export default authService
