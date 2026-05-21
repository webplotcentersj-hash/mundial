export const TRIVIA_POINTS = {
  easy: 5,
  medium: 10,
  hard: 15,
} as const

/** Segundos para responder cada pregunta (más rápido = más bonus). */
export const TRIVIA_TIME_LIMIT_SEC = 12

export const TRIVIA_SESSION_SIZE = 10

export type TriviaDifficulty = keyof typeof TRIVIA_POINTS

export type TriviaQuestionSeed = {
  id: string
  question: string
  options: [string, string, string, string]
  correctIndex: 0 | 1 | 2 | 3
  difficulty: TriviaDifficulty
  worldCupYear?: number
  category: string
}
