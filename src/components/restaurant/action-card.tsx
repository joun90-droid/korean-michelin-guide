import { Link } from 'react-router-dom'
import './action-card.css'
import StarBadge from '../StarBadge'
import BlueRibbonBadge from '../BlueRibbonBadge'
import CuisineIcon from '../CuisineIcon'

function stop(e) {
  e.preventDefault()
  e.stopPropagation()
}

export default function ActionCard({ restaurant }) {
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
    catchtableUrl,
    naverDirectionsUrl,
    phone,
    greenStar,
  } = restaurant

  const blurb = summary || description || ''

  return (
    <article className="action-card">
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
          <p className="action-price">{priceRange || '가격 문의'}</p>
        </div>
      </Link>
      <div className="action-btns">
        <a href={catchtableUrl} target="_blank" rel="noreferrer" onClick={stop}>
          캐치테이블 실시간 예약
        </a>
        <a href={naverDirectionsUrl} target="_blank" rel="noreferrer" onClick={stop}>
          네이버 지도 길찾기
        </a>
        {phone ? (
          <a href={`tel:${phone}`} onClick={stop}>
            전화 걸기
          </a>
        ) : (
          <span className="action-disabled">전화 정보 없음</span>
        )}
      </div>
    </article>
  )
}
