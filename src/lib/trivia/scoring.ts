import { TRIVIA_POINTS, TRIVIA_TIME_LIMIT_SEC, type TriviaDifficulty } from './constants'

export type TriviaScoreBreakdown = {
  basePoints: number
  timeBonus: number
  total: number
  responseTimeMs: number
}

/** Puntos = acierto (por dificultad) + bonus por segundos restantes (hasta igualar la base). */
export function computeTriviaPoints(
  difficulty: TriviaDifficulty,
  correct: boolean,
  responseTimeMs: number,
): TriviaScoreBreakdown {
  const limitMs = TRIVIA_TIME_LIMIT_SEC * 1000
  const clampedMs = Math.min(Math.max(responseTimeMs, 0), limitMs)

  if (!correct) {
    return { basePoints: 0, timeBonus: 0, total: 0, responseTimeMs: clampedMs }
  }

  const basePoints = TRIVIA_POINTS[difficulty]
  const secondsLeft = (limitMs - clampedMs) / 1000
  const timeBonus = Math.round(basePoints * (secondsLeft / TRIVIA_TIME_LIMIT_SEC))

  return {
    basePoints,
    timeBonus,
    total: basePoints + timeBonus,
    responseTimeMs: clampedMs,
  }
}
