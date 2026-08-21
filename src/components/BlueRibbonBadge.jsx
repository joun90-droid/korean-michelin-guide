import './BlueRibbonBadge.css'

function RibbonIcon() {
  return (
    <svg viewBox="0 0 24 24" className="ribbon-icon" aria-hidden="true">
      <circle cx="12" cy="9" r="5.5" fill="currentColor" />
      <path fill="currentColor" d="M8.2 13.6 5 22l7-4 7 4-3.2-8.4-1.7.9a8 8 0 0 1-6.2 0l-1.7-.9Z" />
      <circle cx="12" cy="9" r="2.4" fill="var(--bg-elevated)" />
    </svg>
  )
}

export default function BlueRibbonBadge({ ribbons, size = 'md' }) {
  if (!ribbons) return null

  return (
    <span className={`ribbon-badge ${size}`} aria-label={`블루리본 ${ribbons}개`}>
      {Array.from({ length: ribbons }).map((_, i) => (
        <RibbonIcon key={i} />
      ))}
    </span>
  )
}
