import { useEffect } from 'react'
import { SITE_URL } from '../../data/restaurants'

export function starLabel(stars) {
  if (stars === 3) return '미쉐린 3스타'
  if (stars === 2) return '미쉐린 2스타'
  if (stars === 1) return '미쉐린 1스타'
  if (stars === 'bib') return '빕 구르망'
  if (stars === 'selected') return '미쉐린 가이드 등재'
  return '추천 레스토랑'
}

export function buildRestaurantJsonLd(r) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: r.name,
    alternateName: r.nameEn,
    description: r.summary || r.description,
    servesCuisine: r.cuisine,
    address: {
      '@type': 'PostalAddress',
      streetAddress: r.address,
      addressLocality: r.area,
      addressRegion: r.region,
      addressCountry: 'KR',
    },
    telephone: r.phone || undefined,
    url: `${SITE_URL}/restaurant/${r.id}`,
    image: `${SITE_URL}/favicon.svg`,
    priceRange: r.priceRange || undefined,
    geo:
      r.lat != null && r.lng != null
        ? { '@type': 'GeoCoordinates', latitude: r.lat, longitude: r.lng }
        : undefined,
    award: [starLabel(r.stars), r.greenStar ? 'Michelin Green Star' : null].filter(Boolean),
    hasMenu: r.bookingUrl || r.catchtableUrl,
    sameAs: [r.michelinUrl, r.websiteUrl].filter(Boolean),
  }
}

function upsertMeta(attr, key, content) {
  if (!content) return
  let el = document.head.querySelector(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function upsertLink(rel, href) {
  let el = document.head.querySelector(`link[rel="${rel}"]`)
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

export default function SeoHead({
  title,
  description,
  path = '/',
  jsonLd,
  type = 'website',
}) {
  useEffect(() => {
    const url = `${SITE_URL}${path}`
    document.title = title
    upsertMeta('name', 'description', description)
    upsertMeta('property', 'og:title', title)
    upsertMeta('property', 'og:description', description)
    upsertMeta('property', 'og:type', type)
    upsertMeta('property', 'og:url', url)
    upsertMeta('property', 'og:locale', 'ko_KR')
    upsertMeta('property', 'og:site_name', '한국 미쉐린 가이드')
    upsertMeta('property', 'og:image', `${SITE_URL}/favicon.svg`)
    upsertMeta('name', 'twitter:card', 'summary_large_image')
    upsertMeta('name', 'twitter:title', title)
    upsertMeta('name', 'twitter:description', description)
    upsertMeta('name', 'twitter:image', `${SITE_URL}/favicon.svg`)
    upsertLink('canonical', url)

    const id = 'jsonld-restaurant'
    let script = document.getElementById(id)
    if (jsonLd) {
      if (!script) {
        script = document.createElement('script')
        script.id = id
        script.type = 'application/ld+json'
        document.head.appendChild(script)
      }
      script.textContent = JSON.stringify(jsonLd)
    } else if (script) {
      script.remove()
    }

    return () => {
      const leftover = document.getElementById(id)
      if (leftover) leftover.remove()
    }
  }, [title, description, path, type, JSON.stringify(jsonLd ?? null)])

  return null
}
