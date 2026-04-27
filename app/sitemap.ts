import { MetadataRoute } from 'next'

const BASE = 'https://supafix.de'

const CATEGORY_SLUGS = ['sanitaer', 'elektrik', 'reinigung', 'umzug', 'maler', 'garten']

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE,                    lastModified: now, changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${BASE}/auth/login`,    lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/auth/register`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/datenschutz`,   lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${BASE}/impressum`,     lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${BASE}/agb`,           lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${BASE}/preise`,         lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
  ]

  const categoryRoutes: MetadataRoute.Sitemap = CATEGORY_SLUGS.map(slug => ({
    url: `${BASE}/handwerker/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  return [...staticRoutes, ...categoryRoutes]
}
