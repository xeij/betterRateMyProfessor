import { useState, useEffect } from "react"
import { getProfessorAnalysis } from "../api.js"
import AxisCard from "../components/AxisCard.jsx"

function useCountUp(target, duration = 900) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (target == null || target === 0) { setValue(target ?? 0); return }
    const start = Date.now()
    const timer = setInterval(() => {
      const progress = Math.min((Date.now() - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(parseFloat((target * eased).toFixed(1)))
      if (progress >= 1) clearInterval(timer)
    }, 16)
    return () => clearInterval(timer)
  }, [target, duration])
  return value
}

function StatPill({ label, value, color }) {
  return (
    <div className="flex flex-col items-center bg-white rounded-2xl px-5 py-3 border-2 border-gray-100 min-w-[90px]">
      <span className="text-2xl font-black" style={{ color }}>{value}</span>
      <span className="text-xs text-gray-400 font-medium mt-0.5 text-center leading-tight">{label}</span>
    </div>
  )
}

function Skeleton() {
  return (
    <div className="animate-fade-in">
      <div className="bg-white rounded-3xl border-2 border-gray-100 p-6 mb-4">
        <div className="h-8 animate-shimmer rounded-xl w-1/2 mb-2" />
        <div className="h-4 animate-shimmer rounded-lg w-1/3 mb-6" />
        <div className="flex gap-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-16 w-24 animate-shimmer rounded-2xl" />
          ))}
        </div>
      </div>
      {[0, 1, 2].map((i) => (
        <div key={i} className="bg-white rounded-3xl border-2 border-gray-100 p-6 mb-4 animate-fade-in-up" style={{ animationDelay: `${i * 80}ms`, opacity: 0 }}>
          <div className="h-5 animate-shimmer rounded-lg w-1/4 mb-4" />
          <div className="h-4 animate-shimmer rounded-full mb-3" />
          <div className="h-7 animate-shimmer rounded-2xl mb-3" />
          <div className="space-y-2">
            <div className="h-3 animate-shimmer rounded-lg w-full" />
            <div className="h-3 animate-shimmer rounded-lg w-4/5" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function AnalysisView({ professor, onBack }) {
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    getProfessorAnalysis(professor.rmp_id)
      .then(setAnalysis)
      .catch(() => setError("Failed to load analysis. Try again."))
      .finally(() => setLoading(false))
  }, [professor.rmp_id])

  const ratingColor = !analysis ? "#6366F1"
    : analysis.overall_rating >= 4 ? "#10B981"
    : analysis.overall_rating >= 3 ? "#F59E0B"
    : "#F43F5E"

  const animatedRating = useCountUp(analysis?.overall_rating ?? 0)
  const animatedWTA = useCountUp(analysis?.would_take_again ?? 0)
  const animatedDiff = useCountUp(analysis?.difficulty ?? 0)

  return (
    <div className="min-h-screen" style={{ background: "#F5F3FF" }}>
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3.5 flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm text-indigo-500 hover:text-indigo-700 font-semibold px-3 py-1.5 rounded-xl hover:bg-indigo-50 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back
          </button>
          <span className="font-black text-indigo-600 text-xl tracking-tight">betterRMP</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {loading && <Skeleton />}

        {error && (
          <div className="bg-white rounded-3xl border-2 border-rose-100 p-8 text-center animate-fade-in">
            <p className="text-rose-500 font-semibold mb-2">Something went wrong</p>
            <p className="text-sm text-gray-400">{error}</p>
          </div>
        )}

        {analysis && (
          <div className="animate-fade-in">
            <div className="bg-white rounded-3xl border-2 border-gray-100 p-6 mb-4">
              <h2 className="text-2xl font-black text-gray-900 leading-tight">{analysis.name}</h2>
              <p className="text-sm text-gray-400 font-medium mt-1 mb-5">{analysis.department}</p>

              <div className="flex gap-3 flex-wrap">
                <StatPill
                  label="Overall"
                  value={animatedRating.toFixed(1)}
                  color={ratingColor}
                />
                <StatPill
                  label="Reviews"
                  value={analysis.review_count}
                  color="#6366F1"
                />
                {analysis.would_take_again != null && (
                  <StatPill
                    label="Would retake"
                    value={`${Math.round(animatedWTA)}%`}
                    color="#10B981"
                  />
                )}
                {analysis.difficulty != null && (
                  <StatPill
                    label="Difficulty"
                    value={animatedDiff.toFixed(1)}
                    color={analysis.difficulty <= 2 ? "#10B981" : analysis.difficulty <= 3.5 ? "#F59E0B" : "#F43F5E"}
                  />
                )}
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {["workload", "clarity", "fairness"].map((axis, i) => (
                <AxisCard key={axis} name={axis} data={analysis.axes[axis]} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
