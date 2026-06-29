/** Etiquetas de cruces eliminatorios cuando aún no hay equipos en DB (home/away NULL). */

export type KnockoutSlotSide = {
  name: string
  code: 'tbd'
  group: 'KO'
}

const slots: Record<string, { home: string; away: string }> = {
  m73: { home: '2º Grupo A', away: '2º Grupo B' },
  m74: { home: '1º Grupo E', away: '3º A/B/C/D/F' },
  m75: { home: '1º Grupo F', away: '2º Grupo C' },
  m76: { home: '1º Grupo C', away: '2º Grupo F' },
  m77: { home: '1º Grupo I', away: '3º C/D/F/G/H' },
  m78: { home: '2º Grupo E', away: '2º Grupo I' },
  m79: { home: '1º Grupo A', away: '3º C/E/F/H/I' },
  m80: { home: '1º Grupo L', away: '3º E/H/I/J/K' },
  m81: { home: '1º Grupo D', away: '3º B/E/F/I/J' },
  m82: { home: '1º Grupo G', away: '3º A/E/H/I/J' },
  m83: { home: '2º Grupo K', away: '2º Grupo L' },
  m84: { home: '1º Grupo H', away: '2º Grupo J' },
  m85: { home: '1º Grupo B', away: '3º E/F/G/I/J' },
  m86: { home: '1º Grupo J', away: '2º Grupo H' },
  m87: { home: '1º Grupo K', away: '3º D/E/I/J/L' },
  m88: { home: '2º Grupo D', away: '2º Grupo G' },
  m89: { home: 'Ganador 74', away: 'Ganador 77' },
  m90: { home: 'Ganador 73', away: 'Ganador 75' },
  m91: { home: 'Ganador 76', away: 'Ganador 78' },
  m92: { home: 'Ganador 79', away: 'Ganador 80' },
  m93: { home: 'Ganador 83', away: 'Ganador 84' },
  m94: { home: 'Ganador 81', away: 'Ganador 82' },
  m95: { home: 'Ganador 86', away: 'Ganador 88' },
  m96: { home: 'Ganador 85', away: 'Ganador 87' },
  m97: { home: 'Ganador 89', away: 'Ganador 90' },
  m98: { home: 'Ganador 93', away: 'Ganador 94' },
  m99: { home: 'Ganador 91', away: 'Ganador 92' },
  m100: { home: 'Ganador 95', away: 'Ganador 96' },
  m101: { home: 'Ganador 97', away: 'Ganador 98' },
  m102: { home: 'Ganador 99', away: 'Ganador 100' },
  m103: { home: 'Perdedor 101', away: 'Perdedor 102' },
  m104: { home: 'Ganador 101', away: 'Ganador 102' },
}

function slotTeam(label: string): KnockoutSlotSide {
  return { name: label, code: 'tbd', group: 'KO' }
}

export function knockoutSlotForMatch(matchId: string): { home: KnockoutSlotSide; away: KnockoutSlotSide } | null {
  const slot = slots[matchId]
  if (!slot) return null
  return {
    home: slotTeam(slot.home),
    away: slotTeam(slot.away),
  }
}

type DbTeam = {
  id?: string
  name: string
  code: string
  group_id?: string
  group?: string
} | null

function isRealTeam(team: DbTeam): team is NonNullable<DbTeam> & { id: string } {
  return Boolean(team?.id && team.code !== 'tbd')
}

export function isKnockoutMatchId(matchId: string): boolean {
  const n = parseInt(matchId.replace(/^m/i, ''), 10)
  return Number.isFinite(n) && n >= 73
}

const KNOCKOUT_STAGES = new Set([
  '16avos',
  'Octavos',
  'Cuartos',
  'Semifinal',
  '3er Puesto',
  'Final',
])

export type KnockoutStageFilter =
  | 'grupos'
  | '16avos'
  | '8vos'
  | 'cuartos'
  | 'semis'
  | '3er-puesto'
  | 'final'
  | 'all-ko'

export const KNOCKOUT_STAGE_FILTERS: { id: KnockoutStageFilter; label: string }[] = [
  { id: 'all-ko', label: 'Eliminatorias' },
  { id: '16avos', label: '16avos' },
  { id: '8vos', label: '8vos' },
  { id: 'cuartos', label: 'Cuartos' },
  { id: 'semis', label: 'Semis' },
  { id: '3er-puesto', label: '3er puesto' },
  { id: 'final', label: 'Final' },
  { id: 'grupos', label: 'Grupos' },
]

export function isKnockoutStage(stage: string | null | undefined): boolean {
  return Boolean(stage && KNOCKOUT_STAGES.has(stage))
}

export function isKnockoutMatch(match: { id: string; stage?: string | null }): boolean {
  if (isKnockoutStage(match.stage)) return true
  return isKnockoutMatchId(match.id)
}

export function formatMatchStage(stage: string | null | undefined): string {
  if (!stage) return '—'
  switch (stage) {
    case 'Octavos':
      return '8vos'
    case 'Semifinal':
      return 'Semis'
    default:
      return stage
  }
}

export function matchMatchesStageFilter(
  match: { id: string; stage?: string | null },
  filter: KnockoutStageFilter,
): boolean {
  if (filter === 'all-ko') return isKnockoutMatch(match)
  if (filter === 'grupos') return !isKnockoutMatch(match)
  if (filter === '8vos') return match.stage === 'Octavos'
  if (filter === 'semis') return match.stage === 'Semifinal'
  if (filter === '3er-puesto') return match.stage === '3er Puesto'
  if (filter === 'final') return match.stage === 'Final'
  if (filter === '16avos') return match.stage === '16avos'
  if (filter === 'cuartos') return match.stage === 'Cuartos'
  return true
}

export function slotLabelForMatchSide(matchId: string, side: 'home' | 'away'): string | null {
  const slot = knockoutSlotForMatch(matchId)
  if (!slot) return null
  return side === 'home' ? slot.home.name : slot.away.name
}

/** Resuelve local/visitante: equipo real, slot eliminatorio o TBD. */
export function resolveMatchTeam(
  team: DbTeam,
  matchId: string,
  side: 'home' | 'away',
): { name: string; code: string; group: string; id?: string } {
  if (isRealTeam(team)) {
    return {
      ...team,
      group: team.group_id ?? team.group ?? 'KO',
    }
  }
  const slot = knockoutSlotForMatch(matchId)
  if (slot) {
    return side === 'home' ? slot.home : slot.away
  }
  return { name: 'Por definir', code: 'tbd', group: 'KO' }
}

export function mapMatchTeams<
  T extends {
    id: string
    home_team_id?: string | null
    away_team_id?: string | null
    homeTeam?: DbTeam
    awayTeam?: DbTeam
  },
>(match: T) {
  const homeFromDb = match.home_team_id ? match.homeTeam ?? null : null
  const awayFromDb = match.away_team_id ? match.awayTeam ?? null : null
  return {
    ...match,
    homeTeam: resolveMatchTeam(homeFromDb, match.id, 'home'),
    awayTeam: resolveMatchTeam(awayFromDb, match.id, 'away'),
  }
}
