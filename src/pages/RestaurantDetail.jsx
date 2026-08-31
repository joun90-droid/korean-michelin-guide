import { useEffect } from 'react'
import { Link, useParams, Navigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import { divIcon } from 'leaflet'
import { getRestaurantById, restaurants } from '../data/restaurants'
import StarBadge from '../components/StarBadge'
import BlueRibbonBadge from '../components/BlueRibbonBadge'
import CuisineIcon from '../components/CuisineIcon'
import OutboundButtons from '../components/restaurant/outbound-buttons'
import ActionCard from '../components/restaurant/action-card'
import { telHref } from '../lib/outbound'
import SeoHead, { buildRestaurantJsonLd, starLabel } from '../components/seo/SeoHead'
import { useLibrary } from '../hooks/useLibrary'
import 'leaflet/dist/leaflet.css'
import './RestaurantDetail.css'

function BackIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12.5 4.5 6 10l6.5 5.5"
      />
    </svg>
  )
}

const infoIcons = {
  address: (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10 18s6-5.5 6-10a6 6 0 1 0-12 0c0 4.5 6 10 6 10Z"
      />
      <circle cx="10" cy="8" r="2.2" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),
  phone: (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 3.5c.6 0 1.5 1.9 1.5 2.4s-1 1.3-1 1.7c0 .9 2 2.9 2.9 2.9.4 0 1.3-1 1.7-1s2.4.9 2.4 1.5-1.1 2.5-2 2.5c-1.7 0-6.5-2.8-6.5-9.5 0-.9 1.9-2 2.5-2Z"
      />
    </svg>
  ),
  hours: (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <circle cx="10" cy="10" r="7" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        d="M10 6v4l2.6 2"
      />
    </svg>
  ),
  price: (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10 2.5v15M13.5 5.5h-4.7a2.3 2.3 0 0 0 0 4.6h2.4a2.3 2.3 0 0 1 0 4.6H6"
      />
    </svg>
  ),
}

export default function RestaurantDetail() {
  const { id } = useParams()
  const restaurant = getRestaurantById(id)
  const { remember, isSaved, toggleSave } = useLibrary()

  useEffect(() => {
    if (restaurant?.id) remember(restaurant.id)
  }, [restaurant, remember])

  if (!restaurant) return <Navigate to="/" replace />

  const {
    name,
    nameEn,
    stars,
    ribbons,
    cuisine,
    region,
    area,
    address,
    phone,
    hours,
    priceRange,
    tags,
    description,
    lat,
    lng,
  } = restaurant

  const related = restaurants
    .filter((r) => r.id !== id && (r.area === area || r.cuisine === cuisine))
    .slice(0, 3)

  const pinLabels = { bib: 'B', selected: 'S' }
  const pinIcon = divIcon({
    className: '',
    html: `<span class="map-pin"><span class="map-pin-label">${
      pinLabels[stars] ?? stars ?? 'R'
    }</span></span>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
  })

  const jsonLd = buildRestaurantJsonLd(restaurant)

  return (
    <div className="detail-page">
      <SeoHead
        title={`${name} | ${starLabel(stars)} | 한국 미쉐린 가이드`}
        description={(restaurant.summary || description || `${name} ${address}`).slice(0, 160)}
        path={`/restaurant/${id}`}
        type="article"
        jsonLd={jsonLd}
      />
      <Link to="/" className="back-link">
        <BackIcon />
        목록으로
      </Link>

      <div className={`detail-hero tier-${stars ?? 'ribbon'}`}>
        <CuisineIcon cuisine={cuisine} className="detail-cuisine-icon" />
      </div>

      <div className="detail-header">
        <div>
          <div className="detail-badges">
            <StarBadge stars={stars} size="lg" />
            <BlueRibbonBadge ribbons={ribbons} size="lg" />
          </div>
          <h1>{name}</h1>
          <p className="detail-name-en">{nameEn}</p>
        </div>
        <div className="detail-side">
          <button
            type="button"
            className={`detail-save ${isSaved(id) ? 'on' : ''}`}
            onClick={() => toggleSave(id)}
          >
            {isSaved(id) ? '찜됨' : '찜하기'}
          </button>
          <div className="detail-tags">
            {(tags || []).map((t) => (
              <span key={t} className="tag">
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      <p className="detail-desc">{description}</p>

      <OutboundButtons restaurant={restaurant} className="detail-actions" />

      <div className="detail-grid">
        <dl className="info-list">
          <div>
            <dt>{infoIcons.address}주소</dt>
            <dd>{address}</dd>
          </div>
          <div>
            <dt>{infoIcons.hours}영업시간</dt>
            <dd>{hours}</dd>
          </div>
          <div>
            <dt>{infoIcons.phone}전화</dt>
            <dd>{phone ? <a href={telHref(phone)}>{phone}</a> : '정보 없음'}</dd>
          </div>
          <div>
            <dt>{infoIcons.price}가격대</dt>
            <dd>{priceRange}</dd>
          </div>
          <div>
            <dt>·</dt>
            <dd>
              {region} {area} · {cuisine}
            </dd>
          </div>
        </dl>

        {lat != null && lng != null ? (
          <div className="detail-map">
            <MapContainer
              center={[lat, lng]}
              zoom={15}
              scrollWheelZoom={false}
              dragging={false}
              zoomControl={false}
              className="leaflet-container-custom"
            >
              <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={[lat, lng]} icon={pinIcon} />
            </MapContainer>
          </div>
        ) : null}
      </div>

      {related.length > 0 && (
        <section className="related-section">
          <h2>함께 볼만한 레스토랑</h2>
          <div className="restaurant-grid">
            {related.map((r) => (
              <ActionCard key={r.id} restaurant={r} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
