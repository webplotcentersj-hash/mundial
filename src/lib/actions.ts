'use server'

import { createClient } from './supabase/server'
import { ensureUserProfile } from './ensureUserProfile'
import { revalidatePath } from 'next/cache'
import type { PrintProductType } from '@/lib/store/catalog'
import {
  buildOrderNotesForLine,
  isPrintProductType,
  validateStoreCartLine,
  type StoreCartLineInput,
} from '@/lib/store/catalog'

export type { PrintProductType } from '@/lib/store/catalog'

// --- OBTENER DATOS PÚBLICOS ---

export async function getTeams() {
  const supabase = await createClient()
  const { data: teams, error } = await supabase.from('teams').select('*').order('group_id', { ascending: true })
  if (error) {
    console.error('Error fetching teams:', error)
    return []
  }
  return teams
}

export async function getMatches() {
  const supabase = await createClient()
  const { data: matches, error } = await supabase
    .from('matches')
    .select('*, homeTeam:teams!home_team_id(*), awayTeam:teams!away_team_id(*)')
    .order('date', { ascending: true })
  
  if (error) {
    console.error('Error fetching matches:', error)
    return []
  }
  return matches
}

export async function getRanking() {
  const supabase = await createClient()
  // Ranking global = profiles.total_points (pronósticos del fixture + puntos de trivia).
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, username, avatar_url, total_points, last_active')
    .order('total_points', { ascending: false })
    .order('last_active', { ascending: false, nullsFirst: false })
    .limit(50)

  if (error) {
    console.error('Error fetching ranking:', error)
    return []
  }
  return profiles
}

export type PrintOrderStatus =
  | 'awaiting_payment'
  | 'pending'
  | 'in_review'
  | 'printing'
  | 'ready'
  | 'shipped'
  | 'cancelled'

export type PrintOrderRow = {
  id: string
  user_id: string
  product_type: PrintProductType
  quantity: number
  notes: string | null
  contact_name: string
  contact_email: string
  contact_phone: string | null
  status: PrintOrderStatus
  admin_notes: string | null
  customer_image_url: string | null
  admin_file_url: string | null
  created_at: string
  updated_at: string
  profiles?: { username: string | null; avatar_url: string | null } | null
}

// --- ACCIONES DE USUARIO ---

export async function getUserPredictions() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return []

  const { data: predictions, error } = await supabase
    .from('predictions')
    .select('*')
    .eq('user_id', user.id)

  if (error) {
    console.error('Error fetching user predictions:', error)
    return []
  }
  return predictions
}

type PredictionUpsertClient = Awaited<ReturnType<typeof createClient>>

/** Upsert una predicción (sin revalidate). El llamador debe verificar sesión y perfil cuando aplique. */
async function upsertPredictionRow(
  supabase: PredictionUpsertClient,
  userId: string,
  matchId: string,
  homeScore: number,
  awayScore: number,
): Promise<{ error?: string }> {
  const { data: match } = await supabase.from('matches').select('status').eq('id', matchId).maybeSingle()
  if (match?.status === 'finished') {
    return { error: 'Este partido ya finalizó. No podés cambiar el pronóstico.' }
  }

  const { data: existing, error: findErr } = await supabase
    .from('predictions')
    .select('id')
    .eq('user_id', userId)
    .eq('match_id', matchId)
    .maybeSingle()

  if (findErr) {
    console.error('Error finding prediction:', findErr)
    return { error: 'No se pudo guardar la predicción' }
  }

  if (existing?.id) {
    const { error } = await supabase
      .from('predictions')
      .update({
        home_score: homeScore,
        away_score: awayScore,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id)

    if (error) {
      console.error('Error updating prediction:', error)
      return { error: 'No se pudo guardar la predicción' }
    }
  } else {
    const { error } = await supabase.from('predictions').insert({
      user_id: userId,
      match_id: matchId,
      home_score: homeScore,
      away_score: awayScore,
    })

    if (error) {
      console.error('Error inserting prediction:', error)
      return { error: 'No se pudo guardar la predicción' }
    }
  }

  return {}
}

export async function savePrediction(matchId: string, homeScore: number, awayScore: number) {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'Debes iniciar sesión para guardar predicciones' }
  }

  const profileCheck = await ensureUserProfile(supabase, user)
  if (profileCheck.error) {
    return { error: profileCheck.error }
  }

  const res = await upsertPredictionRow(supabase, user.id, matchId, homeScore, awayScore)
  if (res.error) return { error: res.error }

  revalidatePath('/dashboard')
  revalidatePath('/fixture')
  return { success: true }
}

