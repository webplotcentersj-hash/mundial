import type { SupabaseClient } from '@supabase/supabase-js'

function toScoreInt(v: unknown): number {
  const n = Number(v)
  return Number.isFinite(n) ? Math.trunc(n) : 0
}

export async function applyFixturePointDelta(
  supabase: SupabaseClient,
  userId: string,
  delta: number,
) {
  const { data: profile, error: readErr } = await supabase
    .from('profiles')
    .select('fixture_points, total_points')
    .eq('id', userId)
    .single()
  if (readErr) throw readErr

  const current = toScoreInt(profile?.fixture_points ?? profile?.total_points)
  const next = Math.max(0, current + delta)
  const { error: updErr } = await supabase
    .from('profiles')
    .update({ fixture_points: next, total_points: next })
    .eq('id', userId)
  if (updErr) throw updErr
}

export async function applyTriviaPointDelta(
  supabase: SupabaseClient,
  userId: string,
  delta: number,
) {
  const { data: profile, error: readErr } = await supabase
    .from('profiles')
    .select('trivia_points')
    .eq('id', userId)
    .single()
  if (readErr) throw readErr

  const next = Math.max(0, toScoreInt(profile?.trivia_points) + delta)
  const { error: updErr } = await supabase.from('profiles').update({ trivia_points: next }).eq('id', userId)
  if (updErr) throw updErr
}
