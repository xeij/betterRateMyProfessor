export default function ProfessorCard({ professor, onClick }) {
  const { name, department, rating } = professor
  const ratingColor =
    rating >= 4 ? "text-green-600" : rating >= 3 ? "text-yellow-500" : "text-red-500"

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md hover:border-blue-200 transition-all"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-gray-900">{name}</p>
          <p className="text-sm text-gray-500">{department || "Department unknown"}</p>
        </div>
        <div className="text-right shrink-0">
          <span className={`text-xl font-bold ${ratingColor}`}>{rating.toFixed(1)}</span>
          <p className="text-xs text-gray-400">/ 5.0</p>
        </div>
      </div>
    </button>
  )
}
