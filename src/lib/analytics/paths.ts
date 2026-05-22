const PATH_LABELS: Record<string, string> = {
  '/': 'Inicio',
  '/fixture': 'Fixture',
  '/dashboard': 'Mi Prode',
  '/ranking': 'Ranking',
  '/trivia': 'Trivia',
  '/figurita': 'Mi Figurita',
  '/bracket': 'Llaves',
  '/store': 'Store',
  '/store/combo': 'Store · Combo',
  '/store/posters': 'Store · Posters',
  '/store/stickers': 'Store · Stickers',
  '/store/pago/exito': 'Store · Pago exitoso',
  '/store/pago/error': 'Store · Pago error',
  '/store/pago/pendiente': 'Store · Pago pendiente',
  '/login': 'Login',
  '/confirmacion': 'Confirmación registro',
  '/pedidos': 'Pedidos',
  '/privacidad': 'Privacidad',
  '/terminos': 'Términos',
  '/admin': 'Admin',
}

export function labelAnalyticsPath(path: string): string {
  if (PATH_LABELS[path]) return PATH_LABELS[path]
  if (path.startsWith('/store/')) return `Store · ${path.slice('/store/'.length)}`
  return path
}

export function normalizeReferrerHost(host: string | null | undefined): string {
  const h = (host ?? '').trim().toLowerCase()
  if (!h) return 'Directo / sin referrer'
  if (h.includes('plotmundial.com')) return 'Plot Mundial (interno)'
  if (h.includes('google.')) return 'Google'
  if (h.includes('facebook.') || h === 'fb.com' || h.includes('fb.me')) return 'Facebook'
  if (h.includes('instagram.')) return 'Instagram'
  if (h.includes('twitter.') || h.includes('x.com')) return 'X / Twitter'
  if (h.includes('whatsapp.')) return 'WhatsApp'
  if (h.includes('t.co')) return 'X / Twitter'
  return h
}
