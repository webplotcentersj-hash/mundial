import type { SupabaseClient, User } from '@supabase/supabase-js'

/**
 * predictions.user_id references public.profiles(id), not auth.users.
 * Users created before the DB trigger or with a failed trigger have no row here;
 * inserts into predictions then fail with FK. This backfills a profile using the session.
 */
export async function ensureUserProfile(
  supabase: SupabaseClient,
  user: User
): Promise<{ error?: string }> {
  const { data: row, error: selErr } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .maybeSingle()

  if (selErr) {
    console.error('ensureUserProfile select:', selErr)
    return { error: 'No se pudo guardar la predicción' }
  }
  if (row) return {}

  const raw =
    (typeof user.user_metadata?.username === 'string' && user.user_metadata.username.trim()) ||
    user.email?.split('@')[0] ||
    'jugador'
  const base = raw.replace(/\s/g, '_').replace(/[^\p{L}\p{N}_.-]/gu, '').slice(0, 20) || 'jugador'
  const uniqueSuffix = user.id.replace(/-/g, '').slice(0, 10)
  const username = `${base}_${uniqueSuffix}`.slice(0, 30)

  const { error: insErr } = await supabase.from('profiles').insert({
    id: user.id,
    username,
    role: 'user',
  })

  if (insErr) {
    console.error('ensureUserProfile insert:', insErr)
    if (insErr.code === '23505') {
      return {}
    }
    if (insErr.code === '42501' || insErr.message?.includes('permission denied') || insErr.message?.includes('row-level security')) {
      return {
        error:
          'Tu cuenta no tiene perfil en la base del juego. Un administrador debe ejecutar en Supabase el SQL que permite insertar tu propia fila en `profiles` (ver supabase/migrations/20260513_profiles_self_insert.sql).',
      }
    }
    return { error: 'No se pudo guardar la predicción' }
  }
  return {}
}