/** Guarda muchos pronósticos en una sola acción (misma validación que savePrediction por ítem). */
export async function savePredictionsBulk(
  rows: { matchId: string; homeScore: number; awayScore: number }[],
): Promise<{ saved: number; errors: string[]; skipped: number }> {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { saved: 0, errors: ['Debes iniciar sesión para guardar predicciones'], skipped: 0 }
  }

  const profileCheck = await ensureUserProfile(supabase, user)
  if (profileCheck.error) {
    return { saved: 0, errors: [profileCheck.error], skipped: 0 }
  }

  let saved = 0
  let skipped = 0
  const errors: string[] = []

  for (const r of rows) {
    const h = Number(r.homeScore)
    const a = Number(r.awayScore)
    if (!Number.isFinite(h) || !Number.isFinite(a) || h < 0 || a < 0) {
      skipped++
      continue
    }
    const res = await upsertPredictionRow(supabase, user.id, r.matchId, Math.floor(h), Math.floor(a))
    if (res.error) errors.push(`${r.matchId}: ${res.error}`)
    else saved++
  }

  if (saved > 0) {
    revalidatePath('/dashboard')
    revalidatePath('/fixture')
  }

  return { saved, errors, skipped }
}


// --- ACCIONES DE ADMINISTRADOR ---

export async function verifyAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  return profile?.role === 'admin'
}

export type AdminProfileListItem = {
  id: string
  username: string | null
  avatar_url: string | null
  total_points: number
  last_active: string | null
  created_at: string
  role: string | null
  predictions_count: number
}

export type AdminUserDetail = {
  profile: AdminProfileListItem
  fixture_points: number
  trivia_answered: number
  trivia_correct: number
  trivia_points: number
  print_orders_count: number
  recent_predictions: {
    id: string
    match_id: string
    home_score: number
    away_score: number
    points_earned: number | null
    match_label: string
    match_status: string | null
    actual_home: number | null
    actual_away: number | null
  }[]
  print_orders: {
    id: string
    product_type: string
    status: string
    created_at: string
    contact_email: string
    contact_name: string
  }[]
}

/** Lista ampliada de perfiles para el panel admin (sin email en DB: ver contacto en pedidos del Store). */
export async function getAdminProfiles(): Promise<AdminProfileListItem[]> {
  const isAdmin = await verifyAdmin()
  if (!isAdmin) return []

  const supabase = await createClient()
  const [{ data, error }, { data: predRows, error: predErr }] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, username, avatar_url, total_points, last_active, created_at, role')
      .order('total_points', { ascending: false })
      .order('last_active', { ascending: false, nullsFirst: false })
      .limit(500),
    supabase.from('predictions').select('user_id'),
  ])

  if (error) {
    console.error('Error fetching admin profiles:', error)
    return []
  }
  if (predErr) {
    console.error('Error fetching prediction counts:', predErr)
  }

  const predCountByUser = new Map<string, number>()
  for (const row of predRows ?? []) {
    const uid = row.user_id as string
    predCountByUser.set(uid, (predCountByUser.get(uid) ?? 0) + 1)
  }

  return (data ?? []).map((p) => ({
    ...p,
    predictions_count: predCountByUser.get(p.id) ?? 0,
  }))
}

