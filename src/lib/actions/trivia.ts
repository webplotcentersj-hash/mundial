'use server'

import { createClient } from '@/lib/supabase/server'
import { ensureUserProfile } from '@/lib/ensureUserProfile'
import { revalidatePath } from 'next/cache'
import { ensureTriviaQuestionsSeeded } from '@/lib/trivia/seed'
import { TRIVIA_POINTS, TRIVIA_SESSION_SIZE, type TriviaDifficulty } from '@/lib/trivia/constants'

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
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
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
    return { answered: 0, correct: 0, triviaPoints: 0, totalInBank: totalInBank ?? 0 }
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

  return {
    answered: answers?.length ?? 0,
    correct,
    triviaPoints,
    totalInBank: totalInBank ?? 0,
  }
}

/** Devuelve hasta N preguntas que el usuario aún no respondió. */
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
  const pool = pending.length >= TRIVIA_SESSION_SIZE ? pending : allQuestions
  const picked = shuffle(pool).slice(0, TRIVIA_SESSION_SIZE)

  const questions: TriviaQuestionPublic[] = picked.map((row) => ({
    id: row.id,
    question: row.question,
    options: row.options as string[],
    difficulty: row.difficulty as TriviaDifficulty,
    worldCupYear: row.world_cup_year,
    category: row.category,
  }))

  return { questions, stats }
}

export async function submitTriviaAnswer(
  questionId: string,
  selectedIndex: number,
): Promise<{
  correct: boolean
  correctIndex: number
  pointsEarned: number
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
    return { correct: false, correctIndex: 0, pointsEarned: 0, error: 'Debes iniciar sesión' }
  }

  const profileCheck = await ensureUserProfile(supabase, user)
  if (profileCheck.error) {
    return { correct: false, correctIndex: 0, pointsEarned: 0, error: profileCheck.error }
  }

  if (selectedIndex < 0 || selectedIndex > 3) {
    return { correct: false, correctIndex: 0, pointsEarned: 0, error: 'Respuesta inválida' }
  }

  const { data: existing } = await supabase
    .from('trivia_user_answers')
    .select('id, correct, points_earned')
    .eq('user_id', user.id)
    .eq('question_id', questionId)
    .maybeSingle()

  if (existing) {
    const { data: q } = await supabase.from('trivia_questions').select('correct_index').eq('id', questionId).single()
    return {
      correct: existing.correct,
      correctIndex: q?.correct_index ?? 0,
      pointsEarned: existing.points_earned ?? 0,
      alreadyAnswered: true,
    }
  }

  const { data: question, error: qErr } = await supabase
    .from('trivia_questions')
    .select('*')
    .eq('id', questionId)
    .single()

  if (qErr || !question) {
    return { correct: false, correctIndex: 0, pointsEarned: 0, error: 'Pregunta no encontrada' }
  }

  const correctIndex = question.correct_index as number
  const correct = selectedIndex === correctIndex
  const difficulty = question.difficulty as TriviaDifficulty
  const pointsEarned = correct ? TRIVIA_POINTS[difficulty] ?? TRIVIA_POINTS.medium : 0

  const { error: insErr } = await supabase.from('trivia_user_answers').insert({
    user_id: user.id,
    question_id: questionId,
    selected_index: selectedIndex,
    correct,
    points_earned: pointsEarned,
  })

  if (insErr) {
    console.error('submitTriviaAnswer insert:', insErr)
    return { correct: false, correctIndex, pointsEarned: 0, error: 'No se pudo guardar la respuesta' }
  }

  if (pointsEarned > 0) {
    const { data: profile } = await supabase.from('profiles').select('total_points').eq('id', user.id).single()
    const newTotal = (profile?.total_points || 0) + pointsEarned
    const { error: profErr } = await supabase.from('profiles').update({ total_points: newTotal }).eq('id', user.id)
    if (profErr) {
      console.error('submitTriviaAnswer profile:', profErr)
    }
  }

  revalidatePath('/ranking')
  revalidatePath('/trivia')
  revalidatePath('/dashboard')

  return { correct, correctIndex, pointsEarned }
}
