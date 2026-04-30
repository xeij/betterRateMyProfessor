export default function AnalysisView({ professor, onBack }) {
  return (
    <div>
      AnalysisView — {professor?.rmp_id}
      <button onClick={onBack}>Back</button>
    </div>
  )
}
