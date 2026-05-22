'use client'

import { usePathname } from 'next/navigation'
import SiteParallaxBackground from '@/components/SiteParallaxBackground'

const BARE_ROUTES = new Set(['/confirmacion'])

export function SiteBackground() {
  const pathname = usePathname()
  if (pathname && BARE_ROUTES.has(pathname)) return null
  return <SiteParallaxBackground />
}
