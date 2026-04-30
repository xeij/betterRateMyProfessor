import { useState, useEffect } from "react"
import { getProfessorAnalysis } from "../api.js"

const PROFESSOR_EMOJIS = [
  "( ͡° ͜ʖ ͡°)",
  "(⌐■_■)",
  "⊙▂⊙",
  "(´⊙ω⊙`)",
  "( ๑‾̀◡‾́)σ",
]

function getProfessorEmoji(rmpId) {
  const hash = (rmpId || "").split("").reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return PROFESSOR_EMOJIS[hash % PROFESSOR_EMOJIS.length]
}

const EMOJIS = {
  1: "( ◺˰◿ )",
  2: "(╥﹏╥)",
  3: "¯\\_(ツ)_/¯",
  4: "ദ്ദി◝ ⩊ ◜.ᐟ",
  5: "(˶ˆᗜˆ˵)",
}

const RATING_STYLES = {
  1: { bg: "rgba(255,255,255,0.7)", border: "#FECDD3", emoji: "#F43F5E" },
  2: { bg: "rgba(255,255,255,0.7)", border: "#FED7AA", emoji: "#F97316" },
  3: { bg: "rgba(255,255,255,0.7)", border: "#E5E7EB", emoji: "#9CA3AF" },
  4: { bg: "rgba(255,255,255,0.7)", border: "#BBF7D0", emoji: "#22C55E" },
  5: { bg: "rgba(255,255,255,0.7)", border: "#6EE7B7", emoji: "#10B981" },
}

function useCountUp(target, duration = 900) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (target == null || target === 0) { setValue(target ?? 0); return }
    const start = Date.now()
    const timer = setInterval(() => {
      const progress = Math.min((Date.now() - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(parseFloat((target * eased).toFixed(1)))
      if (progress >= 1) clearInterval(timer)
    }, 16)
    return () => clearInterval(timer)
  }, [target, duration])
  return value
}