/** Ficha completa de un usuario para el panel admin. */
export async function getAdminUserDetail(userId: string): Promise<AdminUserDetail | null> {
  const isAdmin = await verifyAdmin()
  if (!isAdmin) throw new Error('No autorizado')

  const supabase = await createClient()
  const { data: profile, error: profileErr } = await supabase
    .from('profiles')
    .select('id, username, avatar_url, total_points, last_active, created_at, role')
    .eq('id', userId)
    .single()

  if (profileErr || !profile) {
    console.error('Error fetching admin user profile:', profileErr)
    return null
  }

  const [{ data: predRows }, { data: triviaRows }, { data: orders }, { count: predTotal }] =
    await Promise.all([
      supabase
        .from('predictions')
        .select(
          `id, match_id, home_score, away_score, points_earned,
          matches (
            id, home_score, away_score, status,
            homeTeam:teams!home_team_id (name),
            awayTeam:teams!away_team_id (name)
          )`,
        )
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(20),
      supabase.from('trivia_user_answers').select('correct, points_earned').eq('user_id', userId),
      supabase
        .from('print_orders')
        .select('id, product_type, status, created_at, contact_email, contact_name')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10),
      supabase.from('predictions').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    ])

  let fixture_points = 0
  for (const p of predRows ?? []) {
    fixture_points += toScoreInt(p.points_earned)
  }

  let trivia_points = 0
  let trivia_correct = 0
  for (const t of triviaRows ?? []) {
    trivia_points += toScoreInt(t.points_earned)
    if (t.correct) trivia_correct++
  }

  const recent_predictions = (predRows ?? []).map((p: Record<string, unknown>) => {
    const m = p.matches as Record<string, unknown> | null
    const home = m?.homeTeam as { name?: string } | null
    const away = m?.awayTeam as { name?: string } | null
    const homeName = home?.name ?? 'Local'
    const awayName = away?.name ?? 'Visitante'
    return {
      id: p.id as string,
      match_id: p.match_id as string,
      home_score: p.home_score as number,
      away_score: p.away_score as number,
      points_earned: (p.points_earned as number | null) ?? null,
      match_label: `${homeName} vs ${awayName}`,
      match_status: (m?.status as string | null) ?? null,
      actual_home: (m?.home_score as number | null) ?? null,
      actual_away: (m?.away_score as number | null) ?? null,
    }
  })

  return {
    profile: {
      ...profile,
      predictions_count: predTotal ?? predRows?.length ?? 0,
    },
    fixture_points,
    trivia_answered: triviaRows?.length ?? 0,
    trivia_correct,
    trivia_points,
    print_orders_count: orders?.length ?? 0,
    recent_predictions,
    print_orders: (orders ?? []) as AdminUserDetail['print_orders'],
  }
}

export async function listPrintOrdersForAdmin(): Promise<PrintOrderRow[]> {
  const isAdmin = await verifyAdmin()
  if (!isAdmin) throw new Error('No autorizado')

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('print_orders')
    .select('*, profiles(username, avatar_url)')
    .order('created_at', { ascending: false })
    .limit(300)

  if (error) {
    console.error('Error listing print orders:', error)
    throw new Error('No se pudieron cargar los pedidos')
  }
  return (data ?? []) as PrintOrderRow[]
}

export async function listMyPrintOrders(): Promise<PrintOrderRow[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('print_orders')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('Error listing my print orders:', error)
    return []
  }
  return (data ?? []) as PrintOrderRow[]
}

