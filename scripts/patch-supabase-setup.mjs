import { readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const schedule = JSON.parse(readFileSync(join(root, 'scripts/wc2026-utc-schedule.json'), 'utf8'))
const byId = Object.fromEntries(schedule.map((m) => [m.id, m.utc]))
const filePath = join(root, 'supabase_setup.sql')
let lines = readFileSync(filePath, 'utf8').split('\n')
lines = lines.map((line) => {
  for (const [id, utc] of Object.entries(byId)) {
    if (!line.includes(`('${id}',`)) continue
    line = line.replace(/'20\d\d-\d\d-\d\dT[^']+Z'/, `'${utc}'`)
  }
  return line
})
writeFileSync(filePath, lines.join('\n'))
console.log('Updated supabase_setup.sql')
