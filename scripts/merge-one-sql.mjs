import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, "..")

const header = `-- =============================================================================
-- Plot Mundial — UN SOLO SQL (reset + schema + seed)
-- Supabase → SQL Editor. Ejecutar entero una vez.
-- Borra tablas public de la app; NO borra auth.users.
-- Tras correrlo: usuarios existentes en Auth quedan sin fila en profiles hasta
-- que vuelvan a entrar / registrarse o insertes profiles a mano.
-- =============================================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

DROP TABLE IF EXISTS public.user_medals CASCADE;
DROP TABLE IF EXISTS public.league_members CASCADE;
DROP TABLE IF EXISTS public.leagues CASCADE;
DROP TABLE IF EXISTS public.brackets CASCADE;
DROP TABLE IF EXISTS public.official_bracket CASCADE;
DROP TABLE IF EXISTS public.predictions CASCADE;
DROP TABLE IF EXISTS public.matches CASCADE;
DROP TABLE IF EXISTS public.teams CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.handle_updated_at() CASCADE;

`

const schemaPath = path.join(root, "supabase", "plot-mundial-schema-aggiornato.sql")
const schema = fs.readFileSync(schemaPath, "utf8")
const lines = schema.split(/\r?\n/)
let start = 0
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("-- Habilitar la extensión")) {
    start = i
    break
  }
}
const body = lines.slice(start).join("\n")
const out = path.join(root, "supabase", "plot-mundial-todo-en-uno.sql")
fs.writeFileSync(out, `${header}\n${body}`, "utf8")
console.log("Wrote", out, fs.statSync(out).size, "bytes")
