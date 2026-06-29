import type { SupabaseClient } from '@supabase/supabase-js'
import { getKnockoutFeedersForSource, isKnockoutMatchId } from '@/lib/matchTeams'

function toScoreInt(v: unknown): number {
  const n = Number(v)
  return Number.isFinite(n) ? Math.trunc(n) : 0
}

/** Tras cargar un resultado, asigna ganador/perdedor a octavos, cuartos, semis y final. */
export async function propagateKnockoutBracket(
  supabase: SupabaseClient,
  matchId: string,
  homeTeamId: string | null,
  awayTeamId: string | null,
  homeScore: number,
  awayScore: number,
): Promise<void> {
  if (!isKnockoutMatchId(matchId)) return
  if (!homeTeamId || !awayTeamId) return

  const hs = toScoreInt(homeScore)
  const as = toScoreInt(awayScore)
  if (hs === as) return

  const winnerId = hs > as ? homeTeamId : awayTeamId
  const loserId = hs > as ? awayTeamId : homeTeamId

  for (const ref of getKnockoutFeedersForSource(matchId)) {
    const teamId = ref.kind === 'winner' ? winnerId : loserId
    const patch = ref.side === 'home' ? { home_team_id: teamId } : { away_team_id: teamId }
    const { error } = await supabase.from('matches').update(patch).eq('id', ref.matchId)
    if (error) {
      throw new Error(`No se pudo avanzar el cuadro (${ref.matchId}): ${error.message}`)
    }
  }
}

/** Al resetear un partido, limpia cruces siguientes y revierte rondas posteriores ya jugadas. */
export async function clearKnockoutDownstream(
  supabase: SupabaseClient,
  sourceMatchId: string,
  resetFinishedDownstream: (matchId: string) => Promise<void>,
): Promise<void> {
  if (!isKnockoutMatchId(sourceMatchId)) return

  for (const ref of getKnockoutFeedersForSource(sourceMatchId)) {
    const { data: downstream, error: readErr } = await supabase
      .from('matches')
      .select('id, status')
      .eq('id', ref.matchId)
      .maybeSingle()

    if (readErr) {
      throw new Error(`No se pudo leer ${ref.matchId}: ${readErr.message}`)
    }
    if (!downstream) continue

    if (downstream.status === 'finished') {
      await resetFinishedDownstream(ref.matchId)
    }

    const patch = ref.side === 'home' ? { home_team_id: null } : { away_team_id: null }
    const { error: clearErr } = await supabase.from('matches').update(patch).eq('id', ref.matchId)
    if (clearErr) {
      throw new Error(`No se pudo limpiar ${ref.matchId}: ${clearErr.message}`)
    }
  }
}

/** Sincroniza todo el cuadro según partidos eliminatorios ya finalizados. */
export async function syncKnockoutBracketFromResults(supabase: SupabaseClient): Promise<number> {
  const { data: finished, error } = await supabase
    .from('matches')
    .select('id, home_team_id, away_team_id, home_score, away_score')
    .eq('status', 'finished')
    .order('id')

  if (error) {
    throw new Error(`No se pudieron leer partidos eliminatorios: ${error.message}`)
  }

  let propagated = 0
  for (const match of (finished ?? []).filter((m) => isKnockoutMatchId(m.id))) {
    const hs = toScoreInt(match.home_score)
    const as = toScoreInt(match.away_score)
    if (hs === as) continue
    await propagateKnockoutBracket(
      supabase,
      match.id,
      match.home_team_id,
      match.away_team_id,
      hs,
      as,
    )
    propagated += 1
  }
  return propagated
}
