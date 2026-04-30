import { useState } from "react"
import UniversityPicker from "./views/UniversityPicker.jsx"
import SearchView from "./views/SearchView.jsx"
import AnalysisView from "./views/AnalysisView.jsx"

export default function App() {
  const [university, setUniversity] = useState(() => {
    const stored = localStorage.getItem("university")
    return stored ? JSON.parse(stored) : null
  })
  const [selectedProfessor, setSelectedProfessor] = useState(null)

  function handleUniversitySelect(uni) {
    localStorage.setItem("university", JSON.stringify(uni))
    setUniversity(uni)
  }

  if (!university) {
    return <UniversityPicker onSelect={handleUniversitySelect} />
  }

  if (selectedProfessor) {
    return <AnalysisView professor={selectedProfessor} onBack={() => setSelectedProfessor(null)} />
  }

  return <SearchView university={university} onProfessorSelect={setSelectedProfessor} />
}
