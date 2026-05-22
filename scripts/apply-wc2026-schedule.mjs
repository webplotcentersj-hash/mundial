/**
 * Aplica horarios UTC oficiales (desde FIFA local) a mockData, SQL y genera migración.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const schedule = JSON.parse(readFileSync(join(root, 'scripts/wc2026-utc-schedule.json'), 'utf8'))
const byId = Object.fromEntries(schedule.map((m) => [m.id, m.utc]))

// --- mockData.ts ---
const mockPath = join(root, 'src/lib/mockData.ts')
let mock = readFileSync(mockPath, 'utf8')
for (const [id, utc] of Object.entries(byId)) {
  const re = new RegExp(`(id: '${id}'[\\s\\S]*?date: ')[^']+(')`, 'm')
  if (!re.test(mock)) {
    console.error(`mockData: no match for ${id}`)
    continue
  }
  mock = mock.replace(re, `$1${utc}$2`)
}
writeFileSync(mockPath, mock)
console.log('Updated mockData.ts')

function patchSql(filePath) {
  let lines = readFileSync(filePath, 'utf8').split('\n')
  lines = lines.map((line) => {
    for (const [id, utc] of Object.entries(byId)) {
      if (!line.includes(`('${id}',`)) continue
      line = line.replace(/'20\d\d-\d\d-\d\dT[^']+Z'/, `'${utc}'`)
    }
    return line
  })
  writeFileSync(filePath, lines.join('\n'))
  console.log('Updated', filePath)
}

patchSql(join(root, 'supabase/plot-mundial-todo-en-uno.sql'))
patchSql(join(root, 'supabase/plot-mundial-schema-aggiornato.sql'))
if (process.argv.includes('--with-setup')) {
  patchSql(join(root, 'supabase_setup.sql'))
}

const updates = schedule.map((m) => `update public.matches set date = '${m.utc}' where id = '${m.id}';`).join('\n')
const migration = `-- Horarios oficiales FIFA: hora local de sede → UTC (104 partidos).\n\n${updates}\n`
const migPath = join(root, 'supabase/migrations/20260527_fix_all_fixture_times_fifa_local.sql')
writeFileSync(migPath, migration)
console.log('Wrote migration', migPath)
