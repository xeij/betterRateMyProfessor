import { useState, useRef } from "react"
import UniversityPicker from "./views/UniversityPicker.jsx"
import SearchView from "./views/SearchView.jsx"
import AnalysisView from "./views/AnalysisView.jsx"

const GRADIENT_POSITIONS = ["0% 0%", "60% 40%", "100% 100%"]

export default function App() {
  const [university, setUniversity] = useState(null)
  const [selectedProfessor, setSelectedProfessor] = useState(null)
  const viewKey = useRef(0)

  function navigate(fn) {
    viewKey.current += 1
    fn()
  }

  const viewIndex = !university ? 0 : !selectedProfessor ? 1 : 2

  return (
    <div
      className="gradient-wrapper min-h-screen"
      style={{ backgroundPosition: GRADIENT_POSITIONS[viewIndex] }}
    >
      {!university && (
        <UniversityPicker
          key={viewKey.current}
          onSelect={(uni) => navigate(() => setUniversity(uni))}
        />
      )}
      {university && !selectedProfessor && (
        <SearchView
          key={viewKey.current}
          university={university}
          onProfessorSelect={(prof) => navigate(() => setSelectedProfessor(prof))}
          onChangeUniversity={() => navigate(() => { setUniversity(null); setSelectedProfessor(null) })}
        />
      )}
      {university && selectedProfessor && (
        <AnalysisView
          key={viewKey.current}
          professor={selectedProfessor}
          onBack={() => navigate(() => setSelectedProfessor(null))}
        />
      )}
    </div>
  )
}
