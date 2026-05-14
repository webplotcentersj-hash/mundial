/** Apodos / mote por selección (código ISO del mock). */
const NICK_BY_CODE: Record<string, string> = {
  mx: 'El Tri',
  za: 'Bafana Bafana',
  kr: 'Tigros de Asia',
  cz: 'Rep. Checa',
  ca: 'Les Rouges',
  ba: 'Zmajevi',
  qa: 'Al-Annabi',
  ch: 'Nati',
  br: 'Canarinha',
  ma: 'Atlas Lions',
  ht: 'Grenadiers',
  'gb-sct': 'Tartan Army',
  us: 'USMNT',
  py: 'La Albirroja',
  au: 'Socceroos',
  tr: 'Ay Yıldız',
  de: 'Die Mannschaft',
  cw: 'Kòrsou',
  ci: 'Les Éléphants',
  ec: 'La Tri',
  nl: 'Oranje',
  jp: 'Samurai Blue',
  se: 'Blågult',
  tn: 'Águilas',
  be: 'Red Devils',
  eg: 'Faraones',
  ir: 'Team Melli',
  nz: 'All Whites',
  es: 'La Roja',
  cv: 'Tubarões',
  sa: 'Verdes',
  uy: 'La Celeste',
  fr: 'Les Bleus',
  sn: 'Teranga',
  iq: 'Osos de Mesopotamia',
  no: 'Drillos',
  ar: 'La Scaloneta',
  dz: 'Fennecs',
  at: 'Das Team',
  jo: 'Al-Nashama',
  pt: 'A Seleção',
  cd: 'Léopards',
  uz: 'Halcones Blancos',
  co: 'Los Cafeteros',
  'gb-eng': 'Three Lions',
  hr: 'Vatreni',
  gh: 'Black Stars',
  pa: 'Canaleros',
}

export function getFiguritaNickname(teamCode: string, countryName: string): string {
  const key = teamCode.trim().toLowerCase()
  const nick = NICK_BY_CODE[key]
  if (nick) return nick
  const short = countryName.replace(/^Rep\.\s*/i, '').trim()
  const first = short.split(/\s+/)[0] || 'Mundial'
  return `Hincha ${first}`
}
