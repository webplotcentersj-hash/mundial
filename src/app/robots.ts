import type { MetadataRoute } from 'next'
import { getSiteUrl } from '@/lib/seo/site'

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl().replace(/\/$/, '')

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api/', '/auth/', '/confirmacion', '/pedidos'],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  }
}
