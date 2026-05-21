import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { TRIVIA_QUESTIONS_BANK } from './questions-bank'

const BANK_SIZE = TRIVIA_QUESTIONS_BANK.length

function getSeedSupabase() {
  try {
    return createAdminClient()
  } catch {
    return null
  }
}

let seedCache: { at: number; count: number } | null = null
const SEED_CACHE_MS = 5 * 60 * 1000

/** Inserta o actualiza el banco si faltan preguntas. `force` re-sincroniza todo (admin). */
export async function ensureTriviaQuestionsSeeded(
  force = false,
): Promise<{ count: number; bankSize: number }> {
  const now = Date.now()
  if (!force && seedCache && now - seedCache.at < SEED_CACHE_MS && seedCache.count >= BANK_SIZE) {
    return { count: seedCache.count, bankSize: BANK_SIZE }
  }

  const admin = getSeedSupabase()
  const supabase = admin ?? (await createClient())

  const { count: existingCount, error: countErr } = await supabase
    .from('trivia_questions')
    .select('id', { count: 'exact', head: true })

  if (countErr) {
    console.error('ensureTriviaQuestionsSeeded count:', countErr)
  }

  const hasFullBank = (existingCount ?? 0) >= BANK_SIZE

  if (!force && hasFullBank) {
    seedCache = { at: now, count: existingCount ?? BANK_SIZE }
    return { count: existingCount ?? BANK_SIZE, bankSize: BANK_SIZE }
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

  const count = finalCount ?? rows.length
  seedCache = { at: now, count }
  return { count, bankSize: BANK_SIZE }
}