export async function createPrintOrder(input: {
  product_type: PrintProductType
  quantity: number
  notes?: string
  contact_name: string
  contact_email: string
  contact_phone?: string
  customer_image_url?: string | null
}) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Tenés que iniciar sesión para pedir en el Store' }
  }

  const profileCheck = await ensureUserProfile(supabase, user)
  if (profileCheck.error) {
    return { error: profileCheck.error }
  }

  if (!isPrintProductType(input.product_type)) {
    return { error: 'Tipo de producto inválido' }
  }

  const qty = Math.min(99, Math.max(1, Math.floor(Number(input.quantity)) || 1))
  const name = input.contact_name.trim()
  const email = input.contact_email.trim()
  if (name.length < 2) return { error: 'Indicá un nombre de contacto válido' }
  if (email.length < 5 || !email.includes('@')) return { error: 'Indicá un email de contacto válido' }

  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '')
  let customerImageUrl: string | null = null
  if (input.customer_image_url?.trim()) {
    const u = input.customer_image_url.trim()
    const prefix = baseUrl ? `${baseUrl}/storage/v1/object/public/store-prints/` : null
    if (!prefix || !u.startsWith(prefix)) {
      return { error: 'La imagen adjunta no es válida. Volvé a enviarla desde Mi Figurita o el Store.' }
    }
    if (u.length > 2048) return { error: 'URL de imagen demasiado larga' }
    customerImageUrl = u
  }

  const { error } = await supabase.from('print_orders').insert({
    user_id: user.id,
    product_type: input.product_type,
    quantity: qty,
    notes: input.notes?.trim() || null,
    contact_name: name,
    contact_email: email,
    contact_phone: input.contact_phone?.trim() || null,
    status: 'pending',
    customer_image_url: customerImageUrl,
  })

  if (error) {
    console.error('Error creating print order:', error)
    return { error: 'No se pudo registrar el pedido. ¿Ejecutaste las migraciones SQL en Supabase (tabla + bucket store-prints)?' }
  }

  revalidatePath('/store')
  revalidatePath('/admin')
  return { success: true }
}

export async function createPrintOrdersFromCart(input: {
  lines: StoreCartLineInput[]
  contact_name: string
  contact_email: string
  contact_phone?: string
}): Promise<{ success: true; count: number } | { error: string }> {
  if (!input.lines?.length) {
    return { error: 'El carrito está vacío' }
  }
  if (input.lines.length > 25) {
    return { error: 'Máximo 25 ítems por envío' }
  }

  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Tenés que iniciar sesión para pedir en el Store' }
  }

  const profileCheck = await ensureUserProfile(supabase, user)
  if (profileCheck.error) {
    return { error: profileCheck.error }
  }

  const name = input.contact_name.trim()
  const email = input.contact_email.trim()
  if (name.length < 2) return { error: 'Indicá un nombre de contacto válido' }
  if (email.length < 5 || !email.includes('@')) return { error: 'Indicá un email de contacto válido' }

  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '')
  const prefix = baseUrl ? `${baseUrl}/storage/v1/object/public/store-prints/` : null
  const rows: {
    user_id: string
    product_type: PrintProductType
    quantity: number
    notes: string | null
    contact_name: string
    contact_email: string
    contact_phone: string | null
    status: 'pending'
    customer_image_url: string | null
  }[] = []

  for (const line of input.lines) {
    const check = validateStoreCartLine(line)
    if (!check.ok) return { error: check.error }
    const qty = Math.min(99, Math.max(1, Math.floor(Number(line.quantity)) || 1))
    const orderNotes = buildOrderNotesForLine(line)
    let customerImage: string | null = null
    if (line.product_type === 'combo') {
      const u = line.customer_image_url!.trim()
      if (!prefix || !u.startsWith(prefix) || u.length > 2048) {
        return { error: 'Hay una imagen adjunta inválida. Volvé a cargar desde Mi Figurita.' }
      }
      customerImage = u
    }
    rows.push({
      user_id: user.id,
      product_type: line.product_type,
      quantity: qty,
      notes: orderNotes,
      contact_name: name,
      contact_email: email,
      contact_phone: input.contact_phone?.trim() || null,
      status: 'pending',
      customer_image_url: customerImage,
    })
  }

  const { error } = await supabase.from('print_orders').insert(rows)
  if (error) {
    console.error('Error batch insert print_orders:', error)
    return { error: 'No se pudieron registrar los pedidos.' }
  }

  revalidatePath('/store')
  revalidatePath('/admin')
  return { success: true, count: rows.length }
}

