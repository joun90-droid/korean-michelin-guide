import './quick-filter.css'

const PURPOSE = [
  { id: 'parents', label: '#상견례/부모님' },
  { id: 'date', label: '#기념일데이트' },
  { id: 'business', label: '#비즈니스미팅' },
  { id: 'value', label: '#가성비(빕구르망)' },
]

const CONDITIONS = [
  { id: 'private-room', label: '#개인룸완비' },
  { id: 'parking', label: '#주차가능' },
  { id: 'under-100k', label: '#1인10만원이하' },
  { id: 'wine', label: '#와인페어링' },
]

function Chip({ active, onClick, children }) {
  return (
    <button type="button" className={`quick-chip ${active ? 'on' : ''}`} onClick={onClick}>
      {children}
    </button>
  )
}

export function matchesQuickFilters(restaurant, selected) {
  if (!selected.length) return true
  const occasions = restaurant.occasions || []
  const amenities = restaurant.amenities || []
  const hay = [...occasions, ...amenities]
  return selected.every((id) => hay.includes(id))
}

export default function QuickFilter({ selected, onChange }) {
  const toggle = (id) => {
    onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id])
  }

  return (
    <section className="quick-filter" aria-label="상황별 큐레이션">
      <div className="quick-row">
        <span className="quick-label">목적</span>
        {PURPOSE.map((p) => (
          <Chip key={p.id} active={selected.includes(p.id)} onClick={() => toggle(p.id)}>
            {p.label}
          </Chip>
        ))}
      </div>
      <div className="quick-row">
        <span className="quick-label">조건</span>
        {CONDITIONS.map((p) => (
          <Chip key={p.id} active={selected.includes(p.id)} onClick={() => toggle(p.id)}>
            {p.label}
          </Chip>
        ))}
      </div>
    </section>
  )
}
