import { useState, useEffect, useRef } from "react"
import { searchUniversities } from "../api.js"

export default function UniversityPicker({ onSelect }) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef(null)

  useEffect(() => {
    if (query.length < 2) {
      setResults([])
      return
    }
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const data = await searchUniversities(query)
        setResults(data)
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 350)
  }, [query])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">betterRateMyProfessor</h1>
        <p className="text-sm text-gray-500 mb-6">Select your university to get started.</p>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for your university..."
          className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          autoFocus
        />

        {loading && <p className="text-xs text-gray-400 mt-2">Searching...</p>}

        {results.length > 0 && (
          <ul className="mt-2 border border-gray-200 rounded-lg overflow-hidden">
            {results.map((uni) => (
              <li key={uni.id}>
                <button
                  onClick={() => onSelect({ id: uni.id, name: uni.name })}
                  className="w-full text-left px-4 py-3 text-sm hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-0"
                >
                  {uni.name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
