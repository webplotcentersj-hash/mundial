'use server'

import { createClient } from '@/lib/supabase/server'
import { ensureUserProfile } from '@/lib/ensureUserProfile'
import { revalidatePath } from 'next/cache'
import { ensureTriviaQuestionsSeeded } from '@/lib/trivia/seed'
import { TRIVIA_SESSION_SIZE, type TriviaDifficulty } from '@/lib/trivia/constants'
import { computeTriviaPoints } from '@/lib/trivia/scoring'
import { presentQuestionOptions } from '@/lib/trivia/present-options'
import { pickTriviaSessionQuestions } from '@/lib/trivia/session-pick'

export type TriviaQuestionPublic = {
  id: string
  question: string
  options: string[]
  difficulty: TriviaDifficulty
  worldCupYear: number | null
  category: string | null
}

export type TriviaStats = {
  answered: number
  correct: number
  triviaPoints: number
  totalInBank: number
  remainingInBank: number
}

export async function getTriviaStats(): Promise<TriviaStats> {
  await ensureTriviaQuestionsSeeded()
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { count: totalInBank } = await supabase
    .from('trivia_questions')
    .select('id', { count: 'exact', head: true })

  if (!user) {
    const bank = totalInBank ?? 0
    return { answered: 0, correct: 0, triviaPoints: 0, totalInBank: bank, remainingInBank: bank }
  }

  const { data: answers } = await supabase
    .from('trivia_user_answers')
    .select('correct, points_earned')
    .eq('user_id', user.id)

  let correct = 0
  let triviaPoints = 0
  for (const a of answers || []) {
    if (a.correct) correct++
    triviaPoints += a.points_earned || 0
  }

  const answered = answers?.length ?? 0
  const bank = totalInBank ?? 0

  return {
    answered,
    correct,
    triviaPoints,
    totalInBank: bank,
    remainingInBank: Math.max(0, bank - answered),
  }
}

function toPublicQuestion(row: {
  id: string
  question: string
  options: unknown
  correct_index: number
  difficulty: string
  world_cup_year: number | null
  category: string | null
}): TriviaQuestionPublic {
  const rawOptions = row.options as string[]
  const presented = presentQuestionOptions(row.id, rawOptions, row.correct_index)

  return {
    id: row.id,
    question: row.question,
    options: presented.options,
    difficulty: row.difficulty as TriviaDifficulty,
    worldCupYear: row.world_cup_year,
    category: row.category,
  }
}

function resolveCorrectIndex(
  questionId: string,
  rawOptions: string[],
  storedCorrectIndex: number,
): number {
  return presentQuestionOptions(questionId, rawOptions, storedCorrectIndex).correctIndex
}

/** Devuelve hasta N preguntas nuevas, ordenadas de fácil a difícil. */
export async function getTriviaSession(): Promise<{
  questions: TriviaQuestionPublic[]
  stats: TriviaStats
  error?: string
}> {
  await ensureTriviaQuestionsSeeded()
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  const stats = await getTriviaStats()

  if (authError || !user) {
    return { questions: [], stats, error: 'Debes iniciar sesión para jugar trivia' }
  }

  const profileCheck = await ensureUserProfile(supabase, user)
  if (profileCheck.error) {
    return { questions: [], stats, error: profileCheck.error }
  }

  const { data: answeredRows } = await supabase
    .from('trivia_user_answers')
    .select('question_id')
    .eq('user_id', user.id)

  const answeredIds = new Set((answeredRows || []).map((r) => r.question_id))

  const { data: allQuestions, error: qErr } = await supabase.from('trivia_questions').select('*')

  if (qErr || !allQuestions?.length) {
    return { questions: [], stats, error: 'No hay preguntas disponibles todavía' }
  }

  const pending = allQuestions.filter((row) => !answeredIds.has(row.id))

  if (pending.length === 0) {
    return {
      questions: [],
      stats,
      error: 'Ya respondiste todas las preguntas del banco. Mirá el ranking o volvé cuando sumemos más.',
    }
  }

  const picked = pickTriviaSessionQuestions(pending)
  const questions = picked.map(toPublicQuestion)

  return { questions, stats }
}

