import { useMemo, useState } from 'react'
import SearchFilterBar from '../components/SearchFilterBar'
import QuickFilter, { matchesQuickFilters } from '../components/curator/quick-filter'
import ActionCard from '../components/restaurant/action-card'
import SeoHead from '../components/seo/SeoHead'
import { restaurants } from '../data/restaurants'
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

  const filtered = useMemo(() => {
    const q = filters.query.trim().toLowerCase()

    let list = restaurants.filter((r) => {
      if (!matchesQuickFilters(r, quick)) return false
      if (filters.region !== '전체' && r.region !== filters.region) return false
      if (filters.cuisine !== '전체' && r.cuisine !== filters.cuisine) return false
      if (filters.stars === 'ribbon' && !r.ribbons) return false
      if (
        filters.stars !== '전체' &&
        filters.stars !== 'ribbon' &&
        r.stars !== filters.stars
      )
        return false
      if (q) {
        const haystack = [r.name, r.nameEn, r.area, ...(r.tags || [])].join(' ').toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    })

    list = [...list].sort((a, b) => {
      if (filters.sort === 'name') return a.name.localeCompare(b.name, 'ko')
      return (starRank[b.stars] ?? 0) - (starRank[a.stars] ?? 0)
    })

    return list
  }, [filters, quick])

  return (
    <div className="home-page">
      <SeoHead
        title="한국 미쉐린 가이드 | 상황별 3초 큐레이션"
        description="서울·부산 미쉐린 스타·빕 구르망·그린스타 레스토랑을 목적·조건 태그로 바로 고르고, 캐치테이블·네이버 지도로 바로 예약하세요."
        path="/"
      />
      <section className="hero">
        <p className="hero-eyebrow">MICHELIN GUIDE KR · AUTO-UPDATED</p>
        <h1>3초 만에 고르는 오늘의 미쉐린</h1>
        <p className="hero-sub">
          상견례, 기념일, 비즈니스, 가성비 — 태그를 누르면 바로 맞는 테이블만 남습니다.
        </p>
      </section>

      <QuickFilter selected={quick} onChange={setQuick} />

      <SearchFilterBar
        filters={filters}
        onChange={setFilters}
        resultCount={filtered.length}
      />

      {filtered.length > 0 ? (
        <div className="restaurant-grid">
          {filtered.map((r) => (
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
