import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import authService from '../../services/authService'
import toast from 'react-hot-toast'
import {
  User, Mail, Briefcase, Star, Code2,
  Save, Lock, LogOut, Shield, X, Plus, Upload, CheckCircle2
} from 'lucide-react'

// Predefined role options (same as onboarding)
const ROLE_OPTIONS = [
  'Full Stack Developer',
  'Frontend Developer',
  'Backend Developer',
  'Machine Learning Engineer',
  'Data Scientist',
  'DevOps Engineer',
  'Cloud Architect',
  'Mobile Developer',
  'UI/UX Designer',
  'Product Manager',
  'Data Engineer',
  'Cybersecurity Engineer',
  'QA Engineer',
  'Software Architect',
  'AI/ML Researcher',
]

function ProfilePage() {
  const { user, updateUser, logout } = useAuth()

  const [activeTab, setActiveTab] = useState('profile') // 'profile' | 'password'
  const [loading,   setLoading]   = useState(false)

  // ── Profile form state ─────────────────────────────────────────────
  const [profileForm, setProfileForm] = useState({
    name:        user?.name       || '',
    experience:  user?.experience ?? 0,
  })

  // targetRoles — array, managed separately
  const [selectedRoles, setSelectedRoles] = useState(user?.targetRoles || [])
  const [customRole,    setCustomRole]    = useState('')

  // skills — array, managed separately
  const [skills,      setSkills]      = useState(user?.skills || [])
  const [skillInput,  setSkillInput]  = useState('')

  // resume
  const [resumeFile, setResumeFile] = useState(null)

  // ── Password form state ────────────────────────────────────────────
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword:     '',
    confirmPassword: '',
  })
  const [showPasswords, setShowPasswords] = useState(false)

  // ── Role helpers ────────────────────────────────────────────────────
  const toggleRole = (role) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    )
  }

  const addCustomRole = () => {
    const trimmed = customRole.trim()
    if (!trimmed) return
    if (selectedRoles.includes(trimmed)) {
      toast.error('This role is already added')
      return
    }
    setSelectedRoles((prev) => [...prev, trimmed])
    setCustomRole('')
  }

  const removeRole = (role) => setSelectedRoles((prev) => prev.filter((r) => r !== role))

  // ── Skill helpers ───────────────────────────────────────────────────
  const addSkill = () => {
    const trimmed = skillInput.trim()
    if (!trimmed) return
    const newSkills = trimmed.split(',').map((s) => s.trim()).filter(Boolean)
    const unique    = newSkills.filter((s) => !skills.includes(s))
    if (unique.length) setSkills((prev) => [...prev, ...unique])
    setSkillInput('')
  }

  const handleSkillKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addSkill()
    }
  }

  const removeSkill = (skill) => setSkills((prev) => prev.filter((s) => s !== skill))

  // ── Resume handler ──────────────────────────────────────────────────
  const handleResumeChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const ext = file.name.split('.').pop().toLowerCase()
    if (!['pdf', 'doc', 'docx'].includes(ext)) {
      toast.error('Only PDF, DOC, or DOCX files are accepted')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Resume must be under 5 MB')
      return
    }
    setResumeFile(file)
  }

  // ── Submit profile ──────────────────────────────────────────────────
  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('name',       profileForm.name.trim())
      formData.append('experience', Number(profileForm.experience))
      selectedRoles.forEach((r) => formData.append('targetRoles[]', r))
      skills.forEach((s)       => formData.append('skills[]', s))
      if (resumeFile) formData.append('resume', resumeFile)

      const { data } = await authService.updateProfile(formData)
      updateUser(data.user)
      toast.success('Profile updated successfully!')
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  // ── Submit password ─────────────────────────────────────────────────
  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters')
      return
    }
    setLoading(true)
    try {
      await authService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword:     passwordForm.newPassword,
      })
      toast.success('Password changed successfully!')
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
  }

  // Avatar initials
  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  return (
    <div className="min-h-screen py-12 px-4"
         style={{ background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%)' }}>
      <div className="max-w-3xl mx-auto animate-slide-up">

        {/* ── Header Card ─────────────────────────────────────────── */}
        <div className="card mb-6 flex items-center gap-5">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600
                          flex items-center justify-center text-2xl font-bold text-white flex-shrink-0">
            {initials}
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-white truncate">{user?.name}</h1>
            <p className="text-slate-400 text-sm mt-0.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" /> {user?.email}
            </p>
            {user?.targetRoles?.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {user.targetRoles.slice(0, 3).map((role) => (
                  <span key={role} className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/20">
                    {role}
                  </span>
                ))}
                {user.targetRoles.length > 3 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-400">
                    +{user.targetRoles.length - 3} more
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="hidden sm:flex gap-6 text-center">
            <div>
              <p className="text-2xl font-bold text-white">{user?.totalInterviews ?? 0}</p>
              <p className="text-xs text-slate-400 mt-0.5">Interviews</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {user?.averageScore ? user.averageScore.toFixed(1) : '—'}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">Avg Score</p>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm text-red-400 hover:text-red-300
                       border border-red-500/30 hover:border-red-400/50 rounded-xl px-3 py-2
                       transition-all duration-200 flex-shrink-0"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>

        {/* ── Tab Navigation ───────────────────────────────────────── */}
        <div className="flex gap-2 mb-6">
          {[
            { id: 'profile',  label: 'Profile',  icon: User },
            { id: 'password', label: 'Security', icon: Shield },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium
                          transition-all duration-200 ${
                activeTab === id
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                  : 'text-slate-400 hover:text-white border border-[#2d2d4e] hover:border-indigo-500/50'
              }`}
            >
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>

        {/* ── Profile Tab ──────────────────────────────────────────── */}
        {activeTab === 'profile' && (
          <div className="card animate-fade-in">
            <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-400" /> Edit Profile
            </h2>
            <form onSubmit={handleProfileSubmit} className="space-y-6">

              {/* Name */}
              <div>
                <label className="label">Full Name</label>
                <input
                  name="name" type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))}
                  className="input-field"
                  placeholder="Your full name"
                />
              </div>

              {/* Target Roles — multi-select */}
              <div>
                <label className="label flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-indigo-400" /> Target Roles
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                  {ROLE_OPTIONS.map((role) => {
                    const selected = selectedRoles.includes(role)
                    return (
                      <button
                        key={role}
                        type="button"
                        onClick={() => toggleRole(role)}
                        className={`px-3 py-2 rounded-xl text-xs font-medium text-left transition-all duration-200 border ${
                          selected
                            ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                            : 'bg-[#1a1a2e] border-[#2d2d4e] text-slate-400 hover:border-indigo-500/40'
                        }`}
                      >
                        {selected && <CheckCircle2 className="w-3 h-3 inline-block mr-1 text-indigo-400" />}
                        {role}
                      </button>
                    )
                  })}
                </div>
                {/* Custom role */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add a custom role..."
                    value={customRole}
                    onChange={(e) => setCustomRole(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomRole())}
                    className="input-field flex-1"
                  />
                  <button type="button" onClick={addCustomRole} className="btn-secondary px-4 flex-shrink-0">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {/* Selected preview */}
                {selectedRoles.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {selectedRoles.map((role) => (
                      <span key={role} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-indigo-500/15 text-indigo-300 border border-indigo-500/20">
                        {role}
                        <button type="button" onClick={() => removeRole(role)} className="hover:text-red-400">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Experience */}
              <div>
                <label className="label flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-indigo-400" /> Years of Experience
                </label>
                <input
                  name="experience" type="number"
                  min="0" max="50"
                  value={profileForm.experience}
                  onChange={(e) => setProfileForm((p) => ({ ...p, experience: e.target.value }))}
                  className="input-field w-32"
                />
              </div>

              {/* Skills */}
              <div>
                <label className="label flex items-center gap-1.5">
                  <Code2 className="w-4 h-4 text-indigo-400" />
                  Skills <span className="text-slate-500 font-normal">(press Enter or comma to add)</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. React, Python"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={handleSkillKeyDown}
                    className="input-field flex-1"
                  />
                  <button type="button" onClick={addSkill} className="btn-secondary px-4 flex-shrink-0">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {skills.map((skill) => (
                      <span key={skill} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-purple-500/15 text-purple-300 border border-purple-500/20">
                        {skill}
                        <button type="button" onClick={() => removeSkill(skill)} className="hover:text-red-400">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Resume Upload */}
              <div>
                <label className="label flex items-center gap-1.5">
                  <Upload className="w-4 h-4 text-indigo-400" /> Resume (optional)
                </label>
                {user?.resumePath && !resumeFile && (
                  <p className="text-xs text-slate-400 mb-2">
                    Current: <span className="text-indigo-300">{user.resumePath.split('/').pop() || user.resumePath.split('\\').pop()}</span>
                  </p>
                )}
                <label
                  htmlFor="profile-resume"
                  className={`block border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
                    resumeFile
                      ? 'border-indigo-500 bg-indigo-500/5'
                      : 'border-[#2d2d4e] hover:border-indigo-500/50'
                  }`}
                >
                  <input id="profile-resume" type="file" accept=".pdf,.doc,.docx" onChange={handleResumeChange} className="hidden" />
                  {resumeFile ? (
                    <div className="flex items-center justify-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-indigo-400" />
                      <span className="text-white text-sm">{resumeFile.name}</span>
                      <button type="button" onClick={(e) => { e.preventDefault(); setResumeFile(null) }} className="text-red-400 hover:text-red-300">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="text-slate-500 text-sm">
                      <Upload className="w-5 h-5 mx-auto mb-1 opacity-50" />
                      Click to upload PDF, DOC, or DOCX (max 5 MB)
                    </div>
                  )}
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex items-center gap-2"
              >
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
                ) : (
                  <><Save className="w-4 h-4" /> Save Changes</>
                )}
              </button>
            </form>
          </div>
        )}

        {/* ── Security Tab ─────────────────────────────────────────── */}
        {activeTab === 'password' && (
          <div className="card animate-fade-in">
            <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Lock className="w-5 h-5 text-indigo-400" /> Change Password
            </h2>
            <form onSubmit={handlePasswordSubmit} className="space-y-5">

              <div>
                <label className="label">Current Password</label>
                <input
                  name="currentPassword"
                  type={showPasswords ? 'text' : 'password'}
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))}
                  className="input-field"
                  placeholder="Enter current password"
                  required
                />
              </div>

              <div>
                <label className="label">New Password</label>
                <input
                  name="newPassword"
                  type={showPasswords ? 'text' : 'password'}
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))}
                  className="input-field"
                  placeholder="Min. 6 characters with a number"
                  required
                />
              </div>

              <div>
                <label className="label">Confirm New Password</label>
                <input
                  name="confirmPassword"
                  type={showPasswords ? 'text' : 'password'}
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                  className={`input-field ${
                    passwordForm.confirmPassword &&
                    passwordForm.newPassword !== passwordForm.confirmPassword
                      ? 'border-red-500/50 focus:border-red-500'
                      : ''
                  }`}
                  placeholder="Repeat new password"
                  required
                />
                {passwordForm.confirmPassword &&
                 passwordForm.newPassword !== passwordForm.confirmPassword && (
                  <p className="text-red-400 text-xs mt-1">Passwords do not match</p>
                )}
              </div>

              <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-400">
                <input
                  type="checkbox"
                  checked={showPasswords}
                  onChange={() => setShowPasswords(!showPasswords)}
                  className="rounded"
                />
                Show passwords
              </label>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex items-center gap-2"
              >
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Updating...</>
                ) : (
                  <><Lock className="w-4 h-4" /> Update Password</>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProfilePage
