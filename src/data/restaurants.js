import catalog from '../../public/data/restaurants.json'
import { hashSeed } from '../lib/ranking'

export const REGIONS = ['전체', '서울', '부산', '제주', '대구', '인천', '경기']

export const CUISINES = ['전체', '한식', '오마카세', '프렌치', '이탈리안', '모던', '중식']

export const STAR_LEVELS = [
  { value: '전체', label: '전체' },
  { value: 3, label: '★★★' },
  { value: 2, label: '★★' },
  { value: 1, label: '★' },
  { value: 'bib', label: 'Bib Gourmand' },
  { value: 'selected', label: '가이드 등재' },
  { value: 'ribbon', label: '블루리본' },
]

export const SITE_URL = 'https://michelin-guide-kr.web.app'

function q(s) {
  return encodeURIComponent(s || '')
}

function priceMin(priceRange) {
  const nums = String(priceRange || '')
    .replace(/,/g, '')
    .match(/\d+/g)
  if (!nums) return null
  return Math.min(...nums.map(Number))
}

function enrich(r) {
  const blob = `${(r.tags || []).join(' ')} ${r.description || ''} ${r.facilities || ''}`
  const lo = r.priceMin ?? priceMin(r.priceRange)
  const privateRoom = /프라이빗|개인룸|룸|private/i.test(blob)
  const parking = /주차|valet|car park/i.test(blob)
  const wine = /와인|wine/i.test(blob)
  const under = r.stars === 'bib' || (lo != null && lo <= 100000)
  const occasions = r.occasions || [
    ...(privateRoom || r.stars >= 2 ? ['parents'] : []),
    ...(r.stars === 1 || r.stars === 2 || r.stars === 3 ? ['date'] : []),
    ...(privateRoom || /호텔|hotel/i.test(blob) ? ['business'] : []),
    ...(r.stars === 'bib' || under ? ['value'] : []),
  ]
  const amenities = r.amenities || [
    ...(privateRoom ? ['private-room'] : []),
    ...(parking ? ['parking'] : []),
    ...(under ? ['under-100k'] : []),
    ...(wine ? ['wine'] : []),
  ]
  const summary = r.summary || (r.description || '').split(/(?<=[.。])\s+/).slice(0, 3).join(' ')
  return {
    ...r,
    summary,
    occasions,
    amenities,
    catchtableUrl: r.catchtableShop
      ? `https://app.catchtable.co.kr/ct/shop/${encodeURIComponent(r.catchtableShop)}`
      : r.catchtableUrl?.includes('/ct/shop/')
        ? r.catchtableUrl
        : `https://app.catchtable.co.kr/ct/map/search-map?showTabs=true&bottomSheetHeightType=PARTIAL_MAP&serviceType=INTEGRATION&keyword=${q(r.name)}&keywordSearch=${q(r.name)}`,
    naverMapUrl: r.naverMapUrl || `https://map.naver.com/p/search/${q(`${r.name} ${r.address || ''}`)}`,
    score:
      ({ 3: 60, 2: 48, 1: 36, bib: 28, selected: 16 }[r.stars] ?? 8) +
      (r.catchtableShop ? 12 : 0) +
      (r.greenStar ? 5 : 0) +
      (r.phone ? 2 : 0) +
      Number(r.ribbons || 0),
  }
}

export const restaurants = (catalog.restaurants || []).map(enrich)

export function getRestaurantById(id) {
  return restaurants.find((r) => r.id === id)
}

export function dailyPicks(list = restaurants, n = 3) {
  const day = new Date().toISOString().slice(0, 10)
  return [...list]
    .map((r) => ({ r, k: (hashSeed(`${day}:${r.id}`) % 400) + r.score }))
    .sort((a, b) => b.k - a.k)
    .slice(0, n)
    .map((x) => x.r)
}