export async function updatePrintOrderAdmin(
  orderId: string,
  patch: { status?: PrintOrderStatus; admin_notes?: string | null; admin_file_url?: string | null }
) {
  const isAdmin = await verifyAdmin()
  if (!isAdmin) throw new Error('No autorizado')

  const allowedStatus: PrintOrderStatus[] = [
    'awaiting_payment',
    'pending',
    'in_review',
    'printing',
    'ready',
    'shipped',
    'cancelled',
  ]
  if (patch.status && !allowedStatus.includes(patch.status)) {
    throw new Error('Estado inválido')
  }

  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '')
  if (patch.admin_file_url !== undefined && patch.admin_file_url !== null) {
    const u = patch.admin_file_url.trim()
    const prefix = baseUrl ? `${baseUrl}/storage/v1/object/public/store-prints/` : null
    if (u.length > 0 && (!prefix || !u.startsWith(prefix))) {
      throw new Error('URL de archivo admin inválida')
    }
  }

  const supabase = await createClient()
  const update: Record<string, unknown> = {}
  if (patch.status) update.status = patch.status
  if (patch.admin_notes !== undefined) update.admin_notes = patch.admin_notes
  if (patch.admin_file_url !== undefined) {
    update.admin_file_url = patch.admin_file_url?.trim() || null
  }

  if (Object.keys(update).length === 0) {
    return { success: true }
  }

  const { error } = await supabase.from('print_orders').update(update).eq('id', orderId)
  if (error) {
    console.error('Error updating print order:', error)
    throw new Error('No se pudo actualizar el pedido')
  }

  revalidatePath('/admin')
  revalidatePath('/store')
  return { success: true }
}

/** Convierte marcadores de DB/formulario a entero (evita fallar el === si vienen como string). */
function toScoreInt(v: unknown): number {
  const n = Number(v)
  return Number.isFinite(n) ? Math.trunc(n) : 0
}

export async function updateMatchScore(matchId: string, homeScore: number, awayScore: number) {
  const isAdmin = await verifyAdmin()
  if (!isAdmin) {
    throw new Error('No autorizado')
  }

  const supabase = await createClient()
  const hs = toScoreInt(homeScore)
  const as = toScoreInt(awayScore)

  // 1. Actualizar el partido
  const { error: matchError } = await supabase
    .from('matches')
    .update({ 
      home_score: hs, 
      away_score: as,
      status: 'finished'
    })
    .eq('id', matchId)

  if (matchError) {
    console.error('Error updating match:', matchError)
    throw new Error('No se pudo actualizar el partido')
  }

  // 2. Calcular puntos para todas las predicciones de este partido
  const { data: predictions } = await supabase.from('predictions').select('*').eq('match_id', matchId)
  
  if (predictions && predictions.length > 0) {
    const realResult = hs > as ? 'HOME' : hs < as ? 'AWAY' : 'DRAW'

    for (const pred of predictions) {
      let points = 0
      const ph = toScoreInt(pred.home_score)
      const pa = toScoreInt(pred.away_score)
      const predResult = ph > pa ? 'HOME' : ph < pa ? 'AWAY' : 'DRAW'

      // Acierto exacto: 3 puntos
      if (ph === hs && pa === as) {
        points = 3
      } 
      // Acierto ganador/empate: 1 punto
      else if (predResult === realResult) {
        points = 1
      }

      const prevEarned = toScoreInt(pred.points_earned)
      if (points !== prevEarned) {
        const { error: predUpdErr } = await supabase
          .from('predictions')
          .update({ points_earned: points })
          .eq('id', pred.id)
        if (predUpdErr) {
          console.error('Error updating prediction points:', predUpdErr)
          throw new Error(
            `No se pudieron guardar los puntos del pronóstico (${predUpdErr.message}). ¿Corriste la migración SQL que permite a admins actualizar predicciones y perfiles? Ver supabase/migrations/20260516_admin_fixture_points_rls.sql`,
          )
        }

        const pointDelta = points - prevEarned
        if (pointDelta !== 0) {
          const { data: profile, error: profileReadErr } = await supabase
            .from('profiles')
            .select('total_points')
            .eq('id', pred.user_id)
            .single()
          if (profileReadErr) {
            console.error('Error reading profile for ranking:', profileReadErr)
            throw new Error(`No se pudo leer el perfil para el ranking: ${profileReadErr.message}`)
          }
          const newTotal = (profile?.total_points || 0) + pointDelta
          const { error: profileUpdErr } = await supabase
            .from('profiles')
            .update({ total_points: newTotal })
            .eq('id', pred.user_id)
          if (profileUpdErr) {
            console.error('Error updating profile total_points:', profileUpdErr)
            throw new Error(
              `No se pudo actualizar los puntos en el ranking (${profileUpdErr.message}). ¿Corriste la migración supabase/migrations/20260516_admin_fixture_points_rls.sql?`,
            )
          }
        }
      }
    }
  }

  revalidatePath('/admin')
  revalidatePath('/fixture')
  revalidatePath('/ranking')
  return { success: true }
}

