import { REGIONS, CUISINES, STAR_LEVELS } from '../data/restaurants'
import './SearchFilterBar.css'

function SearchIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        d="m17.5 17.5-3.6-3.6m1.77-4.4a6.17 6.17 0 1 1-12.34 0 6.17 6.17 0 0 1 12.34 0Z"
      />
    </svg>
  )
}

export default function SearchFilterBar({ filters, onChange, resultCount }) {
  const update = (patch) => onChange({ ...filters, ...patch })

  return (
    <div className="filter-bar">
      <div className="search-field">
        <SearchIcon />
        <input
          type="search"
          placeholder="레스토랑 이름, 태그로 검색"
          value={filters.query}
          onChange={(e) => update({ query: e.target.value })}
          aria-label="레스토랑 검색"
        />
      </div>

      <div className="filter-selects">
        <select
          value={filters.region}
          onChange={(e) => update({ region: e.target.value })}
          aria-label="지역 필터"
        >
          {REGIONS.map((r) => (
            <option key={r} value={r}>
              {r === '전체' ? '지역 전체' : r}
            </option>
          ))}
        </select>

        <select
          value={filters.cuisine}
          onChange={(e) => update({ cuisine: e.target.value })}
          aria-label="음식 종류 필터"
        >
          {CUISINES.map((c) => (
            <option key={c} value={c}>
              {c === '전체' ? '음식 종류 전체' : c}
            </option>
          ))}
        </select>

        <select
          value={filters.sort}
          onChange={(e) => update({ sort: e.target.value })}
          aria-label="정렬"
        >
          <option value="stars">별점 높은 순</option>
          <option value="score">추천 점수 순</option>
          <option value="nearby">가까운 순</option>
          <option value="name">이름순</option>
        </select>
      </div>

      <div className="star-chips" role="group" aria-label="등급 필터">
        {STAR_LEVELS.map((s) => (
          <button
            key={s.value}
            type="button"
            className={`chip ${filters.stars === s.value ? 'active' : ''}`}
            onClick={() => update({ stars: s.value })}
          >
            {s.label}
          </button>
        ))}
      </div>

      <p className="result-count">
        <strong>{resultCount}</strong>개의 레스토랑
      </p>
    </div>
  )
}
