/** Datos oficiales del Mundial FIFA 2026 (USA · México · Canadá). */

/** Zona horaria de referencia del sitio (Argentina). */
export const MUNDIAL_DISPLAY_TZ = 'America/Argentina/Buenos_Aires'

export const WC2026_KICKOFF_ISO = '2026-06-12T01:00:00Z'
export const WC2026_FINAL_ISO = '2026-07-19T23:00:00Z'

export const WC2026_OPENING_MATCH = {
  homeName: 'México',
  awayName: 'Sudáfrica',
  homeCode: 'mx',
  awayCode: 'za',
  date: WC2026_KICKOFF_ISO,
  venue: 'Estadio Ciudad de México',
  stage: 'Grupo A',
} as const

/** Debut: 17 jun 03:00 ART · 01:00 local Kansas City (FIFA). */
export const WC2026_ARGENTINA_DEBUT = {
  homeName: 'Argentina',
  awayName: 'Argelia',
  homeCode: 'ar',
  awayCode: 'dz',
  date: '2026-06-17T06:00:00Z',
  venue: 'Arrowhead Stadium, Kansas City',
  stage: 'Grupo J',
} as const

/** Partidos de grupo de Argentina (UTC desde hora local FIFA por sede). */
export const WC2026_ARGENTINA_GROUP_MATCHES = [
  WC2026_ARGENTINA_DEBUT,
  {
    homeName: 'Argentina',
    awayName: 'Austria',
    homeCode: 'ar',
    awayCode: 'at',
    date: '2026-06-22T22:00:00Z',
    venue: 'AT&T Stadium, Dallas',
    stage: 'Grupo J',
  },
  {
    homeName: 'Jordania',
    awayName: 'Argentina',
    homeCode: 'jo',
    awayCode: 'ar',
    date: '2026-06-28T07:00:00Z',
    venue: 'AT&T Stadium, Dallas',
    stage: 'Grupo J',
  },
] as const

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

export function formatMundialDate(iso: string, timeZone = MUNDIAL_DISPLAY_TZ): string {
  return new Intl.DateTimeFormat('es-AR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone,
  }).format(new Date(iso))
}

export function formatMundialTime(iso: string, timeZone = MUNDIAL_DISPLAY_TZ): string {
  return new Intl.DateTimeFormat('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone,
  }).format(new Date(iso))
}

/** YYYY-MM-DD en calendario argentino (para agrupar partidos en el fixture). */
export function toMundialDateKey(iso: string, timeZone = MUNDIAL_DISPLAY_TZ): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date(iso))
  const y = parts.find((p) => p.type === 'year')?.value ?? '0000'
  const m = parts.find((p) => p.type === 'month')?.value ?? '01'
  const d = parts.find((p) => p.type === 'day')?.value ?? '01'
  return `${y}-${m}-${d}`
}

export function flagCodeForCdn(code: string): string {
  if (code === 'gb-eng') return 'gb'
  return code
}