/** Admin: vuelve el partido a pendiente, borra marcador oficial y revierte puntos de pronósticos de ese partido. */
export async function resetMatchResult(matchId: string) {
  const isAdmin = await verifyAdmin()
  if (!isAdmin) {
    throw new Error('No autorizado')
  }

  const supabase = await createClient()

  const { data: match, error: matchReadErr } = await supabase.from('matches').select('id, status').eq('id', matchId).maybeSingle()

  if (matchReadErr || !match) {
    throw new Error('Partido no encontrado')
  }
  if (match.status !== 'finished') {
    throw new Error('Solo se pueden resetear partidos finalizados')
  }

  const { data: predictions, error: predErr } = await supabase.from('predictions').select('id, user_id, points_earned').eq('match_id', matchId)

  if (predErr) {
    console.error('resetMatchResult predictions read:', predErr)
    throw new Error('No se pudieron leer las predicciones')
  }

  for (const pred of predictions || []) {
    const earned = toScoreInt(pred.points_earned)
    if (earned <= 0) continue

    const { data: profile, error: profileReadErr } = await supabase.from('profiles').select('total_points').eq('id', pred.user_id).single()

    if (profileReadErr) {
      console.error('resetMatchResult profile read:', profileReadErr)
      throw new Error(`No se pudo leer el perfil al resetear: ${profileReadErr.message}`)
    }

    const newTotal = Math.max(0, (profile?.total_points || 0) - earned)
    const { error: profileUpdErr } = await supabase.from('profiles').update({ total_points: newTotal }).eq('id', pred.user_id)

    if (profileUpdErr) {
      console.error('resetMatchResult profile update:', profileUpdErr)
      throw new Error(
        `No se pudo revertir puntos del ranking (${profileUpdErr.message}). ¿Corriste la migración supabase/migrations/20260516_admin_fixture_points_rls.sql?`,
      )
    }
  }

  const { error: zeroPredErr } = await supabase.from('predictions').update({ points_earned: 0 }).eq('match_id', matchId)

  if (zeroPredErr) {
    console.error('resetMatchResult predictions zero:', zeroPredErr)
    throw new Error('No se pudieron resetear los puntos en las predicciones')
  }

  const { error: matchUpdErr } = await supabase
    .from('matches')
    .update({
      status: 'pending',
      home_score: null,
      away_score: null,
    })
    .eq('id', matchId)

  if (matchUpdErr) {
    console.error('resetMatchResult match update:', matchUpdErr)
    throw new Error('No se pudo volver el partido a pendiente')
  }

  revalidatePath('/admin')
  revalidatePath('/fixture')
  revalidatePath('/ranking')
  revalidatePath('/dashboard')
  return { success: true }
}

