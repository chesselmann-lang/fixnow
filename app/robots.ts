import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/customer/',
          '/provider/',
          '/admin/',
          '/api/',
          '/auth/callback',
        ],
      },
    ],
    sitemap: 'https://supafix.de/sitemap.xml',
  }
}
