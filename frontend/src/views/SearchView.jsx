import { useState, useEffect, useRef } from "react"
import { searchProfessors } from "../api.js"
import ProfessorCard from "../components/ProfessorCard.jsx"

export default function SearchView({ university, onProfessorSelect, onChangeUniversity }) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const debounceRef = useRef(null)

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([])
      return
    }
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await searchProfessors(query, university.id)
        setResults(data)
      } catch {
        setError("Search failed. Is the backend running?")
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 400)
  }, [query, university.id])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">betterRateMyProfessor</h1>
          <div className="flex items-center gap-2">
            <p className="text-sm text-gray-500">{university.name}</p>
            <button onClick={onChangeUniversity} className="text-xs text-blue-500 hover:underline">Change</button>
          </div>
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search professor by name..."
          className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
          autoFocus
        />

        {loading && <p className="text-sm text-gray-400">Searching...</p>}
        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex flex-col gap-3">
          {results.map((prof) => (
            <ProfessorCard
              key={prof.rmp_id}
              professor={prof}
              onClick={() => onProfessorSelect(prof)}
            />
          ))}
        </div>

        {!loading && query.length >= 2 && results.length === 0 && !error && (
          <p className="text-sm text-gray-400 text-center mt-8">No professors found.</p>
        )}
      </div>
    </div>
  )
}
