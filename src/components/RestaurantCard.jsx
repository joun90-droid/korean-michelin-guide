import { Link } from 'react-router-dom'
import StarBadge from './StarBadge'
import './RestaurantCard.css'

export default function RestaurantCard({ restaurant }) {
  const { id, name, nameEn, stars, cuisine, region, priceRange, description, accent } =
    restaurant

  return (
    <Link to={`/restaurant/${id}`} className="restaurant-card">
      <div className={`card-media ${accent}`}>
        <span className="card-initial">{name.slice(0, 1)}</span>
        <div className="card-media-badge">
          <StarBadge stars={stars} />
        </div>
      </div>

      <div className="card-body">
        <div className="card-heading">
          <h3>{name}</h3>
          <span className="card-name-en">{nameEn}</span>
        </div>

        <div className="card-meta">
          <span>{region}</span>
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
