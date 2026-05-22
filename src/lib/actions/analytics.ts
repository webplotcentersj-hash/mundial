'use server'

import { verifyAdmin } from '@/lib/actions'
import { labelAnalyticsPath, normalizeReferrerHost } from '@/lib/analytics/paths'
import { createAdminClient } from '@/lib/supabase/admin'

export type AdminAnalyticsStats = {
  viewsToday: number
  views7d: number
  views30d: number
  viewsAll: number
  sessionsToday: number
  sessions7d: number
  sessions30d: number
  authenticated7d: number
  anonymous7d: number
  topPages: { path: string; label: string; views: number }[]
  topReferrers: { source: string; views: number }[]
  topUtmSources: { source: string; views: number }[]
  dailyViews: { date: string; views: number; sessions: number }[]
  recentVisits: {
    path: string
    label: string
    referrerHost: string | null
    isAuthenticated: boolean
    createdAt: string
  }[]
}

type Row = {
  path: string
  referrer_host: string | null
  utm_source: string | null
  session_id: string
  is_authenticated: boolean
  created_at: string
}

function sinceDays(days: number): string {
  const d = new Date()
  d.setUTCDate(d.getUTCDate() - days)
  return d.toISOString()
}

function startOfTodayUtc(): string {
  const d = new Date()
  d.setUTCHours(0, 0, 0, 0)
  return d.toISOString()
}

function countSessions(rows: Row[]): number {
  return new Set(rows.map((r) => r.session_id)).size
}

function groupCount<T extends string | null>(
  rows: Row[],
  pick: (r: Row) => T,
  label?: (v: T) => string,
): { source: string; views: number }[] {
  const map = new Map<string, number>()
  for (const r of rows) {
    const raw = pick(r)
    const key = label ? label(raw) : (raw ?? '—')
    map.set(key, (map.get(key) ?? 0) + 1)
  }
  return [...map.entries()]
    .map(([source, views]) => ({ source, views }))
    .sort((a, b) => b.views - a.views)
}

export async function getAdminAnalyticsStats(): Promise<AdminAnalyticsStats | null> {
  const isAdmin = await verifyAdmin()
  if (!isAdmin) return null

  let admin
  try {
    admin = createAdminClient()
  } catch {
    throw new Error('Falta SUPABASE_SERVICE_ROLE_KEY para leer analytics')
  }

  const since30 = sinceDays(30)
  const { data, error } = await admin
    .from('site_page_views')
    .select('path, referrer_host, utm_source, session_id, is_authenticated, created_at')
    .gte('created_at', since30)
    .order('created_at', { ascending: false })
    .limit(8000)

  if (error) {
    throw new Error(error.message)
  }

  const rows = (data ?? []) as Row[]
  const todayStart = startOfTodayUtc()
  const since7 = sinceDays(7)

  const todayRows = rows.filter((r) => r.created_at >= todayStart)
  const rows7d = rows.filter((r) => r.created_at >= since7)

  const { count: viewsAll } = await admin
    .from('site_page_views')
    .select('*', { count: 'exact', head: true })

  const topPagesMap = new Map<string, number>()
  for (const r of rows7d) {
    topPagesMap.set(r.path, (topPagesMap.get(r.path) ?? 0) + 1)
  }
  const topPages = [...topPagesMap.entries()]
    .map(([path, views]) => ({ path, label: labelAnalyticsPath(path), views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 12)

  const topReferrers = groupCount(rows7d, (r) => r.referrer_host, normalizeReferrerHost).slice(0, 10)

  const topUtmSources = groupCount(
    rows7d.filter((r) => r.utm_source),
    (r) => r.utm_source,
  ).slice(0, 8)

  const dailyMap = new Map<string, { views: number; sessions: Set<string> }>()
  for (let i = 13; i >= 0; i--) {
    const d = new Date()
    d.setUTCDate(d.getUTCDate() - i)
    const key = d.toISOString().slice(0, 10)
    dailyMap.set(key, { views: 0, sessions: new Set() })
  }
  for (const r of rows) {
    const key = r.created_at.slice(0, 10)
    const bucket = dailyMap.get(key)
    if (!bucket) continue
    bucket.views += 1
    bucket.sessions.add(r.session_id)
  }
  const dailyViews = [...dailyMap.entries()].map(([date, v]) => ({
    date,
    views: v.views,
    sessions: v.sessions.size,
  }))

  const recentVisits = rows.slice(0, 20).map((r) => ({
    path: r.path,
    label: labelAnalyticsPath(r.path),
    referrerHost: r.referrer_host,
    isAuthenticated: r.is_authenticated,
    createdAt: r.created_at,
  }))

  return {
    viewsToday: todayRows.length,
    views7d: rows7d.length,
    views30d: rows.length,
    viewsAll: viewsAll ?? rows.length,
    sessionsToday: countSessions(todayRows),
    sessions7d: countSessions(rows7d),
    sessions30d: countSessions(rows),
    authenticated7d: rows7d.filter((r) => r.is_authenticated).length,
    anonymous7d: rows7d.filter((r) => !r.is_authenticated).length,
    topPages,
    topReferrers,
    topUtmSources,
    dailyViews,
    recentVisits,
  }
}
