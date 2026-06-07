import { Link } from 'react-router-dom'

function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-5xl font-extrabold text-indigo-400 mb-4">
        AI Interview Prep
      </h1>
      <p className="text-slate-400 text-lg mb-8 max-w-md">
        Ace your next technical interview with AI-powered mock interviews, feedback, and personalised coaching.
      </p>
      <div className="flex gap-4">
        <Link to="/register" className="btn-primary">Get Started</Link>
        <Link to="/login"    className="btn-secondary">Sign In</Link>
      </div>
    </div>
  )
}

export default LandingPage
