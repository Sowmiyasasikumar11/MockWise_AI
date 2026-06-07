import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import authService from '../../services/authService'
import toast from 'react-hot-toast'
import {
  Brain, Briefcase, Star, Code2, Upload, X,
  ChevronRight, ArrowRight, SkipForward, CheckCircle2, Plus
} from 'lucide-react'

// ── Predefined role options ──────────────────────────────────────────
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

function OnboardingPage() {
  const navigate    = useNavigate()
  const { user, updateUser } = useAuth()

  // ── Step management ────────────────────────────────────────────────
  const [step, setStep] = useState(1) // 1 = Roles, 2 = Experience & Skills, 3 = Resume
  const TOTAL_STEPS = 3

  // ── Form state ─────────────────────────────────────────────────────
  const [selectedRoles,  setSelectedRoles]  = useState([])
  const [customRole,     setCustomRole]     = useState('')
  const [experience,     setExperience]     = useState('')
  const [skillInput,     setSkillInput]     = useState('')
  const [skills,         setSkills]         = useState([])
  const [resumeFile,     setResumeFile]     = useState(null)
  const [loading,        setLoading]        = useState(false)

  // ── Role selection ─────────────────────────────────────────────────
  const toggleRole = (role) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    )
  }

  const addCustomRole = () => {
    const trimmed = customRole.trim()
    if (!trimmed) return
    if (selectedRoles.includes(trimmed)) {
      toast.error('This role is already selected')
      return
    }
    setSelectedRoles((prev) => [...prev, trimmed])
    setCustomRole('')
  }

  const removeRole = (role) => {
    setSelectedRoles((prev) => prev.filter((r) => r !== role))
  }

  // ── Skills input ───────────────────────────────────────────────────
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

  const removeSkill = (skill) => {
    setSkills((prev) => prev.filter((s) => s !== skill))
  }

  // ── Resume ─────────────────────────────────────────────────────────
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

  // ── Navigation ─────────────────────────────────────────────────────
  const nextStep = () => {
    if (step === 1 && selectedRoles.length === 0) {
      toast.error('Please select at least one target role')
      return
    }
    setStep((s) => Math.min(s + 1, TOTAL_STEPS))
  }

  // ── Submit ─────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setLoading(true)
    try {
      const formData = new FormData()
      selectedRoles.forEach((r) => formData.append('targetRoles[]', r))
      if (experience) formData.append('experience', experience)
      skills.forEach((s) => formData.append('skills[]', s))
      if (resumeFile) formData.append('resume', resumeFile)

      const { data } = await authService.completeOnboarding(formData)
      updateUser(data.user)
      toast.success('Profile setup complete! 🎉')
      navigate('/dashboard', { replace: true })
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── Skip ──────────────────────────────────────────────────────────
  const handleSkip = async () => {
    setLoading(true)
    try {
      // Still mark as complete so we don't keep showing onboarding
      const formData = new FormData()
      selectedRoles.forEach((r) => formData.append('targetRoles[]', r))
      if (experience) formData.append('experience', experience)
      skills.forEach((s) => formData.append('skills[]', s))

      const { data } = await authService.completeOnboarding(formData)
      updateUser(data.user)
      navigate('/dashboard', { replace: true })
    } catch {
      // Even if the API call fails, let the user through
      navigate('/dashboard', { replace: true })
    } finally {
      setLoading(false)
    }
  }

  // ── Step indicators ────────────────────────────────────────────────
  const stepLabels = ['Target Roles', 'Experience & Skills', 'Resume']

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #0f0f1a 100%)' }}
    >
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-indigo-600/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-purple-600/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-violet-600/5 blur-3xl" />
      </div>

      <div className="w-full max-w-2xl relative z-10 animate-slide-up">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 mb-4">
            <Brain className="w-7 h-7 text-indigo-400" />
          </div>
          <p className="text-xs font-semibold tracking-widest text-indigo-400 uppercase mb-2">MockWise AI</p>
          <h1 className="text-3xl font-bold text-white">Set Up Your Profile</h1>
          <p className="text-slate-400 mt-1 text-sm">
            Hi {user?.name?.split(' ')[0] || 'there'}! Help us personalise your MockWise AI experience.
          </p>
        </div>

        {/* Step progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {stepLabels.map((label, idx) => {
              const s = idx + 1
              const isActive    = s === step
              const isCompleted = s < step
              return (
                <div key={s} className="flex flex-col items-center flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mb-1.5 transition-all duration-300 ${
                    isCompleted
                      ? 'bg-indigo-600 text-white'
                      : isActive
                        ? 'bg-indigo-600/30 border-2 border-indigo-500 text-indigo-300'
                        : 'bg-[#1e1e35] border border-[#2d2d4e] text-slate-500'
                  }`}>
                    {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : s}
                  </div>
                  <span className={`text-xs hidden sm:block ${isActive ? 'text-indigo-300' : 'text-slate-500'}`}>
                    {label}
                  </span>
                  {s < TOTAL_STEPS && (
                    <div className={`absolute h-0.5 top-4 transition-all duration-300`} />
                  )}
                </div>
              )
            })}
          </div>
          {/* Progress bar */}
          <div className="h-1.5 bg-[#2d2d4e] rounded-full overflow-hidden mt-2">
            <div
              className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full transition-all duration-500"
              style={{ width: `${((step - 1) / (TOTAL_STEPS - 1)) * 100}%` }}
            />
          </div>
        </div>

        {/* Card */}
        <div className="card">

          {/* ── Step 1: Target Roles ──────────────────────────────── */}
          {step === 1 && (
            <div className="animate-fade-in">
              <div className="flex items-center gap-2 mb-2">
                <Briefcase className="w-5 h-5 text-indigo-400" />
                <h2 className="text-lg font-semibold text-white">What roles are you targeting?</h2>
              </div>
              <p className="text-slate-400 text-sm mb-6">Select all that apply. You can choose multiple roles.</p>

              {/* Role grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-5">
                {ROLE_OPTIONS.map((role) => {
                  const selected = selectedRoles.includes(role)
                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={() => toggleRole(role)}
                      className={`px-3 py-2.5 rounded-xl text-sm font-medium text-left transition-all duration-200 border ${
                        selected
                          ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-sm shadow-indigo-500/10'
                          : 'bg-[#1a1a2e] border-[#2d2d4e] text-slate-400 hover:border-indigo-500/40 hover:text-slate-300'
                      }`}
                    >
                      {selected && <CheckCircle2 className="w-3 h-3 inline-block mr-1.5 text-indigo-400" />}
                      {role}
                    </button>
                  )
                })}
              </div>

              {/* Custom role input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add a custom role..."
                  value={customRole}
                  onChange={(e) => setCustomRole(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomRole())}
                  className="input-field flex-1"
                />
                <button
                  type="button"
                  onClick={addCustomRole}
                  className="btn-secondary flex items-center gap-1.5 px-4 flex-shrink-0"
                >
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>

              {/* Selected roles preview */}
              {selectedRoles.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs text-slate-500 mb-2">Selected ({selectedRoles.length}):</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedRoles.map((role) => (
                      <span
                        key={role}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/15 text-indigo-300 border border-indigo-500/20"
                      >
                        {role}
                        <button
                          type="button"
                          onClick={() => removeRole(role)}
                          className="hover:text-red-400 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Step 2: Experience & Skills ───────────────────────── */}
          {step === 2 && (
            <div className="animate-fade-in">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-5 h-5 text-indigo-400" />
                <h2 className="text-lg font-semibold text-white">Experience & Skills</h2>
              </div>
              <p className="text-slate-400 text-sm mb-6">Tell us about your background so we can tailor questions.</p>

              {/* Years of experience */}
              <div className="mb-5">
                <label className="label">Years of Experience</label>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                  {[0, 1, 2, 3, 5, 7, '10+'].map((yr) => (
                    <button
                      key={yr}
                      type="button"
                      onClick={() => setExperience(yr === '10+' ? 10 : yr)}
                      className={`py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border ${
                        experience === (yr === '10+' ? 10 : yr)
                          ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                          : 'bg-[#1a1a2e] border-[#2d2d4e] text-slate-400 hover:border-indigo-500/40'
                      }`}
                    >
                      {yr}{yr !== '10+' && yr !== 0 ? '' : ''}{yr === 0 ? ' (Fresher)' : ''}
                    </button>
                  ))}
                </div>
                {/* Manual input fallback */}
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-xs text-slate-500">Or enter manually:</span>
                  <input
                    type="number"
                    min="0" max="50"
                    placeholder="0"
                    value={experience}
                    onChange={(e) => setExperience(Number(e.target.value))}
                    className="input-field w-24 text-center"
                  />
                  <span className="text-xs text-slate-500">years</span>
                </div>
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
                    placeholder="e.g. React, Python, Node.js"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={handleSkillKeyDown}
                    className="input-field flex-1"
                  />
                  <button
                    type="button"
                    onClick={addSkill}
                    className="btn-secondary flex items-center gap-1.5 px-4 flex-shrink-0"
                  >
                    <Plus className="w-4 h-4" /> Add
                  </button>
                </div>

                {/* Skill badges */}
                {skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {skills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-purple-500/15 text-purple-300 border border-purple-500/20"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="hover:text-red-400 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Step 3: Resume Upload ─────────────────────────────── */}
          {step === 3 && (
            <div className="animate-fade-in">
              <div className="flex items-center gap-2 mb-2">
                <Upload className="w-5 h-5 text-indigo-400" />
                <h2 className="text-lg font-semibold text-white">Upload Your Resume</h2>
              </div>
              <p className="text-slate-400 text-sm mb-6">
                Optional — helps us generate more relevant interview questions.
                Accepted formats: PDF, DOC, DOCX (max 5 MB).
              </p>

              {/* Drop zone */}
              <label
                htmlFor="resume-upload"
                className={`block border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200 ${
                  resumeFile
                    ? 'border-indigo-500 bg-indigo-500/5'
                    : 'border-[#2d2d4e] hover:border-indigo-500/50 hover:bg-indigo-500/5'
                }`}
              >
                <input
                  id="resume-upload"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleResumeChange}
                  className="hidden"
                />
                {resumeFile ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{resumeFile.name}</p>
                      <p className="text-slate-400 text-sm mt-0.5">
                        {(resumeFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); setResumeFile(null) }}
                      className="text-xs text-red-400 hover:text-red-300 transition-colors flex items-center gap-1"
                    >
                      <X className="w-3 h-3" /> Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#1e1e35] border border-[#2d2d4e] flex items-center justify-center">
                      <Upload className="w-6 h-6 text-slate-500" />
                    </div>
                    <div>
                      <p className="text-slate-300 font-medium">Click to upload or drag & drop</p>
                      <p className="text-slate-500 text-sm mt-0.5">PDF, DOC, DOCX up to 5 MB</p>
                    </div>
                  </div>
                )}
              </label>

              {/* Summary of what's been set */}
              <div className="mt-6 p-4 rounded-xl bg-[#1a1a2e] border border-[#2d2d4e] space-y-3">
                <h3 className="text-sm font-medium text-slate-300">Profile Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Target Roles</span>
                    <span className="text-indigo-300 text-right max-w-[60%]">{selectedRoles.join(', ') || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Experience</span>
                    <span className="text-slate-300">{experience !== '' ? `${experience} yr${experience !== 1 ? 's' : ''}` : '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Skills</span>
                    <span className="text-slate-300">{skills.length > 0 ? `${skills.length} added` : '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Resume</span>
                    <span className="text-slate-300">{resumeFile ? resumeFile.name : 'Not uploaded'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Navigation buttons ────────────────────────────────── */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-[#2d2d4e]">
            {/* Back / Skip */}
            <div className="flex items-center gap-3">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep((s) => s - 1)}
                  className="btn-secondary px-5"
                >
                  Back
                </button>
              )}
              <button
                type="button"
                onClick={handleSkip}
                disabled={loading}
                className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 transition-colors"
              >
                <SkipForward className="w-4 h-4" />
                {step === TOTAL_STEPS ? 'Skip & Finish' : 'Skip for now'}
              </button>
            </div>

            {/* Next / Finish */}
            {step < TOTAL_STEPS ? (
              <button
                type="button"
                onClick={nextStep}
                className="btn-primary flex items-center gap-2 px-6"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="btn-primary flex items-center gap-2 px-6"
              >
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
                ) : (
                  <>Finish Setup <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default OnboardingPage
