/**
 * Crea o actualiza usuario admin en el proyecto Supabase de .env.local
 * Uso: SUPABASE_SERVICE_ROLE_KEY=xxx node scripts/create-admin-user.mjs
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

const EMAIL = 'achavez@plotcenter.com.ar'
const PASSWORD = 'plot3817'

function loadEnv() {
  const path = resolve(process.cwd(), '.env.local')
  if (!existsSync(path)) throw new Error('Falta .env.local')
  const text = readFileSync(path, 'utf8')
  const env = {}
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
    if (m) env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '')
  }
  return env
}

const env = loadEnv()
const url = env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  env.SUPABASE_SERVICE_ROLE_KEY ||
  env.SUPABASE_SERVICE_KEY

if (!url) throw new Error('NEXT_PUBLIC_SUPABASE_URL no definido')
if (!serviceKey) {
  console.error(
    'Falta SUPABASE_SERVICE_ROLE_KEY (env o .env.local).\n' +
      'Supabase → Project Settings → API → service_role (secret).\n' +
      'Ejemplo: $env:SUPABASE_SERVICE_ROLE_KEY="eyJ..." ; node scripts/create-admin-user.mjs',
  )
  process.exit(1)
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

let userId

const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 })
const existing = list?.users?.find((u) => u.email?.toLowerCase() === EMAIL.toLowerCase())

if (existing) {
  userId = existing.id
  const { error: updErr } = await admin.auth.admin.updateUserById(userId, {
    password: PASSWORD,
    email_confirm: true,
  })
  if (updErr) throw updErr
  console.log('Usuario existente: contraseña actualizada y email confirmado.')
} else {
  const { data, error } = await admin.auth.admin.createUser({
    email: EMAIL,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: { username: 'achavez' },
  })
  if (error) throw error
  userId = data.user.id
  console.log('Usuario creado en Auth.')
}

const { data: profile, error: profErr } = await admin
  .from('profiles')
  .select('id, role, username')
  .eq('id', userId)
  .maybeSingle()

if (profErr) {
  if (profErr.code === '42P01') {
    console.error('\nLa tabla public.profiles no existe en este proyecto.')
    console.error('Ejecutá el SQL de supabase/plot-mundial-todo-en-uno.sql en Supabase primero.')
    process.exit(1)
  }
  throw profErr
}

if (!profile) {
  const { error: insErr } = await admin.from('profiles').insert({
    id: userId,
    username: 'achavez',
    role: 'admin',
  })
  if (insErr) throw insErr
  console.log('Perfil creado con role=admin.')
} else {
  const { error: roleErr } = await admin.from('profiles').update({ role: 'admin' }).eq('id', userId)
  if (roleErr) throw roleErr
  console.log('Perfil actualizado a role=admin.')
}

console.log('\nListo.')
console.log('Email:', EMAIL)
console.log('User ID:', userId)
console.log('Panel: /admin (después de login en /login)')
