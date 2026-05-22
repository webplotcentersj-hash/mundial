import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const SKIP_PREFIXES = ['/admin', '/api/', '/_next']
const MAX_PATH_LEN = 512
const MAX_REFERRER_LEN = 2048
const MAX_SESSION_LEN = 64
const MAX_UA_LEN = 512

function parseReferrerHost(referrer: string | null | undefined): string | null {
  if (!referrer?.trim()) return null
  try {
    return new URL(referrer).hostname.toLowerCase()
  } catch {
    return null
  }
}

function clip(value: string | null | undefined, max: number): string | null {
  if (!value?.trim()) return null
  return value.trim().slice(0, max)
}

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const row = body as Record<string, unknown>
  const path = typeof row.path === 'string' ? row.path.trim() : ''
  const sessionId = typeof row.session_id === 'string' ? row.session_id.trim() : ''

  if (!path.startsWith('/') || path.length > MAX_PATH_LEN) {
    return NextResponse.json({ error: 'Ruta inválida' }, { status: 400 })
  }
  if (!sessionId || sessionId.length > MAX_SESSION_LEN) {
    return NextResponse.json({ error: 'Sesión inválida' }, { status: 400 })
  }
  if (SKIP_PREFIXES.some((p) => path.startsWith(p))) {
    return NextResponse.json({ ok: true, skipped: true })
  }

  const referrer = clip(typeof row.referrer === 'string' ? row.referrer : null, MAX_REFERRER_LEN)

  let userId: string | null = null
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    userId = user?.id ?? null
  } catch {
    /* visita anónima */
  }

  try {
    const admin = createAdminClient()
    const { error } = await admin.from('site_page_views').insert({
      path,
      referrer,
      referrer_host: parseReferrerHost(referrer),
      utm_source: clip(typeof row.utm_source === 'string' ? row.utm_source : null, 120),
      utm_medium: clip(typeof row.utm_medium === 'string' ? row.utm_medium : null, 120),
      utm_campaign: clip(typeof row.utm_campaign === 'string' ? row.utm_campaign : null, 120),
      user_agent: clip(typeof row.user_agent === 'string' ? row.user_agent : null, MAX_UA_LEN),
      user_id: userId,
      session_id: sessionId,
      is_authenticated: Boolean(userId),
    })
    if (error) {
      console.error('site_page_views insert:', error.message)
      return NextResponse.json({ error: 'No se pudo registrar' }, { status: 500 })
    }
  } catch (e) {
    console.error('analytics pageview:', e)
    return NextResponse.json({ ok: true, degraded: true })
  }

  return NextResponse.json({ ok: true })
}
