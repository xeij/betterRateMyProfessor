import { useState, useEffect } from "react"

export default function AxisCard({ name, data, index = 0 }) {
  const { positive_pct, negative_pct, neutral_pct, review_count, top_phrases } = data
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 150 + index * 100)
    return () => clearTimeout(timer)
  }, [index])

  const sentimentScore = (positive_pct - negative_pct) / 100
  const finalLeft = ((sentimentScore + 1) / 2) * 100
  const markerLeft = animated ? finalLeft : 50

  const positivePhrases = top_phrases.slice(0, 3)
  const negativePhrases = top_phrases.slice(3, 6)

  const axisIcons = { workload: "📚", clarity: "💡", fairness: "⚖️" }
  const axisDescriptions = {
    workload: "How heavy is the course load?",
    clarity: "How well does the professor explain?",
    fairness: "How fair is the grading?",
  }

  return (
    <div
      className="bg-white rounded-3xl border-2 border-gray-100 p-6 animate-fade-in-up"
      style={{ animationDelay: `${index * 100}ms`, opacity: 0 }}
    >
      <div className="flex items-start justify-between mb-5">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-lg">{axisIcons[name]}</span>
            <h3 className="font-black text-gray-900 text-lg capitalize">{name}</h3>
          </div>
          <p className="text-xs text-gray-400">{axisDescriptions[name]}</p>
        </div>
        <span className="text-xs font-semibold text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full">
          {review_count} reviews
        </span>
      </div>

      <div className="mb-4">
        <div className="relative h-4 rounded-full bg-gradient-to-r from-rose-400 via-gray-200 to-emerald-400 mb-2">
          <div
            className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white border-[3px] border-indigo-500 rounded-full shadow-md"
            style={{
              left: `calc(${markerLeft}% - 10px)`,
              transition: "left 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
          />
        </div>
        <div className="flex justify-between text-xs font-medium">
          <span className="text-rose-400">Negative</span>
          <span className="text-emerald-500">Positive</span>
        </div>
      </div>

      <div className="rounded-2xl overflow-hidden h-7 flex mb-4">
        <div
          className="flex items-center justify-center transition-all duration-700"
          style={{
            width: `${positive_pct}%`,
            background: "#10B981",
            transition: "width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          {positive_pct >= 15 && (
            <span className="text-xs font-bold text-white">{Math.round(positive_pct)}%</span>
          )}
        </div>
        <div
          className="flex items-center justify-center"
          style={{ width: `${neutral_pct}%`, background: "#E5E7EB" }}
        >
          {neutral_pct >= 15 && (
            <span className="text-xs font-bold text-gray-500">{Math.round(neutral_pct)}%</span>
          )}
        </div>
        <div
          className="flex items-center justify-center"
          style={{ width: `${negative_pct}%`, background: "#F43F5E" }}
        >
          {negative_pct >= 15 && (
            <span className="text-xs font-bold text-white">{Math.round(negative_pct)}%</span>
          )}
        </div>
      </div>

      <div className="flex gap-3 text-xs mb-5">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-gray-600 font-medium">{Math.round(positive_pct)}% positive</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-gray-300" />
          <span className="text-gray-500">{Math.round(neutral_pct)}% neutral</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-rose-400" />
          <span className="text-gray-600 font-medium">{Math.round(negative_pct)}% negative</span>
        </div>
      </div>

      {(positivePhrases.length > 0 || negativePhrases.length > 0) && (
        <div className="space-y-2">
          {positivePhrases.slice(0, 2).map((phrase, i) => (
            <div key={`pos-${i}`} className="flex gap-2.5 items-start">
              <div className="w-0.5 rounded-full bg-emerald-400 shrink-0 mt-1" style={{ height: "calc(100% - 4px)", minHeight: "20px" }} />
              <p className="text-xs text-gray-500 leading-relaxed">"{phrase}"</p>
            </div>
          ))}
          {negativePhrases.slice(0, 1).map((phrase, i) => (
            <div key={`neg-${i}`} className="flex gap-2.5 items-start">
              <div className="w-0.5 rounded-full bg-rose-400 shrink-0 mt-1" style={{ height: "calc(100% - 4px)", minHeight: "20px" }} />
              <p className="text-xs text-gray-500 leading-relaxed">"{phrase}"</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
