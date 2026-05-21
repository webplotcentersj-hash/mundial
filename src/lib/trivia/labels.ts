import type { TriviaDifficulty } from './constants'
import { TRIVIA_POINTS } from './constants'

export const TRIVIA_CATEGORY_LABELS: Record<string, string> = {
  sedes: 'Sedes',
  campeones: 'Campeones',
  finales: 'Finales',
  goleadores: 'Goleadores',
  records: 'Récords',
  leyendas: 'Leyendas',
  momentos: 'Momentos icónicos',
  curiosidades: 'Curiosidades',
  formato: 'Formato',
  historia: 'Historia',
  dt: 'Entrenadores',
  'mundial-2026': 'Mundial 2026',
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
