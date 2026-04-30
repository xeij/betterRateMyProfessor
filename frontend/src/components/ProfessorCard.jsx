export default function ProfessorCard({ professor, onClick, index = 0 }) {
  const { name, department, rating, num_ratings, would_take_again, difficulty } = professor

  const ratingColor = rating >= 4 ? "#10B981" : rating >= 3 ? "#F59E0B" : "#F43F5E"
  const difficultyColor = !difficulty ? "#9CA3AF" : difficulty <= 2 ? "#10B981" : difficulty <= 3.5 ? "#F59E0B" : "#F43F5E"

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white rounded-2xl border-2 border-gray-100 p-5 hover:border-indigo-300 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 animate-fade-in-up"
      style={{ animationDelay: `${index * 60}ms`, opacity: 0 }}
    >
      <div className="flex items-center gap-4">
        <div
          className="shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center border-2"
          style={{ borderColor: ratingColor, background: `${ratingColor}15` }}
        >
          <span className="text-2xl font-black" style={{ color: ratingColor }}>
            {rating > 0 ? rating.toFixed(1) : "N/A"}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 text-base leading-tight">{name}</p>
          <p className="text-sm text-gray-500 mt-0.5 truncate">{department || "Department unknown"}</p>

          <div className="flex items-center gap-3 mt-2.5 flex-wrap">
            <span className="text-xs text-gray-400 font-medium">{num_ratings} ratings</span>

            {would_take_again != null && (
              <div className="flex items-center gap-1">
                <span className="text-xs">👍</span>
                <span className="text-xs font-semibold text-gray-600">
                  {Math.round(would_take_again)}%
                </span>
              </div>
            )}

            {difficulty != null && (
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-gray-400">Difficulty</span>
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-lg text-white"
                  style={{ background: difficultyColor }}
                >
                  {difficulty.toFixed(1)}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="shrink-0 text-gray-300">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 12l4-4-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </button>
  )
}
