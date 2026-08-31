import { useEffect, useMemo, useState } from 'react'
import SearchFilterBar from '../components/SearchFilterBar'
import QuickFilter, { matchesQuickFilters } from '../components/curator/quick-filter'
import ActionCard from '../components/restaurant/action-card'
import SeoHead from '../components/seo/SeoHead'
import { dailyPicks, restaurants } from '../data/restaurants'
import { haversineKm } from '../lib/ranking'
import './Home.css'

const initialFilters = {
  query: '',
  region: '전체',
  cuisine: '전체',
  stars: '전체',
  sort: 'stars',
}

const starRank = { 3: 3, 2: 2, 1: 1, bib: 0.5, selected: 0.25 }

export default function Home() {
  const [filters, setFilters] = useState(initialFilters)
  const [quick, setQuick] = useState([])
  const [here, setHere] = useState(null)
  const [geoError, setGeoError] = useState('')

  useEffect(() => {
    if (filters.sort !== 'nearby') return
    if (!navigator.geolocation) {
      setGeoError('이 브라우저는 위치 정보를 지원하지 않습니다.')
      return
    }
    setGeoError('')
    navigator.geolocation.getCurrentPosition(
      (pos) => setHere({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setGeoError('위치 권한이 없어 서울 시청 기준으로 가까운 순을 보여줍니다.'),
      { enableHighAccuracy: false, timeout: 8000 },
    )
  }, [filters.sort])

  const origin = here || { lat: 37.5665, lng: 126.978 }

  const picks = useMemo(() => dailyPicks(restaurants, 3), [])

  const filtered = useMemo(() => {
    const q = filters.query.trim().toLowerCase()

    let list = restaurants.filter((r) => {
      if (!matchesQuickFilters(r, quick)) return false
      if (filters.region !== '전체' && r.region !== filters.region) return false
      if (filters.cuisine !== '전체' && r.cuisine !== filters.cuisine) return false
      if (filters.stars === 'ribbon' && !r.ribbons) return false
      if (filters.stars !== '전체' && filters.stars !== 'ribbon' && r.stars !== filters.stars)
        return false
      if (q) {
        const haystack = [r.name, r.nameEn, r.area, ...(r.tags || [])].join(' ').toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    })

    list = [...list].sort((a, b) => {
      if (filters.sort === 'name') return a.name.localeCompare(b.name, 'ko')
      if (filters.sort === 'score') return (b.score || 0) - (a.score || 0)
      if (filters.sort === 'nearby') {
        const da =
          a.lat == null ? 9999 : haversineKm(origin.lat, origin.lng, a.lat, a.lng)
        const db =
          b.lat == null ? 9999 : haversineKm(origin.lat, origin.lng, b.lat, b.lng)
        return da - db
      }
      return (starRank[b.stars] ?? 0) - (starRank[a.stars] ?? 0)
    })

    return list
  }, [filters, quick, origin.lat, origin.lng])

  const withDistance =
    filters.sort === 'nearby'
      ? filtered.map((r) => ({
          ...r,
          distanceKm:
            r.lat == null ? null : haversineKm(origin.lat, origin.lng, r.lat, r.lng),
        }))
      : filtered

  return (
    <div className="home-page">
      <SeoHead
        title="한국 미쉐린 가이드 | 상황별 3초 큐레이션"
        description="서울·부산 미쉐린 스타·빕 구르망·그린스타 레스토랑을 목적·조건 태그로 바로 고르고, 캐치테이블·네이버 지도로 바로 예약하세요."
        path="/"
      />
      <section className="hero">
        <div className="hero-glow" aria-hidden="true" />
        <p className="hero-eyebrow">MICHELIN GUIDE KR · DAILY CURATION</p>
        <h1>오늘 어디 갈지, 한 화면에서</h1>
        <p className="hero-sub">
          목적 태그와 랭킹 점수로 걸러 보고, 가까운 곳·오늘의 픽까지 바로 예약하세요.
        </p>
      </section>

      <section className="picks-strip" aria-label="오늘의 픽">
        <div className="picks-head">
          <h2>오늘의 픽</h2>
          <p>날짜마다 바뀌는 추천 세 곳입니다.</p>
        </div>
        <div className="picks-row">
          {picks.map((r) => (
            <ActionCard key={r.id} restaurant={r} compact />
          ))}
        </div>
      </section>

      <QuickFilter selected={quick} onChange={setQuick} />

      <SearchFilterBar
        filters={filters}
        onChange={setFilters}
        resultCount={filtered.length}
      />
      {geoError ? <p className="geo-hint">{geoError}</p> : null}

      {withDistance.length > 0 ? (
        <div className="restaurant-grid">
          {withDistance.map((r) => (
            <ActionCard key={r.id} restaurant={r} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p>조건에 맞는 레스토랑이 없습니다.</p>
          <button
            type="button"
            onClick={() => {
              setFilters(initialFilters)
              setQuick([])
            }}
          >
            필터 초기화
          </button>
        </div>
      )}
    </div>
  )
}
