#!/usr/bin/env node
/**
 * Verifica credenciales de Mercado Pago y Supabase para el Store.
 * Uso: node scripts/check-mp-config.mjs
 * Carga .env.local si existe (sin dependencias extra).
 */
import { readFileSync, existsSync } from 'fs'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const envPath = resolve(root, '.env.local')

if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const i = t.indexOf('=')
    if (i < 1) continue
    const key = t.slice(0, i).trim()
    let val = t.slice(i + 1).trim()
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1)
    }
    if (!process.env[key]) process.env[key] = val
  }
}

const token = process.env.MERCADOPAGO_ACCESS_TOKEN?.trim()
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '')

console.log('Plot Mundial — check Mercado Pago\n')

const missing = []
if (!token) missing.push('MERCADOPAGO_ACCESS_TOKEN')
if (!serviceRole) missing.push('SUPABASE_SERVICE_ROLE_KEY')

if (missing.length) {
  console.error('Faltan variables en .env.local:')
  for (const m of missing) console.error(`  - ${m}`)
  console.error('\nPanel MP: https://www.mercadopago.com.ar/developers/panel/app')
  console.error('Service role: Supabase → Project Settings → API\n')
  process.exit(1)
}

const testMode = token.startsWith('TEST-')
console.log(`Token: ${testMode ? 'PRUEBA (TEST-)' : 'PRODUCCIÓN'}`)
console.log(`App URL: ${appUrl}`)
console.log(`Webhook: ${appUrl}/api/mercadopago/webhook\n`)

try {
  const res = await fetch('https://api.mercadopago.com/users/me', {
    headers: { Authorization: `Bearer ${token}` },
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    console.error('Mercado Pago rechazó el token:', data.message || res.statusText)
    process.exit(1)
  }
  console.log('Mercado Pago OK — cuenta:', data.nickname || data.id || 'conectada')
} catch (e) {
  console.error('No se pudo contactar a Mercado Pago:', e.message)
  process.exit(1)
}

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.warn('\nAviso: falta NEXT_PUBLIC_SUPABASE_URL')
} else {
  try {
    const { createClient } = await import('@supabase/supabase-js')
    const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, serviceRole, {
      auth: { persistSession: false },
    })
    const { error } = await sb.from('store_checkouts').select('id').limit(1)
    if (error) {
      console.error('\nSupabase (service role):', error.message)
      console.error('¿Aplicaste la migración 20260520_mercadopago_store_checkouts.sql?')
      process.exit(1)
    }
    console.log('Supabase OK — tabla store_checkouts accesible')
  } catch (e) {
    console.error('\nSupabase:', e.message)
    process.exit(1)
  }
}

console.log('\nListo para cobrar. Reiniciá `npm run dev` y probá /store con usuario logueado.')
