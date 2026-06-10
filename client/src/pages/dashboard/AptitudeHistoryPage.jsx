import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Clock, Award, Brain, History } from 'lucide-react'
import api from '../../services/api'
import toast from 'react-hot-toast'

export default function AptitudeHistoryPage() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await api.get('/aptitude/history')
        if (response.data.success) {
          setHistory(response.data.data)
        }
      } catch (err) {
        console.error('Error fetching history:', err)
        toast.error('Failed to load aptitude history')
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [])

  return (
    <div className="min-h-screen bg-[#0a0a16]">
      <header className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-40 flex items-center px-4 sm:px-6">
        <Link to="/aptitude" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium text-sm">Back to Aptitude</span>
        </Link>
        <div className="ml-6 hidden md:flex items-center gap-2">
          <History className="w-4 h-4 text-indigo-400" />
          <span className="text-white font-semibold text-sm">Aptitude History</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-white mb-2">Test History</h1>
          <p className="text-slate-400">Review your past aptitude test performance.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
          </div>
        ) : history.length === 0 ? (
          <div className="bg-slate-800/30 border border-slate-800 rounded-2xl p-12 text-center">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <History className="w-8 h-8 text-slate-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No history yet</h3>
            <p className="text-slate-400 mb-6">You haven't taken any aptitude tests yet.</p>
            <Link 
              to="/aptitude"
              className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-500 transition-colors"
            >
              Take a Test Now
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {history.map((item) => (
              <div 
                key={item._id} 
                className="bg-slate-800/40 hover:bg-slate-800/60 transition-colors border border-slate-700/50 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                    <Brain className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      {item.category}
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        item.difficulty === 'Easy' ? 'bg-green-500/10 text-green-400' :
                        item.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400' :
                        'bg-red-500/10 text-red-400'
                      }`}>
                        {item.difficulty}
                      </span>
                    </h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        {new Date(item.completedAt).toLocaleDateString()} at {new Date(item.completedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6 border-t md:border-t-0 border-slate-700/50 pt-4 md:pt-0">
                  <div className="text-center">
                    <p className="text-slate-400 text-xs mb-1 uppercase font-bold tracking-wider">Score</p>
                    <p className="text-xl font-bold text-white">{item.score} / {item.totalQuestions}</p>
                  </div>
                  
                  <div className="h-10 w-px bg-slate-700/50 hidden md:block"></div>
                  
                  <div className="text-center">
                    <p className="text-slate-400 text-xs mb-1 uppercase font-bold tracking-wider">Percentage</p>
                    <p className={`text-xl font-black ${
                      item.percentage >= 70 ? 'text-emerald-400' :
                      item.percentage >= 40 ? 'text-amber-400' :
                      'text-rose-400'
                    }`}>
                      {Math.round(item.percentage)}%
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
