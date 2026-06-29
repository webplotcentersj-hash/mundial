/**
 * Sube el banco completo de trivia a Supabase.
 * Uso: npx tsx scripts/seed-trivia.ts
 * Requiere SUPABASE_SERVICE_ROLE_KEY en .env.local o en el entorno.
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'fs'
import { resolve } from 'path'
import { TRIVIA_QUESTIONS_BANK } from '../src/lib/trivia/questions-bank'

function loadEnv() {
  const path = resolve(process.cwd(), '.env.local')
  if (!existsSync(path)) throw new Error('Falta .env.local')
  const text = readFileSync(path, 'utf8')
  const env: Record<string, string> = {}
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
    if (m) env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '')
  }
  return env
}

function esc(value: string): string {
  return value.replace(/'/g, "''")
}

function rowToSql(item: (typeof TRIVIA_QUESTIONS_BANK)[number]): string {
  const options = JSON.stringify(item.options)
  const year = item.worldCupYear ?? null
  return `('${esc(item.id)}', '${esc(item.question)}', '${esc(options)}'::jsonb, ${item.correctIndex}, '${item.difficulty}', ${year === null ? 'null' : year}, '${esc(item.category)}')`
}

async function seedViaClient(url: string, serviceKey: string) {
  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

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
    const { error } = await admin.from('trivia_questions').upsert(chunk, { onConflict: 'id' })
    if (error) throw error
    console.log(`Upsert ${i + chunk.length}/${rows.length}`)
  }

  const { count, error: countErr } = await admin
    .from('trivia_questions')
    .select('id', { count: 'exact', head: true })
  if (countErr) throw countErr
  console.log(`Listo. trivia_questions = ${count} (banco ${TRIVIA_QUESTIONS_BANK.length})`)
}

function writeSqlBatchFiles(outDir: string) {
  mkdirSync(outDir, { recursive: true })
  const values = TRIVIA_QUESTIONS_BANK.map(rowToSql)
  const chunkSize = 40
  const files: string[] = []
  for (let i = 0; i < values.length; i += chunkSize) {
    const chunk = values.slice(i, i + chunkSize)
    const n = Math.floor(i / chunkSize) + 1
    const sql = `insert into public.trivia_questions (id, question, options, correct_index, difficulty, world_cup_year, category)
values
${chunk.join(',\n')}
on conflict (id) do update set
  question = excluded.question,
  options = excluded.options,
  correct_index = excluded.correct_index,
  difficulty = excluded.difficulty,
  world_cup_year = excluded.world_cup_year,
  category = excluded.category;`
    const file = resolve(outDir, `batch-${String(n).padStart(2, '0')}.sql`)
    writeFileSync(file, sql, 'utf8')
    files.push(file)
  }
  console.log(`Wrote ${files.length} batches to ${outDir}`)
  return files.length
}

async function main() {
  const env = loadEnv()
  const url = env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY

  if (!url) throw new Error('NEXT_PUBLIC_SUPABASE_URL no definido')

  if (process.argv.includes('--write-batches')) {
    writeSqlBatchFiles(resolve(process.cwd(), 'scripts/.trivia-seed-batches'))
    return
  }

  if (process.argv.includes('--sql')) {
    writeSqlBatchFiles(resolve(process.cwd(), 'scripts/.trivia-seed-batches'))
    return
  }

  if (!serviceKey) {
    console.error('Falta SUPABASE_SERVICE_ROLE_KEY. Usá --sql para generar batches o agregá la key en .env.local.')
    process.exit(1)
  }

  await seedViaClient(url, serviceKey)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
