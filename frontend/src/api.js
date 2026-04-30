const BASE = import.meta.env.VITE_API_URL
console.log("API BASE:", BASE)

export async function searchUniversities(q) {
  const res = await fetch(`${BASE}/universities?q=${encodeURIComponent(q)}`)
  if (!res.ok) throw new Error("Failed to search universities")
  return res.json()
}

export async function searchProfessors(name, universityId) {
  const res = await fetch(
    `${BASE}/search?name=${encodeURIComponent(name)}&university=${encodeURIComponent(universityId)}`
  )
  if (!res.ok) throw new Error("Failed to search professors")
  return res.json()
}

export async function getProfessorAnalysis(rmpId) {
  const res = await fetch(`${BASE}/professor/${encodeURIComponent(rmpId)}`)
  if (!res.ok) throw new Error("Failed to fetch analysis")
  return res.json()
}
