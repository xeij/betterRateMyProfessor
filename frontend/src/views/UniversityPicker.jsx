import { useState, useEffect, useRef } from "react"
import { searchUniversities } from "../api.js"

export default function UniversityPicker({ onSelect }) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef(null)

  useEffect(() => {
    if (query.length < 2) { setResults([]); return }
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const data = await searchUniversities(query)
        setResults(data)
      } catch { setResults([]) }
      finally { setLoading(false) }
    }, 350)
  }, [query])

  return (
    <div className="gradient-bg min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in-up">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black text-white tracking-tight mb-2">betterRMP</h1>
          <p className="text-indigo-200 text-sm font-medium">Smarter professor insights, powered by AI</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Find your university</p>

          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for your university..."
              className="w-full border-2 border-gray-100 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:border-indigo-400 transition-all duration-200 bg-gray-50 focus:bg-white"
              autoFocus
            />
            {loading && (
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>

          {results.length > 0 && (
            <ul className="mt-2 border border-gray-100 rounded-2xl overflow-hidden shadow-sm animate-slide-down">
              {results.map((uni, i) => (
                <li key={uni.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 30}ms`, opacity: 0 }}>
                  <button
                    onClick={() => onSelect({ id: uni.id, name: uni.name })}
                    className="w-full text-left px-4 py-3.5 text-sm hover:bg-indigo-50 active:bg-indigo-100 transition-colors border-b border-gray-50 last:border-0 font-medium text-gray-700"
                  >
                    {uni.name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