/**
 * Admin: recalcula `profiles.total_points` = pronósticos + trivia por usuario.
 */
export async function adminSyncRankingTotalsFromPredictions() {
  const isAdmin = await verifyAdmin()
  if (!isAdmin) {
    throw new Error('No autorizado')
  }

  const supabase = await createClient()
  const { data: preds, error: predErr } = await supabase.from('predictions').select('user_id, points_earned')
  if (predErr) {
    throw new Error(predErr.message)
  }

  const { data: triviaRows, error: triviaErr } = await supabase
    .from('trivia_user_answers')
    .select('user_id, points_earned')
  if (triviaErr) {
    throw new Error(triviaErr.message)
  }

  const byUser = new Map<string, number>()
  for (const row of preds || []) {
    const uid = row.user_id as string
    byUser.set(uid, (byUser.get(uid) || 0) + toScoreInt(row.points_earned))
  }
  for (const row of triviaRows || []) {
    const uid = row.user_id as string
    byUser.set(uid, (byUser.get(uid) || 0) + toScoreInt(row.points_earned))
  }

  const { data: profiles, error: profErr } = await supabase.from('profiles').select('id')
  if (profErr) {
    throw new Error(profErr.message)
  }

  for (const p of profiles || []) {
    const pts = byUser.get(p.id) ?? 0
    const { error: updErr } = await supabase.from('profiles').update({ total_points: pts }).eq('id', p.id)
    if (updErr) {
      throw new Error(updErr.message)
    }
  }

  revalidatePath('/ranking')
  revalidatePath('/admin')
  revalidatePath('/trivia')
  return { success: true as const, profilesUpdated: profiles?.length ?? 0 }
}


// --- LLAVES (BRACKETS) ---

export async function getUserBracket(userId?: string) {
  const supabase = await createClient()
  let targetId = userId
  if (!targetId) {
    const { data: { user } } = await supabase.auth.getUser()
    targetId = user?.id
  }
  if (!targetId) return null

  const { data, error } = await supabase.from('brackets').select('*').eq('user_id', targetId).single()
  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching bracket:', error)
  }
  return data
}

export async function saveUserBracket(r32Slots: any, matchWinners: any) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autorizado')

  const { error } = await supabase.from('brackets').upsert({
    user_id: user.id,
    r32_slots: r32Slots,
    match_winners: matchWinners
  }, { onConflict: 'user_id' })

  if (error) throw new Error('Error al guardar la llave')
  return { success: true }
}

export async function getOfficialBracket() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('official_bracket').select('*').eq('id', 1).single()
  return data
}

export async function saveOfficialBracket(r32Slots: any, matchWinners: any) {
  const isAdmin = await verifyAdmin()
  if (!isAdmin) throw new Error('No autorizado')
  
  const supabase = await createClient()
  const { error } = await supabase.from('official_bracket').upsert({
    id: 1,
    r32_slots: r32Slots,
    match_winners: matchWinners
  }, { onConflict: 'id' })

  if (error) throw new Error('Error al guardar la llave oficial')
  return { success: true }
}


// --- LIGAS PRIVADAS ---

export async function createLeague(name: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autorizado')

  const code = 'PLOT-' + Math.random().toString(36).substring(2, 8).toUpperCase()
  
  const { data, error } = await supabase.from('leagues').insert({
    name,
    invite_code: code,
    owner_id: user.id
  }).select().single()

  if (error) throw new Error('Error al crear la liga')

  await supabase.from('league_members').insert({
    league_id: data.id,
    user_id: user.id
  })

  revalidatePath('/dashboard')
  return data
}

