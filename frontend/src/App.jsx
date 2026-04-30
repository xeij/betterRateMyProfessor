import { useState, useRef } from "react"
import UniversityPicker from "./views/UniversityPicker.jsx"
import SearchView from "./views/SearchView.jsx"
import AnalysisView from "./views/AnalysisView.jsx"

export default function App() {
  const [university, setUniversity] = useState(null)
  const [selectedProfessor, setSelectedProfessor] = useState(null)
  const viewKey = useRef(0)

  function navigate(fn) {
    viewKey.current += 1
    fn()
  }

  if (!university) {
    return <UniversityPicker key={viewKey.current} onSelect={(uni) => navigate(() => setUniversity(uni))} />
  }

  if (selectedProfessor) {
    return (
      <AnalysisView
        key={viewKey.current}
        professor={selectedProfessor}
        onBack={() => navigate(() => setSelectedProfessor(null))}
      />
    )
  }

  return (
    <SearchView
      key={viewKey.current}
      university={university}
      onProfessorSelect={(prof) => navigate(() => setSelectedProfessor(prof))}
      onChangeUniversity={() => navigate(() => { setUniversity(null); setSelectedProfessor(null) })}
    />
  )
}