export async function submitTriviaAnswer(
  questionId: string,
  selectedIndex: number,
  responseTimeMs: number,
): Promise<{
  correct: boolean
  correctIndex: number
  pointsEarned: number
  basePoints: number
  timeBonus: number
  responseTimeMs: number
  timedOut?: boolean
  alreadyAnswered?: boolean
  error?: string
}> {
  await ensureTriviaQuestionsSeeded()
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return {
      correct: false,
      correctIndex: 0,
      pointsEarned: 0,
      basePoints: 0,
      timeBonus: 0,
      responseTimeMs: 0,
      error: 'Debes iniciar sesión',
    }
  }

  const profileCheck = await ensureUserProfile(supabase, user)
  if (profileCheck.error) {
    return {
      correct: false,
      correctIndex: 0,
      pointsEarned: 0,
      basePoints: 0,
      timeBonus: 0,
      responseTimeMs: 0,
      error: profileCheck.error,
    }
  }

  if (selectedIndex < -1 || selectedIndex > 3) {
    return {
      correct: false,
      correctIndex: 0,
      pointsEarned: 0,
      basePoints: 0,
      timeBonus: 0,
      responseTimeMs: 0,
      error: 'Respuesta inválida',
    }
  }

  const timedOut = selectedIndex === -1

  const { data: existing } = await supabase
    .from('trivia_user_answers')
    .select('id, correct, points_earned')
    .eq('user_id', user.id)
    .eq('question_id', questionId)
    .maybeSingle()

  const { data: question, error: qErr } = await supabase
    .from('trivia_questions')
    .select('*')
    .eq('id', questionId)
    .single()

  if (qErr || !question) {
    return {
      correct: false,
      correctIndex: 0,
      pointsEarned: 0,
      basePoints: 0,
      timeBonus: 0,
      responseTimeMs: 0,
      error: 'Pregunta no encontrada',
    }
  }

  const rawOptions = question.options as string[]
  const displayCorrectIndex = resolveCorrectIndex(questionId, rawOptions, question.correct_index as number)

  if (existing) {
    return {
      correct: existing.correct,
      correctIndex: displayCorrectIndex,
      pointsEarned: existing.points_earned ?? 0,
      basePoints: 0,
      timeBonus: 0,
      responseTimeMs: 0,
      alreadyAnswered: true,
    }
  }

  const correct = !timedOut && selectedIndex === displayCorrectIndex
  const difficulty = question.difficulty as TriviaDifficulty
  const score = computeTriviaPoints(difficulty, correct, responseTimeMs)

  const { error: insErr } = await supabase.from('trivia_user_answers').insert({
    user_id: user.id,
    question_id: questionId,
    selected_index: selectedIndex,
    correct,
    points_earned: score.total,
    base_points: score.basePoints,
    time_bonus: score.timeBonus,
    response_time_ms: score.responseTimeMs,
  })

  if (insErr) {
    console.error('submitTriviaAnswer insert:', insErr)
    return {
      correct: false,
      correctIndex: displayCorrectIndex,
      pointsEarned: 0,
      basePoints: 0,
      timeBonus: 0,
      responseTimeMs: 0,
      error: 'No se pudo guardar la respuesta',
    }
  }

  if (score.total > 0) {
    const { data: profile } = await supabase.from('profiles').select('total_points').eq('id', user.id).single()
    const newTotal = (profile?.total_points || 0) + score.total
    const { error: profErr } = await supabase.from('profiles').update({ total_points: newTotal }).eq('id', user.id)
    if (profErr) {
      console.error('submitTriviaAnswer profile:', profErr)
    }
  }

  revalidatePath('/ranking')
  revalidatePath('/trivia')
  revalidatePath('/dashboard')

  return {
    correct,
    correctIndex: displayCorrectIndex,
    pointsEarned: score.total,
    basePoints: score.basePoints,
    timeBonus: score.timeBonus,
    responseTimeMs: score.responseTimeMs,
    timedOut,
  }
}
