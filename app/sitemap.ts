import catalog from '../public/data/restaurants.json'

const SITE = 'https://michelin-guide-kr.web.app'

export default function sitemap() {
  const restaurants = catalog.restaurants || catalog
  return [
    { url: SITE, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE}/map`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    ...restaurants.map((r) => ({
      url: `${SITE}/restaurant/${r.id}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    })),
  ]
}
