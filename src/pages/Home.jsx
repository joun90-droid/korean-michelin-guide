import { useMemo, useState } from 'react'
import SearchFilterBar from '../components/SearchFilterBar'
import RestaurantCard from '../components/RestaurantCard'
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

  const filtered = useMemo(() => {
    const q = filters.query.trim().toLowerCase()

    let list = restaurants.filter((r) => {
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
        const haystack = [r.name, r.nameEn, ...r.tags].join(' ').toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    })

    list = [...list].sort((a, b) => {
      if (filters.sort === 'name') return a.name.localeCompare(b.name, 'ko')
      return starRank[b.stars] - starRank[a.stars]
    })

    return list
  }, [filters])

  return (
    <div className="home-page">
      <section className="hero">
        <p className="hero-eyebrow">MICHELIN GUIDE SEOUL — SAMPLE</p>
        <h1>한국을 대표하는 미식의 정점을 만나보세요</h1>
        <p className="hero-sub">
          미슐랭 스타·빕 구르망은 물론 스타 없이 가이드에 등재된 곳까지, 그리고
          블루리본 서베이 수상 정보까지 함께 살펴보세요.
        </p>
      </section>

      <SearchFilterBar
        filters={filters}
        onChange={setFilters}
        resultCount={filtered.length}
      />

      {filtered.length > 0 ? (
        <div className="restaurant-grid">
          {filtered.map((r) => (
            <RestaurantCard key={r.id} restaurant={r} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p>조건에 맞는 레스토랑이 없습니다.</p>
          <button type="button" onClick={() => setFilters(initialFilters)}>
            필터 초기화
          </button>
        </div>
      )}
    </div>
  )
}
