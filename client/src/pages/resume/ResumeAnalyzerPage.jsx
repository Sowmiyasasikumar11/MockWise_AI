import { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import {
  FileText, UploadCloud, CheckCircle, Clock,
  AlertCircle, Loader2, History, ChevronDown,
  ChevronUp, Menu, X
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { uploadResume, analyzeResume, getResumeHistory } from '../../services/resumeService'
import Sidebar from '../../components/dashboard/Sidebar'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'

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
            <p className="text-slate-400">Upload your resume to get instant AI-powered feedback on your skills and strengths.</p>
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
                  <p className="text-slate-400 text-sm">Upload a PDF resume to see your extracted skills and strengths.</p>
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

                  <div className="bg-gradient-to-br from-[#1e1e35] to-[#0d0d1a] border border-[#2d2d4e] rounded-2xl p-6">
                    <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-blue-400" /> Top Strengths
                    </h3>
                    <ul className="space-y-3">
                      {results.strengths.map((str, i) => (
                        <li key={i} className="flex gap-3 text-slate-300 text-sm">
                          <span className="text-blue-400 mt-0.5">•</span> {str}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-gradient-to-br from-[#1e1e35] to-[#0d0d1a] border border-[#2d2d4e] rounded-2xl p-6">
                    <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-amber-400" /> Areas for Improvement
                    </h3>
                    <ul className="space-y-3">
                      {results.suggestions.map((sug, i) => (
                        <li key={i} className="flex gap-3 text-slate-300 text-sm">
                          <span className="text-amber-400 mt-0.5">•</span> {sug}
                        </li>
                      ))}
                    </ul>
                  </div>
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
                          <div className="flex items-center gap-3 flex-shrink-0 ml-3">
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

                            {/* Suggestions */}
                            {entry.suggestions?.length > 0 && (
                              <div>
                                <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                  <AlertCircle className="w-3.5 h-3.5" /> Areas for Improvement
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
