import { useState } from "react"
import UniversityPicker from "./views/UniversityPicker.jsx"
import SearchView from "./views/SearchView.jsx"
import AnalysisView from "./views/AnalysisView.jsx"

export default function App() {
  const [university, setUniversity] = useState(null)
  const [selectedProfessor, setSelectedProfessor] = useState(null)

  function handleUniversitySelect(uni) {
    setUniversity(uni)
  }

  function handleChangeUniversity() {
    setUniversity(null)
  }

  if (!university) {
    return <UniversityPicker onSelect={handleUniversitySelect} />
  }

  if (selectedProfessor) {
    return <AnalysisView professor={selectedProfessor} onBack={() => setSelectedProfessor(null)} />
  }

  return <SearchView university={university} onProfessorSelect={setSelectedProfessor} onChangeUniversity={handleChangeUniversity} />
}
