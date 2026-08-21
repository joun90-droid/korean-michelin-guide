import { Link } from 'react-router-dom'
import StarBadge from './StarBadge'
import BlueRibbonBadge from './BlueRibbonBadge'
import CuisineIcon from './CuisineIcon'
import './RestaurantCard.css'

export default function RestaurantCard({ restaurant }) {
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
    description,
  } = restaurant

  return (
    <Link to={`/restaurant/${id}`} className="restaurant-card">
      <div className={`card-media tier-${stars ?? 'ribbon'}`}>
        <CuisineIcon cuisine={cuisine} className="card-cuisine-icon" />

        <div className="card-media-badges">
          {stars && (
            <span className="media-pill">
              <StarBadge stars={stars} />
            </span>
          )}
          {ribbons && (
            <span className="media-pill ribbon">
              <BlueRibbonBadge ribbons={ribbons} />
            </span>
          )}
        </div>
      </div>

      <div className="card-body">
        <div className="card-heading">
          <h3>{name}</h3>
          <span className="card-name-en">{nameEn}</span>
        </div>

        <div className="card-meta">
          <span>
            {region} {area}
          </span>
          <span className="dot" aria-hidden="true">
            ·
          </span>
          <span>{cuisine}</span>
        </div>

        <p className="card-desc">{description}</p>

        <p className="card-price">{priceRange}</p>
      </div>
    </Link>
  )
}
