import { Link } from 'react-router-dom'
import StarBadge from '../StarBadge'
import BlueRibbonBadge from '../BlueRibbonBadge'
import CuisineIcon from '../CuisineIcon'
import OutboundButtons from './outbound-buttons'
import { useLibrary } from '../../hooks/useLibrary'
import './action-card.css'

export default function ActionCard({ restaurant, compact = false }) {
  const {
    id,
    name,
    nameEn,
    stars,
    ribbons,
    cuisine,
    region,
    area,
    priceRange,
    summary,
    description,
    greenStar,
    distanceKm,
    score,
  } = restaurant
  const { isSaved, toggleSave } = useLibrary()
  const saved = isSaved(id)

  const blurb = summary || description || ''

  return (
    <article className={`action-card ${compact ? 'compact' : ''}`}>
      <button
        type="button"
        className={`save-btn ${saved ? 'on' : ''}`}
        aria-label={saved ? '찜 해제' : '찜하기'}
        onClick={() => toggleSave(id)}
      >
        ♥
      </button>
      <Link to={`/restaurant/${id}`} className="action-card-main">
        <div className={`action-media tier-${stars ?? 'ribbon'}`}>
          <CuisineIcon cuisine={cuisine} className="card-cuisine-icon" />
          <div className="action-badges">
            {stars && (
              <span className="media-pill">
                <StarBadge stars={stars} />
              </span>
            )}
            {greenStar ? <span className="green-pill">그린스타</span> : null}
            {ribbons ? (
              <span className="media-pill ribbon">
                <BlueRibbonBadge ribbons={ribbons} />
              </span>
            ) : null}
          </div>
        </div>
        <div className="action-body">
          <h3>{name}</h3>
          <p className="action-en">{nameEn}</p>
          <p className="action-meta">
            {region} {area} · {cuisine}
          </p>
          <p className="action-summary">{blurb}</p>
          <p className="action-price">
            {priceRange || '가격 문의'}
            {distanceKm != null ? ` · ${distanceKm < 1 ? `${Math.round(distanceKm * 1000)}m` : `${distanceKm.toFixed(1)}km`}` : ''}
            {score ? ` · ${score}pt` : ''}
          </p>
        </div>
      </Link>
      <OutboundButtons restaurant={restaurant} />
    </article>
  )
}
