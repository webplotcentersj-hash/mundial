import { NextResponse } from 'next/server'
import { ensureUserProfile } from '@/lib/ensureUserProfile'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/confirmacion'

  if (!code) {
    return NextResponse.redirect(
      `${origin}/login?message=${encodeURIComponent('Enlace de confirmación inválido o expirado')}`,
    )
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !data.user) {
    return NextResponse.redirect(
      `${origin}/login?message=${encodeURIComponent('No se pudo confirmar la cuenta. Pedí un nuevo mail desde login.')}`,
    )
  }

  const profile = await ensureUserProfile(supabase, data.user)
  if (profile.error) {
    console.error('ensureUserProfile after email confirm:', profile.error)
  }

  const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/confirmacion'
  return NextResponse.redirect(`${origin}${safeNext}`)
}
