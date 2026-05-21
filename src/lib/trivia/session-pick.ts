import type { TriviaDifficulty } from './constants'
import { TRIVIA_SESSION_SIZE } from './constants'

type QuestionRow = {
  id: string
  difficulty: string
}

const DIFFICULTY_ORDER: TriviaDifficulty[] = ['easy', 'medium', 'hard']

const SESSION_MIX: Record<TriviaDifficulty, number> = {
  easy: 4,
  medium: 4,
  hard: 2,
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

/** Arma una ronda ordenada fácil → difícil, solo con preguntas no respondidas. */
export function pickTriviaSessionQuestions<T extends QuestionRow>(pending: T[]): T[] {
  if (pending.length === 0) return []

  const byDifficulty: Record<TriviaDifficulty, T[]> = {
    easy: [],
    medium: [],
    hard: [],
  }

  for (const row of pending) {
    const key = row.difficulty as TriviaDifficulty
    if (key in byDifficulty) {
      byDifficulty[key].push(row)
    } else {
      byDifficulty.medium.push(row)
    }
  }

  for (const key of DIFFICULTY_ORDER) {
    byDifficulty[key] = shuffle(byDifficulty[key])
  }

  const picked: T[] = []
  for (const key of DIFFICULTY_ORDER) {
    const quota = SESSION_MIX[key]
    picked.push(...byDifficulty[key].slice(0, quota))
  }

  if (picked.length < TRIVIA_SESSION_SIZE) {
    const pickedIds = new Set(picked.map((q) => q.id))
    const rest = shuffle(pending.filter((q) => !pickedIds.has(q.id)))
    picked.push(...rest.slice(0, TRIVIA_SESSION_SIZE - picked.length))
  }

  return picked.slice(0, Math.min(TRIVIA_SESSION_SIZE, pending.length))
}
