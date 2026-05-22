/**
 * Genera UTC ISO desde horarios locales FIFA por sede (Mundial 2026).
 * Fuente: fifa.com scores-fixtures + comunicados oficiales.
 */
import { writeFileSync } from 'node:fs'

const VENUE_TZ = {
  'Mexico City': 'America/Mexico_City',
  Guadalajara: 'America/Mexico_City',
  Monterrey: 'America/Mexico_City',
  Toronto: 'America/Toronto',
  Vancouver: 'America/Vancouver',
  'Los Angeles': 'America/Los_Angeles',
  'San Francisco Bay Area': 'America/Los_Angeles',
  Seattle: 'America/Los_Angeles',
  Boston: 'America/New_York',
  'New York': 'America/New_York',
  Philadelphia: 'America/New_York',
  Miami: 'America/New_York',
  Atlanta: 'America/New_York',
  Houston: 'America/Chicago',
  Dallas: 'America/Chicago',
  'Kansas City': 'America/Chicago',
}

/** id, calendarDate YYYY-MM-DD (día local sede), HH:MM local, venue key */
const FIFA_SCHEDULE = [
  ['m1', '2026-06-11', '19:00', 'Mexico City'],
  ['m2', '2026-06-12', '02:00', 'Guadalajara'],
  ['m3', '2026-06-12', '19:00', 'Toronto'],
  ['m4', '2026-06-13', '01:00', 'Los Angeles'],
  ['m5', '2026-06-13', '19:00', 'San Francisco Bay Area'],
  ['m6', '2026-06-13', '22:00', 'New York'],
  ['m7', '2026-06-14', '01:00', 'Boston'],
  ['m8', '2026-06-14', '04:00', 'Vancouver'],
  ['m9', '2026-06-14', '17:00', 'Houston'],
  ['m10', '2026-06-14', '20:00', 'Dallas'],
  ['m11', '2026-06-14', '23:00', 'Philadelphia'],
  ['m12', '2026-06-15', '02:00', 'Monterrey'],
  ['m13', '2026-06-15', '16:00', 'Atlanta'],
  ['m14', '2026-06-15', '19:00', 'Seattle'],
  ['m15', '2026-06-15', '22:00', 'Miami'],
  ['m16', '2026-06-16', '01:00', 'Los Angeles'],
  ['m17', '2026-06-16', '19:00', 'New York'],
  ['m18', '2026-06-16', '22:00', 'Boston'],
  ['m19', '2026-06-17', '01:00', 'Kansas City'],
  ['m20', '2026-06-17', '04:00', 'San Francisco Bay Area'],
  ['m21', '2026-06-17', '17:00', 'Houston'],
  ['m22', '2026-06-17', '20:00', 'Dallas'],
  ['m23', '2026-06-17', '23:00', 'Toronto'],
  ['m24', '2026-06-18', '02:00', 'Mexico City'],
  ['m25', '2026-06-18', '16:00', 'Atlanta'],
  ['m26', '2026-06-18', '19:00', 'Los Angeles'],
  ['m27', '2026-06-18', '22:00', 'Vancouver'],
  ['m28', '2026-06-19', '01:00', 'Guadalajara'],
  ['m29', '2026-06-19', '19:00', 'Seattle'],
  ['m30', '2026-06-19', '22:00', 'Boston'],
  ['m31', '2026-06-20', '00:30', 'Philadelphia'],
  ['m32', '2026-06-20', '03:00', 'San Francisco Bay Area'],
  ['m33', '2026-06-20', '17:00', 'Houston'],
  ['m34', '2026-06-20', '20:00', 'Toronto'],
  ['m35', '2026-06-21', '00:00', 'Kansas City'],
  ['m36', '2026-06-21', '04:00', 'Monterrey'],
  ['m37', '2026-06-21', '16:00', 'Atlanta'],
  ['m38', '2026-06-21', '19:00', 'Los Angeles'],
  ['m39', '2026-06-21', '22:00', 'Miami'],
  ['m40', '2026-06-22', '01:00', 'Vancouver'],
  ['m41', '2026-06-22', '17:00', 'Dallas'],
  ['m42', '2026-06-22', '21:00', 'Philadelphia'],
  ['m43', '2026-06-23', '00:00', 'New York'],
  ['m44', '2026-06-23', '03:00', 'San Francisco Bay Area'],
  ['m45', '2026-06-23', '17:00', 'Houston'],
  ['m46', '2026-06-23', '20:00', 'Boston'],
  ['m47', '2026-06-23', '23:00', 'Toronto'],
  ['m48', '2026-06-24', '02:00', 'Guadalajara'],
  ['m49', '2026-06-24', '19:00', 'Vancouver'],
  ['m50', '2026-06-24', '19:00', 'Seattle'],
  ['m51', '2026-06-24', '22:00', 'Miami'],
  ['m52', '2026-06-24', '22:00', 'Atlanta'],
  ['m53', '2026-06-25', '01:00', 'Mexico City'],
  ['m54', '2026-06-25', '01:00', 'Monterrey'],
  ['m55', '2026-06-25', '20:00', 'Philadelphia'],
  ['m56', '2026-06-25', '20:00', 'New York'],
  ['m57', '2026-06-25', '23:00', 'Dallas'],
  ['m58', '2026-06-25', '23:00', 'Kansas City'],
  ['m59', '2026-06-26', '02:00', 'Los Angeles'],
  ['m60', '2026-06-26', '02:00', 'San Francisco Bay Area'],
  ['m61', '2026-06-26', '19:00', 'Boston'],
  ['m62', '2026-06-26', '19:00', 'Toronto'],
  ['m63', '2026-06-27', '00:00', 'Houston'],
  ['m64', '2026-06-27', '00:00', 'Guadalajara'],
  ['m65', '2026-06-27', '03:00', 'Seattle'],
  ['m66', '2026-06-27', '03:00', 'Vancouver'],
  ['m67', '2026-06-27', '21:00', 'New York'],
  ['m68', '2026-06-27', '21:00', 'Philadelphia'],
  ['m69', '2026-06-27', '23:30', 'Miami'],
  ['m70', '2026-06-27', '23:30', 'Atlanta'],
  ['m71', '2026-06-28', '02:00', 'Kansas City'],
  ['m72', '2026-06-28', '02:00', 'Dallas'],
  // 16avos
  ['m73', '2026-06-28', '19:00', 'Los Angeles'],
  ['m74', '2026-06-29', '20:30', 'Boston'],
  ['m75', '2026-06-30', '01:00', 'Monterrey'],
  ['m76', '2026-06-29', '17:00', 'Houston'],
  ['m77', '2026-06-30', '21:00', 'New York'],
  ['m78', '2026-06-30', '17:00', 'Dallas'],
  ['m79', '2026-07-01', '01:00', 'Mexico City'],
  ['m80', '2026-07-01', '16:00', 'Atlanta'],
  ['m81', '2026-07-02', '00:00', 'San Francisco Bay Area'],
  ['m82', '2026-07-01', '20:00', 'Seattle'],
  ['m83', '2026-07-02', '23:00', 'Toronto'],
  ['m84', '2026-07-02', '19:00', 'Los Angeles'],
  ['m85', '2026-07-03', '03:00', 'Vancouver'],
  ['m86', '2026-07-03', '22:00', 'Miami'],
  ['m87', '2026-07-04', '01:30', 'Kansas City'],
  ['m88', '2026-07-03', '18:00', 'Dallas'],
]

