'use server'

import { createClient } from './supabase/server'
import { revalidatePath } from 'next/cache'

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
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, username, avatar_url, total_points, last_active')
    .order('total_points', { ascending: false })
    .limit(50)

  if (error) {
    console.error('Error fetching ranking:', error)
    return []
  }
  return profiles
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

export async function savePrediction(matchId: string, homeScore: number, awayScore: number) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'Debes iniciar sesión para guardar predicciones' }
  }

  // Verificar que el partido no haya empezado (asumiendo que frontend ya lo valida, esto es doble seguridad)
  const { data: match } = await supabase.from('matches').select('date').eq('id', matchId).single()
  if (match && new Date(match.date) <= new Date()) {
    return { error: 'El partido ya comenzó, no puedes predecir' }
  }

  const { error } = await supabase
    .from('predictions')
    .upsert({
      user_id: user.id,
      match_id: matchId,
      home_score: homeScore,
      away_score: awayScore,
    }, { onConflict: 'user_id,match_id' })

  if (error) {
    console.error('Error saving prediction:', error)
    return { error: 'No se pudo guardar la predicción' }
  }

  revalidatePath('/dashboard')
  revalidatePath('/fixture')
  return { success: true }
}


// --- ACCIONES DE ADMINISTRADOR ---

export async function verifyAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  return profile?.role === 'admin'
}

export async function updateMatchScore(matchId: string, homeScore: number, awayScore: number) {
  const isAdmin = await verifyAdmin()
  if (!isAdmin) {
    throw new Error('No autorizado')
  }

  const supabase = await createClient()

  // 1. Actualizar el partido
  const { error: matchError } = await supabase
    .from('matches')
    .update({ 
      home_score: homeScore, 
      away_score: awayScore,
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
    const realResult = homeScore > awayScore ? 'HOME' : homeScore < awayScore ? 'AWAY' : 'DRAW'

    for (const pred of predictions) {
      let points = 0
      const predResult = pred.home_score > pred.away_score ? 'HOME' : pred.home_score < pred.away_score ? 'AWAY' : 'DRAW'

      // Acierto exacto: 3 puntos
      if (pred.home_score === homeScore && pred.away_score === awayScore) {
        points = 3
      } 
      // Acierto ganador/empate: 1 punto
      else if (predResult === realResult) {
        points = 1
      }

      if (points > 0 || pred.points_earned !== points) {
        // Actualizar predicción con puntos ganados
        await supabase.from('predictions').update({ points_earned: points }).eq('id', pred.id)

        // Actualizar total_points del usuario
        // Calculamos el delta de puntos si ya tenía puntos (ej. si el admin corrigió el resultado)
        const pointDelta = points - (pred.points_earned || 0)
        
        if (pointDelta !== 0) {
           // Obtenemos los puntos actuales
           const { data: profile } = await supabase.from('profiles').select('total_points').eq('id', pred.user_id).single()
           const newTotal = (profile?.total_points || 0) + pointDelta
           await supabase.from('profiles').update({ total_points: newTotal }).eq('id', pred.user_id)
        }
      }
    }
  }

  revalidatePath('/admin')
  revalidatePath('/fixture')
  revalidatePath('/ranking')
  return { success: true }
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

  const { data: league, error: leagueErr } = await supabase.from('leagues').select('id').eq('invite_code', code).single()
  if (leagueErr || !league) throw new Error('Código de liga inválido')

  const { error } = await supabase.from('league_members').insert({
    league_id: league.id,
    user_id: user.id
  })

  if (error && error.code === '23505') throw new Error('Ya eres miembro de esta liga')
  if (error) throw new Error('Error al unirse a la liga')

  revalidatePath('/dashboard')
  return { success: true }
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
  return data.map((d: any) => d.leagues)
}

export async function getLeagueLeaderboard(leagueId: string) {
  const supabase = await createClient()
  
  const { data: members, error } = await supabase
    .from('league_members')
    .select('user_id, profiles(username, total_points, avatar_url)')
    .eq('league_id', leagueId)

  if (error) return []
  return members.map((m: any) => ({
    user_id: m.user_id,
    ...m.profiles
  })).sort((a: any, b: any) => b.total_points - a.total_points)
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
    // 1. Total de usuarios registrados
    const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
    if (count && count > 0) {
      finalUserCount = count
      news.push(`🌍 ${count} jugadores ya están compitiendo por la gloria`)
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
