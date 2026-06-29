/**
 * Imprime cada batch SQL numerado para ejecutar vía MCP execute_sql.
 * Uso: node scripts/seed-trivia-mcp-runner.mjs --batch 7
 */
import { readFileSync, readdirSync } from 'fs'
import { resolve, join } from 'path'

const dir = resolve(process.cwd(), 'scripts/.trivia-seed-batches')
const files = readdirSync(dir)
  .filter((f) => f.startsWith('batch-') && f.endsWith('.sql'))
  .sort()

const arg = process.argv.find((a) => a.startsWith('--batch='))
const n = arg ? Number(arg.split('=')[1]) : null

if (n) {
  const file = files[n - 1]
  if (!file) {
    console.error('Batch no encontrado:', n)
    process.exit(1)
  }
  process.stdout.write(readFileSync(join(dir, file), 'utf8'))
} else {
  console.log(files.length, 'batches')
  files.forEach((f, i) => console.log(i + 1, f))
}
