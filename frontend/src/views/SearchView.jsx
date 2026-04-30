import { useState, useEffect, useRef } from "react"
import { searchProfessors } from "../api.js"
import ProfessorCard from "../components/ProfessorCard.jsx"

function SearchSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="bg-white rounded-2xl border-2 border-gray-100 p-5 animate-fade-in-up" style={{ animationDelay: `${i * 60}ms`, opacity: 0 }}>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl animate-shimmer" />
            <div className="flex-1 space-y-2">
              <div className="h-4 animate-shimmer rounded-lg w-2/3" />
              <div className="h-3 animate-shimmer rounded-lg w-1/2" />
              <div className="h-3 animate-shimmer rounded-lg w-1/3" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function SearchView({ university, onProfessorSelect, onChangeUniversity }) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const debounceRef = useRef(null)

  useEffect(() => {
    if (query.trim().length < 2) { setResults([]); return }
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await searchProfessors(query, university.id)
        setResults(data)
      } catch {
        setError("Search failed. Try again.")
        setResults([])
      } finally { setLoading(false) }
    }, 400)
  }, [query, university.id])

  return (
    <div className="min-h-screen" style={{ background: "#F5F3FF" }}>
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <span className="font-black text-indigo-600 text-xl tracking-tight">betterRMP</span>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 font-medium truncate max-w-[160px]">{university.name}</span>
            <button
              onClick={onChangeUniversity}
              className="text-xs text-indigo-500 hover:text-indigo-700 font-semibold px-2.5 py-1 rounded-lg hover:bg-indigo-50 transition-colors"
            >
              Change
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 py-6 animate-fade-in">
        <div className="relative mb-6">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search professor by name..."
            className="w-full bg-white border-2 border-gray-100 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-indigo-400 transition-all duration-200 shadow-sm"
            autoFocus
          />
          {loading && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>

        {error && <p className="text-sm text-rose-500 mb-4 font-medium">{error}</p>}

        {loading && <SearchSkeleton />}

        {!loading && (
          <div className="flex flex-col gap-3">
            {results.map((prof, i) => (
              <ProfessorCard
                key={prof.rmp_id}
                professor={prof}
                index={i}
                onClick={() => onProfessorSelect(prof)}
              />
            ))}
          </div>
        )}

        {!loading && query.length >= 2 && results.length === 0 && !error && (
          <p className="text-sm text-gray-400 text-center mt-16 animate-fade-in">No professors found.</p>
        )}
      </div>
    </div>
  )
}
