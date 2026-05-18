import { createClient } from '@/lib/supabase/server'
import { TRIVIA_QUESTIONS_BANK } from './questions-bank'

let seedPromise: Promise<{ count: number }> | null = null

/** Inserta el banco de preguntas si la tabla está vacía o tiene pocas filas. */
export async function ensureTriviaQuestionsSeeded(): Promise<{ count: number }> {
  if (seedPromise) return seedPromise

  seedPromise = (async () => {
    const supabase = await createClient()
    const { count, error: countErr } = await supabase
      .from('trivia_questions')
      .select('id', { count: 'exact', head: true })

    if (countErr) {
      console.error('ensureTriviaQuestionsSeeded count:', countErr)
      return { count: 0 }
    }

    const rows = TRIVIA_QUESTIONS_BANK.map((item) => ({
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

    const { count: finalCount } = await supabase
      .from('trivia_questions')
      .select('id', { count: 'exact', head: true })

    return { count: finalCount ?? rows.length }
  })()

  return seedPromise
}