function DonutChart({ positive, negative, neutral }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { const t = setTimeout(() => setMounted(true), 200); return () => clearTimeout(t) }, [])

  const total = positive + negative + neutral
  if (total === 0) return null

  const cx = 60, cy = 60, r = 40, sw = 16
  const circ = 2 * Math.PI * r
  const gap = total > 1 ? 3 : 0

  const segments = [
    { value: positive, color: "#10B981", label: "Positive" },
    { value: neutral,  color: "#CBD5E1", label: "Neutral"  },
    { value: negative, color: "#F43F5E", label: "Negative" },
  ]

  let rotation = -90
  const rendered = segments.map((seg) => {
    const ratio = seg.value / total
    const arcLen = Math.max(ratio * circ - gap, 0)
    const el = { ...seg, ratio, rotation, arcLen }
    rotation += ratio * 360
    return el
  })

  const posPct = Math.round((positive / total) * 100)
  const score = positive - negative
  const centerColor = score > 0 ? "#10B981" : score < 0 ? "#F43F5E" : "#94A3B8"

  return (
    <div className="flex items-center gap-6">
      <div className="relative shrink-0">
        <svg
          viewBox="0 0 120 120" width="130" height="130"
          style={{ opacity: mounted ? 1 : 0, transition: "opacity 0.6s ease" }}
        >
          {rendered.map((seg, i) =>
            seg.value > 0 ? (
              <circle
                key={i}
                cx={cx} cy={cy} r={r}
                fill="none"
                stroke={seg.color}
                strokeWidth={sw}
                strokeLinecap="butt"
                strokeDasharray={`${seg.arcLen} ${circ}`}
                transform={`rotate(${seg.rotation}, ${cx}, ${cy})`}
              />
            ) : null
          )}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-black" style={{ color: centerColor }}>{posPct}%</span>
        </div>
      </div>

      <div className="space-y-2.5 flex-1">
        {rendered.map((seg) => (
          <div key={seg.label} className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: seg.color }} />
            <span className="text-sm text-white/80 font-medium flex-1">{seg.label}</span>
            <span className="text-sm font-black text-white">{seg.value}</span>
            <span className="text-xs text-white/50 w-10 text-right">
              {Math.round(seg.ratio * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function StatPill({ label, value, color }) {
  return (
    <div className="flex flex-col items-center bg-white/15 backdrop-blur-sm rounded-2xl px-4 py-3 border border-white/20 min-w-[80px]">
      <span className="text-xl font-black text-white">{value}</span>
      <span className="text-[10px] text-white/60 font-semibold mt-0.5 text-center leading-tight uppercase tracking-wide">{label}</span>
    </div>
  )
}

function ReviewCard({ review, index }) {
  const { comment, quality_rating } = review
  const rating = Math.min(Math.max(Math.round(quality_rating), 1), 5)
  const emoji = EMOJIS[rating]
  const styles = RATING_STYLES[rating]

  return (
    <div
      className="flex gap-4 rounded-2xl border-2 p-4 animate-fade-in-up backdrop-blur-sm"
      style={{
        background: styles.bg,
        borderColor: styles.border,
        animationDelay: `${Math.min(index * 25, 600)}ms`,
        opacity: 0,
      }}
    >
      <div
        className="shrink-0 flex items-center justify-center rounded-xl px-3 py-2 text-xs font-mono font-bold whitespace-nowrap self-start mt-0.5"
        style={{ background: "white", color: styles.emoji, border: `2px solid ${styles.border}` }}
      >
        {emoji}
      </div>
      <p className="text-sm text-gray-700 leading-relaxed">{comment}</p>
    </div>
  )
}

function ReviewsSkeleton() {
  return (
    <>
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="flex gap-4 bg-white/70 rounded-2xl border-2 border-white/40 p-4 animate-fade-in-up"
          style={{ animationDelay: `${i * 60}ms`, opacity: 0 }}
        >
          <div className="w-20 h-10 animate-shimmer rounded-xl shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3 animate-shimmer rounded-lg w-full" />
            <div className="h-3 animate-shimmer rounded-lg w-4/5" />
          </div>
        </div>
      ))}
    </>
  )
}

export default function AnalysisView({ professor, onBack }) {
  const [reviews, setReviews] = useState(null)
  const [overrides, setOverrides] = useState({})
  const [reviewsLoading, setReviewsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setReviewsLoading(true)
    setError(null)
    getProfessorAnalysis(professor.rmp_id)
      .then((data) => {
        setReviews(data.reviews)
        setOverrides({
          would_take_again: data.would_take_again,
          difficulty: data.difficulty,
          overall_rating: data.overall_rating,
        })
      })
      .catch(() => setError("Failed to load reviews. Try again."))
      .finally(() => setReviewsLoading(false))
  }, [professor.rmp_id])

  const overall_rating   = overrides.overall_rating   ?? professor.rating
  const would_take_again = overrides.would_take_again ?? professor.would_take_again
  const difficulty       = overrides.difficulty       ?? professor.difficulty

  const positive = reviews?.filter(r => r.quality_rating >= 4).length ?? 0
  const negative = reviews?.filter(r => r.quality_rating <= 2).length ?? 0
  const neutral  = reviews?.filter(r => r.quality_rating === 3).length ?? 0
  const score = positive - negative
  const scoreSign = score > 0 ? "+" : ""
  const scoreColor = reviews ? (score > 0 ? "#10B981" : score < 0 ? "#F43F5E" : "#94A3B8") : "#94A3B8"

  const animatedRating = useCountUp(overall_rating)
  const animatedWTA    = useCountUp(would_take_again ?? 0)
  const animatedDiff   = useCountUp(difficulty ?? 0)

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-10 glass-bar">
        <div className="max-w-2xl mx-auto px-4 py-3.5 flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm text-white/80 hover:text-white font-semibold px-3 py-1.5 rounded-xl transition-colors"
            style={{ background: "rgba(255,255,255,0.1)" }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back
          </button>
          <span className="font-black text-white text-xl tracking-tight">betterRMP</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="animate-fade-in space-y-4">
          <div
            className="rounded-3xl border p-6"
            style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(16px)", borderColor: "rgba(255,255,255,0.2)" }}
          >
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <h2 className="text-2xl font-black text-white leading-tight">
                  {professor.name} <span className="text-lg font-normal">{getProfessorEmoji(professor.rmp_id)}</span>
                </h2>
                <p className="text-sm text-white/60 font-medium mt-1">{professor.department}</p>
              </div>
              <div
                className="shrink-0 flex flex-col items-center px-4 py-2.5 rounded-2xl border"
                style={{ background: "white", borderColor: scoreColor, boxShadow: `0 0 12px ${scoreColor}40` }}
              >
                <span className="text-2xl font-black leading-none" style={{ color: scoreColor }}>
                  {reviews ? `${scoreSign}${score}` : "—"}
                </span>

              </div>
            </div>

            <div className="flex gap-3 flex-wrap mb-6">
              <StatPill label="Overall" value={animatedRating.toFixed(1)} />
              <StatPill label="Reviews" value={professor.num_ratings} />
              {would_take_again != null && (
                <StatPill label="Would retake" value={`${Math.round(animatedWTA)}%`} />
              )}
              {difficulty != null && (
                <StatPill label="Difficulty" value={animatedDiff.toFixed(1)} />
              )}
            </div>

            <div
              className="rounded-2xl p-4 border"
              style={{ background: "rgba(0,0,0,0.15)", borderColor: "rgba(255,255,255,0.1)" }}
            >
              {reviews
                ? <DonutChart positive={positive} negative={negative} neutral={neutral} />
                : <div className="h-32 animate-shimmer rounded-xl" />
              }
            </div>
          </div>

          {error && (
            <div className="bg-white/10 rounded-2xl border border-white/20 p-4 text-center">
              <p className="text-white/70 text-sm">{error}</p>
            </div>
          )}

          {!error && (
            <>
              <div className="px-1">
                <p className="text-xs font-semibold text-white/50 uppercase tracking-widest">
                  {reviews ? `${reviews.length} reviews` : "Loading reviews…"}
                </p>
              </div>
              <div className="space-y-3">
                {reviewsLoading
                  ? <ReviewsSkeleton />
                  : reviews?.map((review, i) => (
                      <ReviewCard key={review.comment.slice(0, 20) + i} review={review} index={i} />
                    ))
                }
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
