/** Datos oficiales del Mundial FIFA 2026 (USA · México · Canadá). */

export const WC2026_KICKOFF_ISO = '2026-06-11T15:00:00Z'
export const WC2026_FINAL_ISO = '2026-07-19T19:00:00Z'

export const WC2026_OPENING_MATCH = {
  homeName: 'México',
  awayName: 'Sudáfrica',
  homeCode: 'mx',
  awayCode: 'za',
  date: WC2026_KICKOFF_ISO,
  venue: 'Estadio Ciudad de México',
  stage: 'Grupo A',
} as const

export const WC2026_ARGENTINA_DEBUT = {
  homeName: 'Argentina',
  awayName: 'Argelia',
  homeCode: 'ar',
  awayCode: 'dz',
  date: '2026-06-16T21:00:00Z',
  venue: 'Estadio Kansas City',
  stage: 'Grupo J',
} as const

export const WC2026_FACTS = {
  teams: 48,
  matches: 104,
  groups: 12,
  hostCountries: ['Estados Unidos', 'México', 'Canadá'],
  venues: 16,
  finalVenue: 'MetLife Stadium (NY/NJ)',
} as const

export type MundialMatchPreview = {
  homeName: string
  awayName: string
  homeCode: string
  awayCode: string
  date: string
  venue: string | null
  stage: string | null
}

export type MundialPhase = 'pre' | 'live' | 'finished'

export function getMundialPhase(now = Date.now()): MundialPhase {
  const kickoff = Date.parse(WC2026_KICKOFF_ISO)
  const finalEnd = Date.parse(WC2026_FINAL_ISO) + 6 * 60 * 60 * 1000
  if (now < kickoff) return 'pre'
  if (now < finalEnd) return 'live'
  return 'finished'
}

export function getDaysUntilKickoff(now = Date.now()): number {
  const kickoff = Date.parse(WC2026_KICKOFF_ISO)
  return Math.max(0, Math.ceil((kickoff - now) / 86_400_000))
}

export function formatMundialDate(iso: string, timeZone = 'America/Argentina/Buenos_Aires'): string {
  return new Intl.DateTimeFormat('es-AR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone,
  }).format(new Date(iso))
}

export function formatMundialTime(iso: string, timeZone = 'America/Argentina/Buenos_Aires'): string {
  return new Intl.DateTimeFormat('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone,
  }).format(new Date(iso))
}

export function flagCodeForCdn(code: string): string {
  if (code === 'gb-eng') return 'gb'
  return code
}
