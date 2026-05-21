import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { TRIVIA_QUESTIONS_BANK } from './questions-bank'

function getSeedSupabase() {
  try {
    return createAdminClient()
  } catch {
    return null
  }
}

/** Inserta o actualiza el banco completo de preguntas en Supabase. */
export async function ensureTriviaQuestionsSeeded(): Promise<{ count: number; bankSize: number }> {
  const admin = getSeedSupabase()
  const supabase = admin ?? (await createClient())
  const bank = TRIVIA_QUESTIONS_BANK

  const rows = bank.map((item) => ({
    id: item.id,
    question: item.question,
    options: item.options,
    correct_index: item.correctIndex,
    difficulty: item.difficulty,
    world_cup_year: item.worldCupYear ?? null,
    category: item.category,
  }))

  const chunkSize = 50
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize)
    const { error } = await supabase.from('trivia_questions').upsert(chunk, { onConflict: 'id' })
    if (error) {
      console.error('ensureTriviaQuestionsSeeded upsert:', error)
      break
    }
  }

  const { count: finalCount, error: countErr } = await supabase
    .from('trivia_questions')
    .select('id', { count: 'exact', head: true })

  if (countErr) {
    console.error('ensureTriviaQuestionsSeeded count:', countErr)
  }

  return { count: finalCount ?? rows.length, bankSize: bank.length }
}
