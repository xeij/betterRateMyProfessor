export default function AxisCard({ name, data }) {
  const { score, positive_pct, negative_pct, neutral_pct, review_count, top_phrases } = data
  const markerLeft = `calc(${((score + 1) / 2) * 100}% - 6px)`

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 capitalize">{name}</h3>
        <span className="text-xs text-gray-400">{review_count} reviews</span>
      </div>

      <div>
        <div className="relative h-3 rounded-full bg-gradient-to-r from-red-400 via-gray-200 to-green-400">
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-gray-500 rounded-full shadow"
            style={{ left: markerLeft }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>Negative</span>
          <span>Positive</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
        <span className="text-green-600 font-medium">{positive_pct}% positive</span>
        <span className="text-gray-400">{neutral_pct}% neutral</span>
        <span className="text-red-500 font-medium">{negative_pct}% negative</span>
      </div>

      {top_phrases.length > 0 && (
        <ul className="space-y-1">
          {top_phrases.slice(0, 3).map((phrase, i) => (
            <li key={i} className="text-xs text-gray-500 italic border-l-2 border-gray-200 pl-2">
              "{phrase}"
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
