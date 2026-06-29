import type { TriviaDifficulty } from './constants'
import { TRIVIA_POINTS } from './constants'

export const TRIVIA_CATEGORY_LABELS: Record<string, string> = {
  sedes: 'Sedes',
  campeones: 'Campeones',
  finales: 'Finales',
  goleadores: 'Goleadores',
  'goles-records': 'Récords de goles',
  'goles-minutos': 'Goles y minutos',
  'goles-finales': 'Goles en finales',
  'goles-mundial-2022': 'Goles Qatar 2022',
  'goles-plot': 'Goles y prode',
  records: 'Récords',
  leyendas: 'Leyendas',
  momentos: 'Momentos icónicos',
  curiosidades: 'Curiosidades',
  formato: 'Formato',
  historia: 'Historia',
  dt: 'Entrenadores',
  'mundial-2026': 'Mundial 2026',
  'mundial-2026-formato': 'Formato 2026',
  'mundial-2026-sedes': 'Sedes 2026',
  'mundial-2026-grupos': 'Grupos 2026',
  'mundial-2026-argentina': 'Argentina 2026',
  'mundial-2026-calendario': 'Calendario 2026',
  'mundial-2026-favoritos': 'Favoritos 2026',
  'mundial-2026-curiosidades': 'Curiosidades 2026',
  'mundial-2026-situaciones': 'Situaciones 2026',
  'mundial-2026-plot': 'Plot Mundial',
  'mundial-2026-eliminatorias': 'Eliminatorias 2026',
  premios: 'Premios',
  selecciones: 'Selecciones',
}

export function labelTriviaDifficulty(d: TriviaDifficulty): string {
  if (d === 'easy') return 'Fácil'
  if (d === 'hard') return 'Difícil'
  return 'Media'
}

export function labelTriviaCategory(category: string | null): string {
  if (!category) return 'Mundiales'
  return TRIVIA_CATEGORY_LABELS[category] ?? category
}

export function labelTriviaPoints(d: TriviaDifficulty): number {
  return TRIVIA_POINTS[d]
}
