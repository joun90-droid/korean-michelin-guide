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
        const haystack = [r.name, r.nameEn, r.area, ...r.tags].join(' ').toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    })

    list = [...list].sort((a, b) => {
      if (filters.sort === 'name') return a.name.localeCompare(b.name, 'ko')
      return (starRank[b.stars] ?? 0) - (starRank[a.stars] ?? 0)
    })

    return list
  }, [filters])

  return (
    <div className="home-page">
      <section className="hero">
        <p className="hero-eyebrow">MICHELIN GUIDE · BLUE RIBBON — SAMPLE</p>
        <h1>전국 방방곡곡의 미식을 한자리에서 만나보세요</h1>
        <p className="hero-sub">
          서울의 미슐랭 스타·빕 구르망부터, 부산·제주·대구 등 전국 각지의 블루리본
          서베이 맛집까지 한눈에 살펴보세요.
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
