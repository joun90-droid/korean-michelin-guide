import './StarBadge.css'

function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" className="star-icon" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2.5c.6 2.7 1.6 4.7 3 6.1 1.4 1.4 3.4 2.4 6 3-2.6.6-4.6 1.6-6 3-1.4 1.4-2.4 3.4-3 6.1-.6-2.7-1.6-4.7-3-6.1-1.4-1.4-3.4-2.4-6-3 2.6-.6 4.6-1.6 6-3 1.4-1.4 2.4-3.4 3-6.1Z"
      />
    </svg>
  )
}

export default function StarBadge({ stars, size = 'md' }) {
  if (stars === 'bib') {
    return (
      <span className={`star-badge bib ${size}`}>
        <span className="bib-mark" aria-hidden="true">
          B
        </span>
        Bib Gourmand
      </span>
    )
  }

  return (
    <span className={`star-badge ${size}`} aria-label={`미슐랭 ${stars}스타`}>
      {Array.from({ length: stars }).map((_, i) => (
        <StarIcon key={i} />
      ))}
    </span>
  )
}
