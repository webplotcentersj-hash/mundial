'use client'

import { useEffect, useRef } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

const SKIP_PREFIXES = ['/admin', '/api/', '/confirmacion']
const DEDUPE_MS = 15_000

function getSessionId(): string {
  const KEY = 'plotmundial_analytics_sid'
  try {
    let id = sessionStorage.getItem(KEY)
    if (!id) {
      id = crypto.randomUUID()
      sessionStorage.setItem(KEY, id)
    }
    return id
  } catch {
    return `ephemeral-${Date.now()}`
  }
}

function getUtmFromUrl(search: string) {
  const params = new URLSearchParams(search)
  return {
    utm_source: params.get('utm_source'),
    utm_medium: params.get('utm_medium'),
    utm_campaign: params.get('utm_campaign'),
  }
}

function getStoredUtm() {
  const KEY = 'plotmundial_analytics_utm'
  try {
    const raw = sessionStorage.getItem(KEY)
    if (!raw) return { utm_source: null, utm_medium: null, utm_campaign: null }
    return JSON.parse(raw) as {
      utm_source: string | null
      utm_medium: string | null
      utm_campaign: string | null
    }
  } catch {
    return { utm_source: null, utm_medium: null, utm_campaign: null }
  }
}

function storeUtmIfPresent(search: string) {
  const utm = getUtmFromUrl(search)
  if (!utm.utm_source && !utm.utm_medium && !utm.utm_campaign) return getStoredUtm()
  try {
    sessionStorage.setItem('plotmundial_analytics_utm', JSON.stringify(utm))
  } catch {
    /* ignore */
  }
  return utm
}

export function PageViewTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const lastSent = useRef<{ path: string; at: number } | null>(null)

  useEffect(() => {
    if (!pathname || SKIP_PREFIXES.some((p) => pathname.startsWith(p))) return

    const now = Date.now()
    if (
      lastSent.current &&
      lastSent.current.path === pathname &&
      now - lastSent.current.at < DEDUPE_MS
    ) {
      return
    }
    lastSent.current = { path: pathname, at: now }

    const search = searchParams?.toString() ? `?${searchParams.toString()}` : ''
    const utm = storeUtmIfPresent(search)

    const payload = {
      path: pathname,
      referrer: typeof document !== 'undefined' ? document.referrer || null : null,
      session_id: getSessionId(),
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
      ...utm,
    }

    void fetch('/api/analytics/pageview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {
      /* silencioso */
    })
  }, [pathname, searchParams])

  return null
}
