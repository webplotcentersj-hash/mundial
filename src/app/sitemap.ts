import type { MetadataRoute } from 'next'
import { getSiteUrl } from '@/lib/seo/site'

const PUBLIC_ROUTES = [
  { path: '', priority: 1, changeFrequency: 'daily' as const },
  { path: '/fixture', priority: 0.9, changeFrequency: 'daily' as const },
  { path: '/dashboard', priority: 0.9, changeFrequency: 'daily' as const },
  { path: '/ranking', priority: 0.85, changeFrequency: 'hourly' as const },
  { path: '/trivia', priority: 0.85, changeFrequency: 'weekly' as const },
  { path: '/figurita', priority: 0.8, changeFrequency: 'weekly' as const },
  { path: '/bracket', priority: 0.75, changeFrequency: 'weekly' as const },
  { path: '/store/combo', priority: 0.8, changeFrequency: 'weekly' as const },
  { path: '/store/posters', priority: 0.7, changeFrequency: 'weekly' as const },
  { path: '/store/stickers', priority: 0.7, changeFrequency: 'weekly' as const },
  { path: '/login', priority: 0.4, changeFrequency: 'monthly' as const },
  { path: '/privacidad', priority: 0.3, changeFrequency: 'yearly' as const },
  { path: '/terminos', priority: 0.3, changeFrequency: 'yearly' as const },
]

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl().replace(/\/$/, '')
  const lastModified = new Date()

  return PUBLIC_ROUTES.map(({ path, priority, changeFrequency }) => ({
    url: `${base}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }))
}