export async function joinLeague(code: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autorizado')

  const normalized = code.trim().toUpperCase()
  const { data: league, error: leagueErr } = await supabase
    .from('leagues')
    .select('id')
    .eq('invite_code', normalized)
    .single()

  if (leagueErr || !league) throw new Error('Código de liga inválido')

  const { error } = await supabase.from('league_members').insert({
    league_id: league.id,
    user_id: user.id
  })

  if (error && error.code === '23505') throw new Error('Ya eres miembro de esta liga')
  if (error) throw new Error('Error al unirse a la liga')

  revalidatePath('/dashboard')
  return { success: true as const, leagueId: league.id as string }
}

export async function getUserLeagues() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('league_members')
    .select('league_id, leagues(id, name, invite_code, owner_id)')
    .eq('user_id', user.id)

  if (error) return []
  return (data ?? []).map((d: any) => d.leagues).filter(Boolean)
}

export async function getLeagueLeaderboard(leagueId: string) {
  const supabase = await createClient()
  
  const { data: members, error } = await supabase
    .from('league_members')
    .select('user_id, profiles(username, total_points, avatar_url)')
    .eq('league_id', leagueId)

  if (error) return []
  return members
    .map((m: any) => ({
      user_id: m.user_id,
      ...m.profiles,
    }))
    .sort((a: any, b: any) => {
      const d = (b.total_points || 0) - (a.total_points || 0)
      if (d !== 0) return d
      return String(a.username || '').localeCompare(String(b.username || ''), 'es')
    })
}


// --- MEDALLAS ---

export async function getUserMedals() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase.from('user_medals').select('*').eq('user_id', user.id)
  if (error) return []
  return data
}

export async function awardMedal(medalId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  
  await supabase.from('user_medals').insert({
    user_id: user.id,
    medal_id: medalId
  })
}


// --- TICKER NEWS ---
export async function getLiveTickerNews() {
  const supabase = await createClient()
  const news: string[] = []

  let finalUserCount = 0

  try {
    // 1. Total de usuarios registrados (RLS: select público en profiles)
    const { count, error: countError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
    if (countError) {
      console.error('Error counting profiles:', countError)
    }
    finalUserCount = typeof count === 'number' ? count : 0
    if (finalUserCount > 0) {
      news.push(`🌍 ${finalUserCount} jugadores ya están compitiendo por la gloria`)
    }

    // 2. Últimas medallas (max 2)
    const { data: medals } = await supabase
      .from('user_medals')
      .select('medal_id, profiles(username)')
      .order('earned_at', { ascending: false })
      .limit(2)
      
    medals?.forEach((m: any) => {
      const uname = m.profiles?.username || 'Un jugador'
      const medalName = m.medal_id.charAt(0).toUpperCase() + m.medal_id.slice(1)
      news.push(`🔥 ${uname} acaba de desbloquear la medalla ${medalName}`)
    })

    // 3. Últimas ligas (max 2)
    const { data: leagues } = await supabase
      .from('leagues')
      .select('name')
      .order('created_at', { ascending: false })
      .limit(2)
      
    leagues?.forEach((l: any) => {
      news.push(`🏆 Se acaba de crear la liga privada "${l.name}"`)
    })
    
  } catch (error) {
    console.error('Error fetching live news:', error)
  }

  // Fallback si no hay data suficiente
  if (news.length === 0) {
    news.push("⚽ ¡Bienvenidos a Plot Mundial!")
    news.push("🏆 Crea tu liga privada e invita a tus amigos")
    news.push("🔥 Predice los resultados exactos para sumar más puntos")
  }
  
  // Rellenar hasta que al menos haya 5 noticias para un buen flujo visual
  if (news.length < 5) {
    news.push("⚽ Faltan 20 días para el gran partido inaugural")
    news.push("💰 ¡Nuevos premios anunciados para el Top 3 Global!")
  }

  return { news, userCount: finalUserCount }
}
