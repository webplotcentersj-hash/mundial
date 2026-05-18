export const TRIVIA_POINTS = {
  easy: 5,
  medium: 10,
  hard: 15,
} as const

export const TRIVIA_SESSION_SIZE = 10

export type TriviaDifficulty = keyof typeof TRIVIA_POINTS
