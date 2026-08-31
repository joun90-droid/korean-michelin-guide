import { readFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')
const catalog = JSON.parse(readFileSync(join(root, 'public/data/restaurants.json'), 'utf8'))
const restaurants = catalog.restaurants || []
const SITE = 'https://michelin-guide-kr.web.app'
const indexHtml = readFileSync(join(dist, 'index.html'), 'utf8')

function starLabel(stars) {
  if (stars === 3) return '미쉐린 3스타'
  if (stars === 2) return '미쉐린 2스타'
  if (stars === 1) return '미쉐린 1스타'
  if (stars === 'bib') return '빕 구르망'
  if (stars === 'selected') return '미쉐린 가이드 등재'
  return '추천 레스토랑'
}

function inject(r) {
  const title = `${r.name} | ${starLabel(r.stars)} | 한국 미쉐린 가이드`
  const desc = (r.summary || r.description || `${r.name} ${r.address}`).slice(0, 160)
  const url = `${SITE}/restaurant/${r.id}`
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: r.name,
    alternateName: r.nameEn,
    description: desc,
    servesCuisine: r.cuisine,
    telephone: r.phone || undefined,
    address: {
      '@type': 'PostalAddress',
      streetAddress: r.address,
      addressLocality: r.area,
      addressRegion: r.region,
      addressCountry: 'KR',
    },
    url,
    priceRange: r.priceRange,
  }
  return indexHtml
    .replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(title)}</title>`)
    .replace(
      /<meta\s+name="description"[^>]*>/,
      `<meta name="description" content="${escapeAttr(desc)}" />`,
    )
    .replace(
      '</head>',
      `<link rel="canonical" href="${url}" />
<meta property="og:title" content="${escapeAttr(title)}" />
<meta property="og:description" content="${escapeAttr(desc)}" />
<meta property="og:type" content="article" />
<meta property="og:url" content="${url}" />
<meta property="og:locale" content="ko_KR" />
<meta name="twitter:card" content="summary_large_image" />
<script type="application/ld+json">${JSON.stringify(ld)}</script>
</head>`,
    )
}

function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function escapeAttr(s) {
  return escapeHtml(s).replace(/"/g, '&quot;')
}

for (const r of restaurants) {
  const dir = join(dist, 'restaurant', r.id)
  mkdirSync(dir, { recursive: true })
  writeFileSync(join(dir, 'index.html'), inject(r))
}

console.log(`prerendered ${restaurants.length} restaurant pages`)
