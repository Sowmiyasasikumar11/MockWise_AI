import { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import {
  FileText, UploadCloud, CheckCircle, Clock,
  AlertCircle, Loader2, History, ChevronDown,
  ChevronUp, Menu, X, Target, Zap, Shield,
  TrendingUp, TrendingDown, Star, BookOpen,
  Briefcase, Award, User, AlignLeft, Code,
  GraduationCap, Phone, XCircle, MinusCircle
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { uploadResume, analyzeResume, getResumeHistory } from '../../services/resumeService'
import Sidebar from '../../components/dashboard/Sidebar'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'

// ── Helpers ──────────────────────────────────────────────────────────

/**
 * Returns colour class + label for an ATS score.
 */
function atsColour(score) {
  if (score >= 75) return { bar: '#22c55e', text: 'text-emerald-400', label: 'Excellent' }
  if (score >= 50) return { bar: '#f59e0b', text: 'text-amber-400', label: 'Moderate' }
  return { bar: '#ef4444', text: 'text-rose-400', label: 'Needs Work' }
}

const SECTION_META = {
  contact:        { label: 'Contact Information', Icon: Phone },
  summary:        { label: 'Summary / Objective',  Icon: AlignLeft },
  education:      { label: 'Education',            Icon: GraduationCap },
  skills:         { label: 'Skills',               Icon: Code },
  projects:       { label: 'Projects',             Icon: Briefcase },
  experience:     { label: 'Experience',           Icon: BookOpen },
  certifications: { label: 'Certifications',       Icon: Award },
}

const STATUS_META = {
  good:             { label: 'Good',              Icon: CheckCircle,  cls: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  needs_improvement:{ label: 'Needs Improvement', Icon: MinusCircle,  cls: 'text-amber-400',   bg: 'bg-amber-500/10   border-amber-500/20'   },
  missing:          { label: 'Missing',           Icon: XCircle,      cls: 'text-rose-400',    bg: 'bg-rose-500/10    border-rose-500/20'    },
}

// ── Sub-components ───────────────────────────────────────────────────

function ATSScoreCard({ score }) {
  const { bar, text, label } = atsColour(score)
  const pct = Math.min(100, Math.max(0, score))

  return (
    <div className="bg-gradient-to-br from-[#1e1e35] to-[#0d0d1a] border border-[#2d2d4e] rounded-2xl p-6">
      <h3 className="text-white font-semibold mb-5 flex items-center gap-2">
        <Target className="w-5 h-5 text-indigo-400" />
        ATS Compatibility Score
      </h3>

      <div className="flex items-center gap-6 flex-wrap">
        {/* Big score circle */}
        <div className="relative w-28 h-28 flex-shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" fill="none" stroke="#1e1e35" strokeWidth="10" />
            <circle
              cx="50" cy="50" r="42" fill="none"
              stroke={bar}
              strokeWidth="10"
              strokeDasharray={`${2 * Math.PI * 42}`}
              strokeDashoffset={`${2 * Math.PI * 42 * (1 - pct / 100)}`}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 1s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-2xl font-bold ${text}`}>{pct}</span>
            <span className="text-slate-500 text-xs">/100</span>
          </div>
        </div>

        {/* Progress bar + label */}
        <div className="flex-1 min-w-[180px]">
          <div className="flex justify-between items-center mb-2">
            <span className="text-slate-300 text-sm font-medium">ATS Score</span>
            <span className={`text-sm font-semibold ${text}`}>{label}</span>
          </div>
          <div className="h-3 bg-[#2d2d4e] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{ width: `${pct}%`, background: bar }}
            />
          </div>
          <p className="text-slate-500 text-xs mt-3 leading-relaxed">
            {pct >= 75
              ? 'Your resume is well-optimised for ATS systems. Most relevant keywords and sections are present.'
              : pct >= 50
              ? 'Moderate ATS compatibility. Adding more keywords, quantified metrics, and improving sections will help.'
              : 'Low ATS compatibility. Recruiters\' systems may filter this resume out. Significant improvements recommended.'}
          </p>
        </div>
      </div>
    </div>
  )
}

function MissingSkillsCard({ missingSkills }) {
  if (!missingSkills || missingSkills.length === 0) return null
  return (
    <div className="bg-gradient-to-br from-[#1e1e35] to-[#0d0d1a] border border-[#2d2d4e] rounded-2xl p-6">
      <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
        <Zap className="w-5 h-5 text-rose-400" />
        Missing Skills
        <span className="ml-auto text-xs text-slate-500">Skills important to your field but absent in your resume</span>
      </h3>
      <div className="flex flex-wrap gap-2">
        {missingSkills.map((skill, i) => (
          <span
            key={i}
            className="px-3 py-1 bg-rose-500/10 text-rose-300 border border-rose-500/20 rounded-full text-sm flex items-center gap-1.5"
          >
            <XCircle className="w-3 h-3" /> {skill}
          </span>
        ))}
      </div>
    </div>
  )
}

function SectionAnalysisCard({ sectionAnalysis }) {
  if (!sectionAnalysis) return null
  const entries = Object.entries(SECTION_META)

  return (
    <div className="bg-gradient-to-br from-[#1e1e35] to-[#0d0d1a] border border-[#2d2d4e] rounded-2xl p-6">
      <h3 className="text-white font-semibold mb-5 flex items-center gap-2">
        <Shield className="w-5 h-5 text-purple-400" />
        Resume Section Analysis
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {entries.map(([key, { label, Icon }]) => {
          const status = sectionAnalysis[key] || 'missing'
          const sm = STATUS_META[status] || STATUS_META.missing
          const SIcon = sm.Icon
          return (
            <div
              key={key}
              className={`flex items-start gap-3 p-3 rounded-xl border ${sm.bg}`}
            >
              <Icon className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-white text-xs font-medium truncate">{label}</p>
                <div className={`flex items-center gap-1 mt-1 ${sm.cls}`}>
                  <SIcon className="w-3 h-3 flex-shrink-0" />
                  <span className="text-xs">{sm.label}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ActionableSuggestionsCard({ actionableSuggestions }) {
  if (!actionableSuggestions || actionableSuggestions.length === 0) return null
  return (
    <div className="bg-gradient-to-br from-[#1e1e35] to-[#0d0d1a] border border-[#2d2d4e] rounded-2xl p-6">
      <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-sky-400" />
        Actionable Suggestions
      </h3>
      <ol className="space-y-3">
        {actionableSuggestions.map((sug, i) => (
          <li key={i} className="flex gap-3 text-slate-300 text-sm">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-bold flex items-center justify-center">
              {i + 1}
            </span>
            <span className="leading-relaxed pt-0.5">{sug}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}

function StrengthsWeaknessesCard({ strengths, weaknesses }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {/* Strengths */}
      {strengths && strengths.length > 0 && (
        <div className="bg-gradient-to-br from-[#1e1e35] to-[#0d0d1a] border border-[#2d2d4e] rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-emerald-400" />
            Top Strengths
          </h3>
          <ul className="space-y-2.5">
            {strengths.map((s, i) => (
              <li key={i} className="flex gap-2 text-slate-300 text-sm">
                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Weaknesses */}
      {weaknesses && weaknesses.length > 0 && (
        <div className="bg-gradient-to-br from-[#1e1e35] to-[#0d0d1a] border border-[#2d2d4e] rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-rose-400" />
            Areas to Improve
          </h3>
          <ul className="space-y-2.5">
            {weaknesses.map((w, i) => (
              <li key={i} className="flex gap-2 text-slate-300 text-sm">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function MockWiseAdvantageCard() {
  const features = [
    {
      icon: Target,
      title: 'ATS Score & Section Analysis',
      desc: 'Get an estimated ATS compatibility score and per-section breakdown — just like Jobscan.',
      colour: 'text-indigo-400',
      bg: 'bg-indigo-500/10 border-indigo-500/20',
    },
    {
      icon: Code,
      title: 'Coding Interview Prep',
      desc: 'Practice real DSA problems and get AI-powered code evaluation — unique to MockWise AI.',
      colour: 'text-sky-400',
      bg: 'bg-sky-500/10 border-sky-500/20',
    },
    {
      icon: User,
      title: 'HR & Behavioural Interviews',
      desc: 'Simulate HR rounds with AI-driven questions and instant feedback on your responses.',
      colour: 'text-purple-400',
      bg: 'bg-purple-500/10 border-purple-500/20',
    },
    {
      icon: BookOpen,
      title: 'Aptitude Test Practice',
      desc: 'Sharpen quantitative and logical reasoning skills needed for campus and off-campus drives.',
      colour: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
    },
    {
      icon: Zap,
      title: 'All-in-One Platform',
      desc: 'Resume analysis + interview prep in a single dashboard. Jobscan & Resume Worded only do resumes.',
      colour: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20',
    },
  ]

  return (
    <div className="bg-gradient-to-br from-[#1a1a35] via-[#0f0f2a] to-[#0d0d1a] border border-indigo-500/20 rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center">
          <Zap className="w-4 h-4 text-indigo-400" />
        </div>
        <div>
          <h3 className="text-white font-semibold text-base">How MockWise AI Helps</h3>
          <p className="text-indigo-300 text-xs">vs Jobscan · Resume Worded</p>
        </div>
      </div>

      <p className="text-slate-400 text-sm mb-5 leading-relaxed">
        Unlike standalone resume tools, MockWise AI is a <span className="text-white font-medium">complete interview preparation platform</span>.
        Your resume feedback is directly connected to your interview practice — so improvements translate into real results.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {features.map(({ icon: Icon, title, desc, colour, bg }, i) => (
          <div key={i} className={`border rounded-xl p-4 ${bg}`}>
            <div className="flex items-center gap-2 mb-2">
              <Icon className={`w-4 h-4 ${colour}`} />
              <span className={`text-xs font-semibold ${colour}`}>{title}</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>

      {/* Comparison table */}
      <div className="mt-5 overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="border-b border-[#2d2d4e]">
              <th className="py-2 pr-4 text-slate-500 font-medium">Feature</th>
              <th className="py-2 px-3 text-slate-400 font-medium text-center">MockWise AI</th>
              <th className="py-2 px-3 text-slate-500 font-medium text-center">Jobscan</th>
              <th className="py-2 px-3 text-slate-500 font-medium text-center">Resume Worded</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['ATS Score',              true,  true,  true ],
              ['Section Analysis',       true,  true,  true ],
              ['Missing Skills',         true,  true,  true ],
              ['Actionable Suggestions', true,  true,  true ],
              ['Coding Interview Prep',  true,  false, false],
              ['HR Interview Simulator', true,  false, false],
              ['Aptitude Practice',      true,  false, false],
              ['Free to Use',            true,  false, false],
            ].map(([feat, mw, js, rw]) => (
              <tr key={feat} className="border-b border-[#2d2d4e]/50">
                <td className="py-2 pr-4 text-slate-300">{feat}</td>
                <td className="py-2 px-3 text-center">
                  {mw ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400 mx-auto" /> : <XCircle className="w-3.5 h-3.5 text-slate-600 mx-auto" />}
                </td>
                <td className="py-2 px-3 text-center">
                  {js ? <CheckCircle className="w-3.5 h-3.5 text-slate-400 mx-auto" /> : <XCircle className="w-3.5 h-3.5 text-slate-600 mx-auto" />}
                </td>
                <td className="py-2 px-3 text-center">
                  {rw ? <CheckCircle className="w-3.5 h-3.5 text-slate-400 mx-auto" /> : <XCircle className="w-3.5 h-3.5 text-slate-600 mx-auto" />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────

export default function ResumeAnalyzerPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  const [file, setFile] = useState(null)
  const [uploadStatus, setUploadStatus] = useState('idle') // idle, uploading, analyzing, complete, error
  const [uploadTime, setUploadTime] = useState(null)
  const [results, setResults] = useState(null)

  // History state
  const [history, setHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(true)
  const [expandedCards, setExpandedCards] = useState({})

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  // Fetch history on mount
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await getResumeHistory()
        if (res.success) setHistory(res.data)
      } catch (err) {
        console.error('Failed to load resume history', err)
      } finally {
        setHistoryLoading(false)
      }
    }
    fetchHistory()
  }, [])

  // Re-fetch history after a new analysis completes
  const refreshHistory = async () => {
    try {
      const res = await getResumeHistory()
      if (res.success) setHistory(res.data)
    } catch (_) {}
  }

  const toggleCard = (id) =>
    setExpandedCards(prev => ({ ...prev, [id]: !prev[id] }))

  // ── Constants ────────────────────────────────────────────────────────
  const MAX_FILE_SIZE_MB = 5
  const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

  const onDrop = useCallback(async (acceptedFiles) => {
    const selectedFile = acceptedFiles[0]
    if (!selectedFile) return

    // Guard: PDF type check
    if (selectedFile.type !== 'application/pdf') {
      toast.error('Only PDF files are allowed.')
      return
    }

    // Guard: file size check (5 MB cap — must match backend multer limit)
    if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
      toast.error(`File too large. Maximum allowed size is ${MAX_FILE_SIZE_MB} MB.`)
      return
    }

    setFile(selectedFile)
    setUploadStatus('uploading')
    setResults(null)
    setUploadTime(new Date().toLocaleTimeString())

    try {
      // 1. Upload & Parse
      const uploadRes = await uploadResume(selectedFile)
      if (!uploadRes.success) throw new Error('Upload failed')

      const { parsedText, filename } = uploadRes.data
      setUploadStatus('analyzing')

      // 2. Analyze via Gemini
      const analyzeRes = await analyzeResume(parsedText, filename)
      if (!analyzeRes.success) throw new Error('Analysis failed')

      setResults(analyzeRes.data)
      setUploadStatus('complete')
      toast.success('Resume analyzed successfully!')

      // 3. Refresh history to include the new entry
      await refreshHistory()

    } catch (err) {
      console.error(err)
      setUploadStatus('error')
      toast.error(err.response?.data?.message || err.message || 'An error occurred during analysis.')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Dropzone rejected-file handler ───────────────────────────────────
  const onDropRejected = useCallback((rejectedFiles) => {
    const rejection = rejectedFiles[0]
    if (!rejection) return
    const { errors } = rejection
    if (errors.some(e => e.code === 'file-too-large')) {
      toast.error(`File too large. Maximum allowed size is ${MAX_FILE_SIZE_MB} MB.`)
    } else if (errors.some(e => e.code === 'file-invalid-type')) {
      toast.error('Only PDF files are allowed.')
    } else {
      toast.error('File rejected. Please upload a valid PDF under 5 MB.')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    maxSize: MAX_FILE_SIZE_MB * 1024 * 1024
  })

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'linear-gradient(135deg, #0f0f1a 0%, #0d0d1a 100%)' }}>

      {/* ── Desktop Sidebar ─────────────────────────────────────────── */}
      <div className="hidden md:block relative">
        <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} onLogout={handleLogout} currentPath="/resume-analyzer" />
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
              currentPath="/resume-analyzer"
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
        <header className="flex items-center justify-between px-6 py-4 border-b border-[#1e1e35] flex-shrink-0">
          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="md:hidden text-slate-400 hover:text-white transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            <span className="text-white font-semibold text-sm">Resume Analyzer</span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Resume Analyzer</h1>
            <p className="text-slate-400">Upload your resume to get instant AI-powered feedback — ATS score, section analysis, missing skills, and more.</p>
          </div>

          <div className="flex flex-col gap-8">

            {/* ── Upload Area ─────────────────────────────────────── */}
            <div className="w-full space-y-6">
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                  isDragActive ? 'border-indigo-500 bg-indigo-500/10' : 'border-[#2d2d4e] bg-[#1e1e35]/30 hover:bg-[#1e1e35]/50'
                }`}
              >
                <input {...getInputProps()} />
                <UploadCloud className={`w-12 h-12 mx-auto mb-4 ${isDragActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                <p className="text-white font-medium mb-1">
                  {isDragActive ? 'Drop resume here...' : 'Drag & drop your resume'}
                </p>
                <p className="text-slate-400 text-sm">or click to browse · PDF only · max 5 MB</p>
              </div>

              {/* Preview & Status */}
              {file && (
                <div className="bg-[#1e1e35]/40 border border-[#2d2d4e] rounded-xl p-4">
                  <h3 className="text-white text-sm font-semibold mb-3">Upload Status</h3>
                  <div className="flex items-center gap-3 mb-2">
                    <FileText className="w-4 h-4 text-indigo-400" />
                    <span className="text-slate-300 text-sm truncate">{file.name}</span>
                  </div>
                  <div className="flex items-center gap-3 mb-2 text-sm">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-400">Uploaded at: {uploadTime}</span>
                  </div>

                  <div className="mt-4 pt-4 border-t border-[#2d2d4e]">
                    {uploadStatus === 'uploading' && (
                      <div className="flex items-center gap-2 text-amber-400 text-sm">
                        <Loader2 className="w-4 h-4 animate-spin" /> Extracting text...
                      </div>
                    )}
                    {uploadStatus === 'analyzing' && (
                      <div className="flex items-center gap-2 text-indigo-400 text-sm">
                        <Loader2 className="w-4 h-4 animate-spin" /> AI is analyzing...
                      </div>
                    )}
                    {uploadStatus === 'complete' && (
                      <div className="flex items-center gap-2 text-emerald-400 text-sm">
                        <CheckCircle className="w-4 h-4" /> Analysis complete
                      </div>
                    )}
                    {uploadStatus === 'error' && (
                      <div className="flex items-center gap-2 text-rose-400 text-sm">
                        <AlertCircle className="w-4 h-4" /> Error processing resume
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* ── Results Area ─────────────────────────────────────── */}
            <div className="w-full">
              {uploadStatus === 'idle' && (
                <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-[#1e1e35]/20 border border-[#2d2d4e] rounded-2xl">
                  <FileText className="w-16 h-16 text-slate-600 mb-4" />
                  <h3 className="text-white font-medium mb-2">No Resume Analyzed</h3>
                  <p className="text-slate-400 text-sm">Upload a PDF resume to see your ATS score, skills, section analysis, and more.</p>
                </div>
              )}

              {(uploadStatus === 'uploading' || uploadStatus === 'analyzing') && (
                <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-[#1e1e35]/20 border border-[#2d2d4e] rounded-2xl">
                  <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
                  <h3 className="text-white font-medium mb-2">Processing Document</h3>
                  <p className="text-slate-400 text-sm">This usually takes a few seconds...</p>
                </div>
              )}

              {uploadStatus === 'complete' && results && (
                <div className="space-y-6">

                  {/* ── 1. ATS Score ─────────────────────────────── */}
                  {results.atsScore != null && (
                    <ATSScoreCard score={results.atsScore} />
                  )}

                  {/* ── 2. Key Skills Found (existing) ───────────── */}
                  <div className="bg-gradient-to-br from-[#1e1e35] to-[#0d0d1a] border border-[#2d2d4e] rounded-2xl p-6">
                    <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-emerald-400" /> Key Skills Found
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {results.skills.map((skill, i) => (
                        <span key={i} className="px-3 py-1 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded-full text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* ── 3. Missing Skills ─────────────────────────── */}
                  {results.missingSkills && results.missingSkills.length > 0 && (
                    <MissingSkillsCard missingSkills={results.missingSkills} />
                  )}

                  {/* ── 4. Section Analysis ──────────────────────── */}
                  {results.sectionAnalysis && (
                    <SectionAnalysisCard sectionAnalysis={results.sectionAnalysis} />
                  )}

                  {/* ── 5. Actionable Suggestions ────────────────── */}
                  {results.actionableSuggestions && results.actionableSuggestions.length > 0 && (
                    <ActionableSuggestionsCard actionableSuggestions={results.actionableSuggestions} />
                  )}

                  {/* ── 6. Strengths & Weaknesses ────────────────── */}
                  {((results.strengths && results.strengths.length > 0) || (results.weaknesses && results.weaknesses.length > 0)) && (
                    <StrengthsWeaknessesCard strengths={results.strengths} weaknesses={results.weaknesses} />
                  )}

                  {/* ── 7. Existing: Areas for Improvement ───────── */}
                  {results.suggestions && results.suggestions.length > 0 && (
                    <div className="bg-gradient-to-br from-[#1e1e35] to-[#0d0d1a] border border-[#2d2d4e] rounded-2xl p-6">
                      <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-amber-400" /> General Suggestions
                      </h3>
                      <ul className="space-y-3">
                        {results.suggestions.map((sug, i) => (
                          <li key={i} className="flex gap-3 text-slate-300 text-sm">
                            <span className="text-amber-400 mt-0.5">•</span> {sug}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* ── 8. MockWise AI Advantage ─────────────────── */}
                  <MockWiseAdvantageCard />

                </div>
              )}
            </div>

            {/* ── Resume History Panel ─────────────────────────────── */}
            <div className="w-full">
              <div className="flex items-center gap-2 mb-4">
                <History className="w-5 h-5 text-purple-400" />
                <h2 className="text-white font-semibold">Previous Analyses</h2>
                {history.length > 0 && (
                  <span className="ml-1 px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 text-xs font-semibold">
                    {history.length}
                  </span>
                )}
              </div>

              {historyLoading ? (
                <div className="flex items-center justify-center py-10 bg-[#1e1e35]/20 border border-[#2d2d4e] rounded-2xl">
                  <Loader2 className="w-6 h-6 text-indigo-400 animate-spin mr-2" />
                  <span className="text-slate-400 text-sm">Loading history...</span>
                </div>
              ) : history.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 bg-[#1e1e35]/20 border border-[#2d2d4e] rounded-2xl text-center">
                  <History className="w-10 h-10 text-slate-600 mb-3" />
                  <p className="text-slate-400 text-sm">No previous analyses found.</p>
                  <p className="text-slate-500 text-xs mt-1">Upload a resume above to get started.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {history.map((entry) => {
                    const isOpen = !!expandedCards[entry._id]
                    const date = new Date(entry.createdAt)
                    const dateStr = date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                    const timeStr = date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
                    const atsInfo = entry.atsScore != null ? atsColour(entry.atsScore) : null

                    return (
                      <div
                        key={entry._id}
                        className="bg-[#1e1e35]/40 border border-[#2d2d4e] rounded-2xl overflow-hidden transition-all duration-200 hover:border-purple-500/30"
                      >
                        {/* Card Header — always visible */}
                        <button
                          onClick={() => toggleCard(entry._id)}
                          className="w-full flex items-center justify-between px-5 py-4 text-left"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center flex-shrink-0">
                              <FileText className="w-4 h-4 text-purple-400" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-white text-sm font-medium truncate">
                                {entry.filename || 'resume.pdf'}
                              </p>
                              <p className="text-slate-500 text-xs mt-0.5 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {dateStr} · {timeStr}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                            {/* ATS Score badge */}
                            {atsInfo && (
                              <span className={`hidden sm:inline-flex text-xs px-2.5 py-1 rounded-full border items-center gap-1 font-semibold ${atsInfo.text}`}
                                style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' }}>
                                <Target className="w-3 h-3" /> {entry.atsScore}
                              </span>
                            )}
                            <span className="hidden sm:inline-flex text-xs px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                              {entry.skills?.length ?? 0} skills
                            </span>
                            {isOpen
                              ? <ChevronUp className="w-4 h-4 text-slate-400" />
                              : <ChevronDown className="w-4 h-4 text-slate-400" />
                            }
                          </div>
                        </button>

                        {/* Expanded Body */}
                        {isOpen && (
                          <div className="px-5 pb-5 space-y-5 border-t border-[#2d2d4e] pt-4">

                            {/* ATS Score in history */}
                            {entry.atsScore != null && (
                              <div>
                                <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                  <Target className="w-3.5 h-3.5" /> ATS Score
                                </p>
                                <div className="flex items-center gap-3">
                                  <div className="flex-1 h-2 bg-[#2d2d4e] rounded-full overflow-hidden">
                                    <div
                                      className="h-full rounded-full"
                                      style={{ width: `${entry.atsScore}%`, background: atsColour(entry.atsScore).bar }}
                                    />
                                  </div>
                                  <span className={`text-sm font-bold ${atsColour(entry.atsScore).text}`}>
                                    {entry.atsScore}/100
                                  </span>
                                </div>
                              </div>
                            )}

                            {/* Skills */}
                            {entry.skills?.length > 0 && (
                              <div>
                                <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                  <CheckCircle className="w-3.5 h-3.5" /> Key Skills Found
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                  {entry.skills.map((skill, i) => (
                                    <span key={i} className="px-2.5 py-1 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded-full text-xs">
                                      {skill}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Missing Skills */}
                            {entry.missingSkills?.length > 0 && (
                              <div>
                                <p className="text-xs font-semibold text-rose-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                  <XCircle className="w-3.5 h-3.5" /> Missing Skills
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                  {entry.missingSkills.map((skill, i) => (
                                    <span key={i} className="px-2.5 py-1 bg-rose-500/10 text-rose-300 border border-rose-500/20 rounded-full text-xs">
                                      {skill}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Section Analysis */}
                            {entry.sectionAnalysis && Object.keys(entry.sectionAnalysis).length > 0 && (
                              <div>
                                <p className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                  <Shield className="w-3.5 h-3.5" /> Section Analysis
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {Object.entries(SECTION_META).map(([key, { label }]) => {
                                    const status = entry.sectionAnalysis[key] || 'missing'
                                    const sm = STATUS_META[status] || STATUS_META.missing
                                    const SIcon = sm.Icon
                                    return (
                                      <span key={key} className={`flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs ${sm.bg} ${sm.cls}`}>
                                        <SIcon className="w-3 h-3" /> {label}
                                      </span>
                                    )
                                  })}
                                </div>
                              </div>
                            )}

                            {/* Strengths */}
                            {entry.strengths?.length > 0 && (
                              <div>
                                <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                  <CheckCircle className="w-3.5 h-3.5" /> Top Strengths
                                </p>
                                <ul className="space-y-1.5">
                                  {entry.strengths.map((str, i) => (
                                    <li key={i} className="flex gap-2 text-slate-300 text-sm">
                                      <span className="text-blue-400 mt-0.5 flex-shrink-0">•</span> {str}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Actionable Suggestions */}
                            {entry.actionableSuggestions?.length > 0 && (
                              <div>
                                <p className="text-xs font-semibold text-sky-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                  <TrendingUp className="w-3.5 h-3.5" /> Actionable Suggestions
                                </p>
                                <ol className="space-y-1.5">
                                  {entry.actionableSuggestions.map((sug, i) => (
                                    <li key={i} className="flex gap-2 text-slate-300 text-sm">
                                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-bold flex items-center justify-center">
                                        {i + 1}
                                      </span>
                                      <span className="pt-0.5">{sug}</span>
                                    </li>
                                  ))}
                                </ol>
                              </div>
                            )}

                            {/* Suggestions */}
                            {entry.suggestions?.length > 0 && (
                              <div>
                                <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                  <AlertCircle className="w-3.5 h-3.5" /> General Suggestions
                                </p>
                                <ul className="space-y-1.5">
                                  {entry.suggestions.map((sug, i) => (
                                    <li key={i} className="flex gap-2 text-slate-300 text-sm">
                                      <span className="text-amber-400 mt-0.5 flex-shrink-0">•</span> {sug}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}
