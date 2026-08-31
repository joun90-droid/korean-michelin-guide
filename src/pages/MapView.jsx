import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { divIcon, latLngBounds } from 'leaflet'
import { Link } from 'react-router-dom'
import { matchesGuide, restaurants } from '../data/restaurants'
import StarBadge from '../components/StarBadge'
import BlueRibbonBadge from '../components/BlueRibbonBadge'
import OutboundButtons from '../components/restaurant/outbound-buttons'
import 'leaflet/dist/leaflet.css'
import './MapView.css'

const pinLabels = { bib: 'B', selected: 'S', ribbon: 'R' }
const pinClasses = { bib: 'bib', selected: 'selected', ribbon: 'ribbon-only' }

function makeIcon(stars) {
  const label = pinLabels[stars] ?? String(stars)
  const cls = `map-pin ${pinClasses[stars] ?? ''}`.trim()
  return divIcon({
    className: '',
    html: `<span class="${cls}"><span class="map-pin-label">${label}</span></span>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -28],
  })
}

export default function MapView() {
  const [params] = useSearchParams()
  const guide = params.get('guide') || 'all'
  const list = useMemo(() => restaurants.filter((r) => matchesGuide(r, guide)), [guide])
  const icons = useMemo(() => {
    const map = {}
    for (const level of [3, 2, 1, 'bib', 'selected', 'ribbon']) map[level] = makeIcon(level)
    return map
  }, [])

  const bounds = useMemo(() => {
    const pts = list.filter((r) => r.lat != null && r.lng != null).map((r) => [r.lat, r.lng])
    return pts.length ? latLngBounds(pts) : latLngBounds([[33.2, 126.2], [38.6, 129.6]])
  }, [list])

  return (
    <div className="map-page">
      <div className="map-page-header">
        <h1>지도로 보기</h1>
        <p>전국 미슐랭 셀렉션·블루리본 레스토랑 위치를 지도에서 확인하세요.</p>
        <div className="map-legend">
          <span>
            <i className="dot stars" />
            미슐랭 스타
          </span>
          <span>
            <i className="dot bib" />
            Bib Gourmand
          </span>
          <span>
            <i className="dot selected" />
            가이드 등재
          </span>
          <span>
            <i className="dot ribbon" />
            블루리본 단독
          </span>
        </div>
      </div>

      <div className="map-shell">
        <MapContainer
          bounds={bounds}
          boundsOptions={{ padding: [32, 32] }}
          scrollWheelZoom
          className="leaflet-container-custom"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {list
            .filter((r) => r.lat != null && r.lng != null)
            .map((r) => (
            <Marker
              key={r.id}
              position={[r.lat, r.lng]}
              icon={icons[r.stars ?? 'ribbon']}
            >
              <Popup>
                <div className="map-popup">
                  <div className="map-popup-badges">
                    <StarBadge stars={r.stars} />
                    <BlueRibbonBadge ribbons={r.ribbons} />
                  </div>
                  <strong>{r.name}</strong>
                  <span>
                    {r.region} {r.area} · {r.cuisine}
                  </span>
                  <Link to={`/restaurant/${r.id}`}>상세보기 →</Link>
                  <OutboundButtons restaurant={r} compact />
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  )
}
