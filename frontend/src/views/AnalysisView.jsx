import { useState, useEffect } from "react"
import { getProfessorAnalysis } from "../api.js"
import AxisCard from "../components/AxisCard.jsx"

function Skeleton() {
  return (
    <div className="animate-pulse flex flex-col gap-4">
      <div className="h-7 bg-gray-200 rounded w-1/2" />
      <div className="h-4 bg-gray-100 rounded w-1/3" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="bg-gray-100 rounded-xl h-52" />
        ))}
      </div>
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button
          onClick={onBack}
          className="text-sm text-blue-500 hover:underline mb-6 inline-block"
        >
          ← Back to search
        </button>

        {loading && <Skeleton />}
        {error && <p className="text-red-500 text-sm">{error}</p>}

        {analysis && (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">{analysis.name}</h2>
              <p className="text-gray-500 text-sm">{analysis.department}</p>
              <p className="text-sm text-gray-600 mt-1">
                RMP rating:{" "}
                <span className="font-semibold">{analysis.overall_rating.toFixed(1)}</span>
                {" · "}
                {analysis.review_count} reviews analyzed
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {["workload", "clarity", "fairness"].map((axis) => (
                <AxisCard key={axis} name={axis} data={analysis.axes[axis]} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