const KNOCKOUT_REST = [
  ['m89', '2026-07-04', '21:00', 'Philadelphia'],
  ['m90', '2026-07-04', '17:00', 'Houston'],
  ['m91', '2026-07-05', '20:00', 'New York'],
  ['m92', '2026-07-06', '00:00', 'Mexico City'],
  ['m93', '2026-07-06', '19:00', 'Dallas'],
  ['m94', '2026-07-07', '00:00', 'Seattle'],
  ['m95', '2026-07-07', '16:00', 'Atlanta'],
  ['m96', '2026-07-07', '20:00', 'Vancouver'],
  ['m97', '2026-07-09', '20:00', 'Boston'],
  ['m98', '2026-07-10', '19:00', 'Los Angeles'],
  ['m99', '2026-07-11', '21:00', 'Miami'],
  ['m100', '2026-07-12', '01:00', 'Kansas City'],
  ['m101', '2026-07-14', '19:00', 'Dallas'],
  ['m102', '2026-07-15', '19:00', 'Atlanta'],
  ['m103', '2026-07-18', '21:00', 'Miami'],
  ['m104', '2026-07-19', '19:00', 'New York'],
]

// Replace knockout entries from m89 onward
const idx89 = FIFA_SCHEDULE.findIndex((r) => r[0] === 'm89')
if (idx89 === -1) {
  FIFA_SCHEDULE.push(...KNOCKOUT_REST)
} else {
  FIFA_SCHEDULE.splice(idx89, FIFA_SCHEDULE.length - idx89, ...KNOCKOUT_REST)
}

function localToUtcIso(dateStr, timeStr, venueKey) {
  const tz = VENUE_TZ[venueKey]
  if (!tz) throw new Error(`Unknown venue: ${venueKey}`)
  const [y, mo, d] = dateStr.split('-').map(Number)
  const [h, mi] = timeStr.split(':').map(Number)
  // Probe UTC offset at local civil datetime via formatter
  const guess = Date.UTC(y, mo - 1, d, h, mi)
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
  for (let offsetMin = -16 * 60; offsetMin <= 16 * 60; offsetMin += 15) {
    const probe = new Date(guess - offsetMin * 60_000)
    const parts = Object.fromEntries(fmt.formatToParts(probe).map((p) => [p.type, p.value]))
    const ph = Number(parts.hour === '24' ? '0' : parts.hour)
    if (
      parts.year === String(y) &&
      parts.month === String(mo).padStart(2, '0') &&
      parts.day === String(d).padStart(2, '0') &&
      ph === h &&
      Number(parts.minute) === mi
    ) {
      return probe.toISOString().replace('.000Z', 'Z')
    }
  }
  throw new Error(`Could not convert ${dateStr} ${timeStr} ${venueKey}`)
}

const ART = 'America/Argentina/Buenos_Aires'
const artFmt = new Intl.DateTimeFormat('es-AR', {
  timeZone: ART,
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
})

const results = FIFA_SCHEDULE.map(([id, date, time, venue]) => {
  const utc = localToUtcIso(date, time, venue)
  const art = artFmt.format(new Date(utc))
  return { id, utc, venue, local: `${date} ${time}`, art }
})

console.log(JSON.stringify(results, null, 2))
writeFileSync('scripts/wc2026-utc-schedule.json', JSON.stringify(results, null, 2))
console.error(`Wrote ${results.length} matches`)
