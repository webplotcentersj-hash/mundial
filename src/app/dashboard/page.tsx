'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  Trophy,
  Save,
  MapPin,
  Users,
  Medal,
  Search,
  Plus,
  Sparkles,
  Star,
  Target,
  Loader2,
  Zap,
  ClipboardCheck,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import {
  getMatches,
  getUserPredictions,
  savePrediction as savePredictionAction,
  savePredictionsBulk,
  getUserBracket,
  getOfficialBracket,
  getUserLeagues,
  getLeagueLeaderboard,
  createLeague,
  joinLeague,
  getUserMedals,
} from '@/lib/actions'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'matches' | 'results' | 'leagues' | 'medals'>('matches')
  const [predictions, setPredictions] = useState<Record<string, { home: string; away: string }>>({})
  const [pointsByMatchId, setPointsByMatchId] = useState<Record<string, number>>({})
  const [matches, setMatches] = useState<any[]>([])
  const [bracketPoints, setBracketPoints] = useState(0)
  const [basePoints, setBasePoints] = useState(0)
  const [isSaving, setIsSaving] = useState<string | null>(null)
  const [isSavingBulk, setIsSavingBulk] = useState(false)
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState('JUGADOR')

  const [leagues, setLeagues] = useState<any[]>([])
  const [activeLeagueId, setActiveLeagueId] = useState<string | null>(null)
  const [leagueLeaderboard, setLeagueLeaderboard] = useState<any[]>([])
  const [joinCode, setJoinCode] = useState('')
  const [newLeagueName, setNewLeagueName] = useState('')
  const [isJoining, setIsJoining] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [lastSavedMatchId, setLastSavedMatchId] = useState<string | null>(null)

  const [medals, setMedals] = useState<string[]>([])

  async function refreshPointsFromServer() {
    const userPreds = await getUserPredictions()
    let totalPts = 0
    const ptsMap: Record<string, number> = {}
    userPreds.forEach((p: any) => {
      totalPts += p.points_earned || 0
      ptsMap[p.match_id] = typeof p.points_earned === 'number' ? p.points_earned : Number(p.points_earned) || 0
    })
    setPointsByMatchId(ptsMap)
    setBasePoints(totalPts)
  }

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        setUsername(user.user_metadata?.username || user.email?.split('@')[0] || 'JUGADOR')
      }

      const allMatches = await getMatches()
      const mappedMatches = allMatches.map((m: any) => ({
        ...m,
        homeScore: m.home_score,
        awayScore: m.away_score,
        homeTeam: m.homeTeam
          ? { ...m.homeTeam, group: m.homeTeam.group_id }
          : { name: 'Por definir', code: 'tbd', group: 'KO' },
        awayTeam: m.awayTeam
          ? { ...m.awayTeam, group: m.awayTeam.group_id }
          : { name: 'Por definir', code: 'tbd', group: 'KO' },
      }))
      setMatches(mappedMatches)
      const userPreds = await getUserPredictions()

      const predsMap: Record<string, { home: string; away: string }> = {}
      const ptsMap: Record<string, number> = {}
      let totalPts = 0
      userPreds.forEach((p: any) => {
        predsMap[p.match_id] = { home: String(p.home_score), away: String(p.away_score) }
        totalPts += p.points_earned || 0
        ptsMap[p.match_id] = typeof p.points_earned === 'number' ? p.points_earned : Number(p.points_earned) || 0
      })
      setPredictions(predsMap)
      setPointsByMatchId(ptsMap)
      setBasePoints(totalPts)

      try {
        const userBracket = await getUserBracket()
        const officialBracket = await getOfficialBracket()
        if (userBracket && officialBracket) {
          let pts = 0
          const userWinners = userBracket.match_winners || {}
          const adminWinners = officialBracket.match_winners || {}
          for (const [matchId, winningTeam] of Object.entries(userWinners)) {
            if (adminWinners[matchId] === winningTeam) {
              const idNum = parseInt(matchId.replace('m', ''))
              if (idNum >= 73 && idNum <= 88) pts += 10
              else if (idNum >= 89 && idNum <= 96) pts += 20
              else if (idNum >= 97 && idNum <= 100) pts += 30
              else if (idNum >= 101 && idNum <= 102) pts += 40
              else if (idNum === 104) pts += 50
            }
          }
          setBracketPoints(pts)
        }
      } catch {
        /* bracket opcional */
      }

      const myLeagues = await getUserLeagues()
      setLeagues(myLeagues)
      if (myLeagues.length > 0) {
        setActiveLeagueId(myLeagues[0].id)
        const lb = await getLeagueLeaderboard(myLeagues[0].id)
        setLeagueLeaderboard(lb)
      }

      const myMedals = await getUserMedals()
      setMedals(myMedals.map((m: any) => m.medal_id))

      setLoading(false)
    }
    loadData()
  }, [])

  const pendingMatches = useMemo(() => matches.filter((m) => m.status === 'pending'), [matches])

  const finishedMatches = useMemo(
    () =>
      [...matches.filter((m) => m.status === 'finished')].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      ),
    [matches],
  )

  const finishedResultsSummary = useMemo(() => {
    let playedWithPred = 0
    let ptsFromFinished = 0
    for (const m of finishedMatches) {
      const p = predictions[m.id]
      if (!p || p.home === '' || p.away === '') continue
      playedWithPred++
      ptsFromFinished += pointsByMatchId[m.id] ?? 0
    }
    return { playedWithPred, ptsFromFinished }
  }, [finishedMatches, predictions, pointsByMatchId])

  const filledPendingCount = useMemo(
    () =>
      pendingMatches.filter((m) => {
        const p = predictions[m.id]
        return p && p.home !== '' && p.away !== ''
      }).length,
    [pendingMatches, predictions],
  )

  const handlePredictionChange = (matchId: string, team: 'home' | 'away', value: string) => {
    setPredictions((prev) => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        [team]: value,
      },
    }))
  }

  const savePrediction = async (matchId: string) => {
    const pred = predictions[matchId]
    if (pred && pred.home !== '' && pred.away !== '') {
      setIsSaving(matchId)
      try {
        const result = await savePredictionAction(matchId, parseInt(pred.home, 10), parseInt(pred.away, 10))
        if (result?.error) {
          alert(result.error)
        } else {
          await refreshPointsFromServer()
          setLastSavedMatchId(matchId)
          window.setTimeout(() => setLastSavedMatchId((id) => (id === matchId ? null : id)), 2800)
        }
      } catch (err: any) {
        console.error(err)
        alert('Ocurrió un error inesperado al guardar la predicción.')
      } finally {
        setIsSaving(null)
      }
    }
  }

  const saveAllFilledPredictions = async () => {
    const rows = pendingMatches
      .map((m) => {
        const p = predictions[m.id]
        if (!p || p.home === '' || p.away === '') return null
        const h = parseInt(p.home, 10)
        const a = parseInt(p.away, 10)
        if (Number.isNaN(h) || Number.isNaN(a)) return null
        return { matchId: m.id, homeScore: h, awayScore: a }
      })
      .filter(Boolean) as { matchId: string; homeScore: number; awayScore: number }[]

    if (rows.length === 0) {
      alert('Completá al menos un partido pendiente con goles local y visitante.')
      return
    }

    setIsSavingBulk(true)
    try {
      const res = await savePredictionsBulk(rows)
      await refreshPointsFromServer()
      if (res.errors.length > 0) {
        alert(
          `Guardados: ${res.saved}. ${res.skipped ? `Omitidos (datos incompletos): ${res.skipped}. ` : ''}Errores:\n${res.errors.slice(0, 8).join('\n')}${res.errors.length > 8 ? '\n…' : ''}`,
        )
      } else {
        alert(`Listo: se guardaron ${res.saved} pronóstico${res.saved === 1 ? '' : 's'}.`)
      }
    } catch (e) {
      console.error(e)
      alert('No se pudo guardar el lote. Probá de nuevo.')
    } finally {
      setIsSavingBulk(false)
    }
  }

  const handleJoinLeague = async () => {
    if (!joinCode.trim()) return
    setIsJoining(true)
    try {
      const { leagueId } = await joinLeague(joinCode)
      const myLeagues = await getUserLeagues()
      setLeagues(myLeagues)
      setJoinCode('')
      setActiveLeagueId(leagueId)
      const lb = await getLeagueLeaderboard(leagueId)
      setLeagueLeaderboard(lb)
      alert('Te has unido a la liga exitosamente')
    } catch (err: any) {
      alert(err?.message ?? 'No se pudo unir a la liga')
    } finally {
      setIsJoining(false)
    }
  }

  const handleCreateLeague = async () => {
    if (!newLeagueName.trim()) return
    setIsCreating(true)
    try {
      const created = await createLeague(newLeagueName.trim())
      const myLeagues = await getUserLeagues()
      setLeagues(myLeagues)
      setNewLeagueName('')
      const id = (created as { id?: string })?.id
      if (id) {
        setActiveLeagueId(id)
        const lb = await getLeagueLeaderboard(id)
        setLeagueLeaderboard(lb)
      }
      alert('Liga creada exitosamente')
    } catch (err: any) {
      alert(err?.message ?? 'No se pudo crear la liga')
    } finally {
      setIsCreating(false)
    }
  }

  const loadLeaderboard = async (leagueId: string) => {
    setActiveLeagueId(leagueId)
    const lb = await getLeagueLeaderboard(leagueId)
    setLeagueLeaderboard(lb)
  }

  const activeLeague = leagues.find((l) => l.id === activeLeagueId)
  const myRank = activeLeagueId
    ? leagueLeaderboard.findIndex((m) => m.username === username || m.username === username.toLowerCase()) + 1
    : 0

  const tabBtn = (active: boolean) =>
    cn(
      'flex items-center gap-2 border-2 px-5 py-3 text-sm font-black uppercase tracking-wide transition-all sm:px-6 [font-family:var(--font-store-display),sans-serif]',
      active
        ? 'border-[#111] bg-[#111] text-[#ccff00] shadow-[4px_4px_0_#666]'
        : 'border-[#111] bg-white text-[#111] shadow-[2px_2px_0_#ccc] hover:-translate-x-px hover:-translate-y-px hover:shadow-[4px_4px_0_#111]',
    )

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center font-[family-name:var(--font-store-sans)]">
        <Loader2 className="h-10 w-10 animate-spin text-[#111]" aria-hidden />
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] w-full max-w-[100vw] overflow-x-hidden px-4 py-8 pb-28 md:px-8 md:py-10 md:pb-24">
      <div className="relative z-10 mx-auto max-w-6xl font-[family-name:var(--font-store-sans)]">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 flex min-w-0 flex-col gap-6 border-b-2 border-[#111] pb-8 md:flex-row md:items-center md:justify-between"
        >
          <div className="flex min-w-0 items-start gap-4 sm:items-center sm:gap-6">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border-[3px] border-[#111] bg-[#ccff00] text-xl font-black uppercase text-[#111] shadow-[4px_4px_0_#111] sm:h-20 sm:w-20 sm:text-2xl [font-family:var(--font-store-display),sans-serif]">
              {username.substring(0, 2)}
            </div>
            <div className="min-w-0 flex-1 pt-1">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#5d3fd3]">Mi prode</p>
              <h1 className="break-words text-2xl font-black uppercase leading-tight tracking-tight text-[#111] [text-wrap:balance] sm:text-4xl md:text-5xl [font-family:var(--font-store-display),sans-serif]">
                Hola, {username}
              </h1>
              <p className="mt-2 max-w-xl text-sm font-medium text-[#444]">
                Pronosticá los partidos pendientes; podés guardar de a uno o todos los completos de una vez.
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-4 rounded-xl border-[3px] border-[#111] bg-white px-6 py-4 shadow-[6px_6px_0_#111] sm:px-8">
            <Trophy className="h-8 w-8 shrink-0 text-[#EB671B]" aria-hidden />
            <div className="min-w-0">
              <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-[#666] sm:text-xs">
                Mis puntos
              </div>
              <div className="text-3xl font-black tabular-nums text-[#111] [font-family:var(--font-store-display),sans-serif]">
                {basePoints + bracketPoints}
              </div>
              {bracketPoints > 0 && (
                <div className="mt-1 text-[10px] font-bold text-[#5d3fd3]">+{bracketPoints} pts por llaves</div>
              )}
            </div>
          </div>
        </motion.div>

        <div className="mb-8 flex flex-wrap gap-3 sm:gap-4" role="tablist" aria-label="Secciones del panel">
          <button type="button" role="tab" aria-selected={activeTab === 'matches'} onClick={() => setActiveTab('matches')} className={tabBtn(activeTab === 'matches')}>
            <Sparkles className="h-5 w-5 shrink-0" /> Mis pronósticos
          </button>
          <button type="button" role="tab" aria-selected={activeTab === 'results'} onClick={() => setActiveTab('results')} className={tabBtn(activeTab === 'results')}>
            <ClipboardCheck className="h-5 w-5 shrink-0" /> Tus resultados
          </button>
          <button type="button" role="tab" aria-selected={activeTab === 'leagues'} onClick={() => setActiveTab('leagues')} className={tabBtn(activeTab === 'leagues')}>
            <Users className="h-5 w-5 shrink-0" /> Ligas
          </button>
          <button type="button" role="tab" aria-selected={activeTab === 'medals'} onClick={() => setActiveTab('medals')} className={tabBtn(activeTab === 'medals')}>
            <Medal className="h-5 w-5 shrink-0" /> Trofeos
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'matches' && (
            <motion.div key="matches" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-8">
              <section className="border-[3px] border-[#111] bg-white p-5 shadow-[8px_8px_0_#111] sm:p-6">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="flex flex-wrap items-center gap-3 text-xl font-black uppercase text-[#111] sm:text-2xl [font-family:var(--font-store-display),sans-serif]">
                      Partidos pendientes
                      <span className="rounded-full border-2 border-[#111] bg-[#ccff00] px-3 py-1 text-sm tabular-nums text-[#111]">
                        {pendingMatches.length}
                      </span>
                    </h2>
                    <p className="mt-1 text-sm text-[#555]">
                      Completados con marcador:{' '}
                      <strong className="text-[#111]">
                        {filledPendingCount}/{pendingMatches.length}
                      </strong>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={saveAllFilledPredictions}
                    disabled={isSavingBulk || filledPendingCount === 0}
                    className="btn-primary hover-lift inline-flex items-center justify-center gap-2 px-6 py-3 text-center disabled:cursor-not-allowed disabled:opacity-45 [font-family:var(--font-store-display),sans-serif]"
                  >
                    {isSavingBulk ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    {isSavingBulk ? 'Guardando lote…' : `Guardar todos (${filledPendingCount})`}
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {pendingMatches.map((match) => (
                    <div
                      key={match.id}
                      className="relative overflow-hidden rounded-xl border-2 border-[#eee] bg-[#fafafa] p-5 shadow-[3px_3px_0_#ccc] transition-all hover:border-[#111] hover:shadow-[5px_5px_0_#111]"
                    >
                      <div className="mb-4 flex items-center justify-between gap-2">
                        <span className="rounded border border-[#111] bg-[#111] px-2 py-1 text-[10px] font-black uppercase tracking-widest text-[#ccff00]">
                          {match.stage}
                        </span>
                        <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-[#666]">
                          <MapPin className="h-3 w-3 shrink-0 text-[#EB671B]" aria-hidden />
                          <span className="truncate">{match.venue}</span>
                        </div>
                      </div>

                      <div className="mb-3 flex items-center justify-between gap-3 rounded-lg border-2 border-[#ddd] bg-white p-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="relative flex h-7 w-10 shrink-0 items-center justify-center overflow-hidden rounded border-2 border-[#111] bg-white">
                            {match.homeTeam.code === 'tbd' ? (
                              <span className="text-xs font-black text-[#999]">?</span>
                            ) : (
                              <Image unoptimized src={`https://flagcdn.com/${match.homeTeam.code}.svg`} alt={match.homeTeam.name} fill className="object-cover" />
                            )}
                          </div>
                          <span className="truncate text-sm font-bold text-[#111]">{match.homeTeam.name}</span>
                        </div>
                        <input
                          type="number"
                          min={0}
                          placeholder="—"
                          className="store-field w-16 py-2 text-center font-mono text-lg font-black"
                          value={predictions[match.id]?.home ?? ''}
                          onChange={(e) => handlePredictionChange(match.id, 'home', e.target.value)}
                        />
                      </div>

                      <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border-2 border-[#ddd] bg-white p-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="relative flex h-7 w-10 shrink-0 items-center justify-center overflow-hidden rounded border-2 border-[#111] bg-white">
                            {match.awayTeam.code === 'tbd' ? (
                              <span className="text-xs font-black text-[#999]">?</span>
                            ) : (
                              <Image unoptimized src={`https://flagcdn.com/${match.awayTeam.code}.svg`} alt={match.awayTeam.name} fill className="object-cover" />
                            )}
                          </div>
                          <span className="truncate text-sm font-bold text-[#111]">{match.awayTeam.name}</span>
                        </div>
                        <input
                          type="number"
                          min={0}
                          placeholder="—"
                          className="store-field w-16 py-2 text-center font-mono text-lg font-black"
                          value={predictions[match.id]?.away ?? ''}
                          onChange={(e) => handlePredictionChange(match.id, 'away', e.target.value)}
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => savePrediction(match.id)}
                        disabled={!predictions[match.id]?.home || !predictions[match.id]?.away || isSaving === match.id}
                        className="btn-secondary hover-lift flex w-full items-center justify-center gap-2 py-3 text-center disabled:cursor-not-allowed disabled:opacity-40 [font-family:var(--font-store-display),sans-serif]"
                      >
                        {isSaving === match.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        {isSaving === match.id ? 'Guardando…' : lastSavedMatchId === match.id ? 'Guardado ✓' : 'Guardar este partido'}
                      </button>
                    </div>
                  ))}
                </div>

                {pendingMatches.length === 0 && (
                  <p className="py-12 text-center font-semibold text-[#555]">No hay partidos pendientes por ahora.</p>
                )}
              </section>
            </motion.div>
          )}

          {activeTab === 'results' && (
            <motion.div key="results" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-8">
              <section className="border-[3px] border-[#111] bg-white p-5 shadow-[8px_8px_0_#111] sm:p-6">
                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h2 className="flex flex-wrap items-center gap-3 text-xl font-black uppercase text-[#111] sm:text-2xl [font-family:var(--font-store-display),sans-serif]">
                      Partidos jugados
                      <span className="rounded-full border-2 border-[#111] bg-[#ccff00] px-3 py-1 text-sm tabular-nums text-[#111]">
                        {finishedMatches.length}
                      </span>
                    </h2>
                    <p className="mt-1 text-sm text-[#555]">
                      Con pronóstico:{' '}
                      <strong className="text-[#111]">{finishedResultsSummary.playedWithPred}</strong>
                      {finishedResultsSummary.playedWithPred > 0 && (
                        <>
                          {' '}
                          · Puntos en estos partidos:{' '}
                          <strong className="tabular-nums text-[#EB671B]">{finishedResultsSummary.ptsFromFinished}</strong>
                        </>
                      )}
                    </p>
                  </div>
                  <p className="max-w-md text-xs font-semibold uppercase tracking-wide text-[#666]">
                    3 pts marcador exacto · 1 pt acertar ganador o empate
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {finishedMatches.map((match) => {
                    const pred = predictions[match.id]
                    const hasPred = pred && pred.home !== '' && pred.away !== ''
                    const ph = hasPred ? parseInt(pred.home, 10) : NaN
                    const pa = hasPred ? parseInt(pred.away, 10) : NaN
                    const rh = Number(match.home_score)
                    const ra = Number(match.away_score)
                    const realOk = Number.isFinite(rh) && Number.isFinite(ra)
                    const pts = hasPred ? pointsByMatchId[match.id] ?? 0 : null

                    let verdictLabel = 'Sin pronóstico'
                    let verdictClass = 'border-[#ccc] bg-[#fafafa] text-[#666]'
                    if (hasPred && realOk) {
                      if (pts === 3) {
                        verdictLabel = 'Marcador exacto'
                        verdictClass = 'border-[#111] bg-[#ccff00] text-[#111]'
                      } else if (pts === 1) {
                        verdictLabel = 'Resultado parcial'
                        verdictClass = 'border-[#111] bg-[#dbeafe] text-[#111]'
                      } else {
                        verdictLabel = 'Sin puntos'
                        verdictClass = 'border-[#ddd] bg-[#f5f5f5] text-[#555]'
                      }
                    }

                    return (
                      <div
                        key={match.id}
                        className="relative overflow-hidden rounded-xl border-2 border-[#eee] bg-[#fafafa] p-5 shadow-[3px_3px_0_#ccc]"
                      >
                        <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
                          <span className="rounded border border-[#111] bg-[#111] px-2 py-1 text-[10px] font-black uppercase tracking-widest text-[#ccff00]">
                            {match.stage}
                          </span>
                          <span
                            className={cn(
                              'rounded-full border-2 px-3 py-1 text-[10px] font-black uppercase tracking-wide [font-family:var(--font-store-display),sans-serif]',
                              verdictClass,
                            )}
                          >
                            {verdictLabel}
                            {pts !== null && typeof pts === 'number' ? ` · ${pts} pts` : ''}
                          </span>
                        </div>

                        <div className="mb-4 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-[#666]">
                          <MapPin className="h-3 w-3 shrink-0 text-[#EB671B]" aria-hidden />
                          <span className="truncate">{match.venue}</span>
                          {match.date && (
                            <span className="ml-auto shrink-0 tabular-nums text-[#999]">
                              {new Date(match.date).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}
                            </span>
                          )}
                        </div>

                        <div className="space-y-3 rounded-lg border-2 border-[#ddd] bg-white p-3">
                          <div className="flex items-center justify-between gap-2 border-b border-[#eee] pb-2">
                            <div className="flex min-w-0 flex-1 items-center gap-2">
                              <div className="relative flex h-6 w-9 shrink-0 items-center justify-center overflow-hidden rounded border-2 border-[#111] bg-white">
                                {match.homeTeam.code === 'tbd' ? (
                                  <span className="text-[10px] font-black text-[#999]">?</span>
                                ) : (
                                  <Image unoptimized src={`https://flagcdn.com/${match.homeTeam.code}.svg`} alt={match.homeTeam.name} fill className="object-cover" />
                                )}
                              </div>
                              <span className="truncate text-xs font-bold text-[#111]">{match.homeTeam.name}</span>
                            </div>
                            <div className="flex shrink-0 items-center gap-3 font-mono text-sm font-black tabular-nums">
                              {hasPred && !Number.isNaN(ph) ? (
                                <span className="text-[#5d3fd3]" title="Tu pronóstico">
                                  {ph}
                                </span>
                              ) : (
                                <span className="text-[#bbb]">—</span>
                              )}
                              <span className="text-[#ccc]">|</span>
                              <span className="text-[#111]" title="Marcador final">
                                {realOk ? rh : '—'}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex min-w-0 flex-1 items-center gap-2">
                              <div className="relative flex h-6 w-9 shrink-0 items-center justify-center overflow-hidden rounded border-2 border-[#111] bg-white">
                                {match.awayTeam.code === 'tbd' ? (
                                  <span className="text-[10px] font-black text-[#999]">?</span>
                                ) : (
                                  <Image unoptimized src={`https://flagcdn.com/${match.awayTeam.code}.svg`} alt={match.awayTeam.name} fill className="object-cover" />
                                )}
                              </div>
                              <span className="truncate text-xs font-bold text-[#111]">{match.awayTeam.name}</span>
                            </div>
                            <div className="flex shrink-0 items-center gap-3 font-mono text-sm font-black tabular-nums">
                              {hasPred && !Number.isNaN(pa) ? (
                                <span className="text-[#5d3fd3]" title="Tu pronóstico">
                                  {pa}
                                </span>
                              ) : (
                                <span className="text-[#bbb]">—</span>
                              )}
                              <span className="text-[#ccc]">|</span>
                              <span className="text-[#111]" title="Marcador final">
                                {realOk ? ra : '—'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <p className="mt-3 text-[10px] font-bold uppercase tracking-wider text-[#888]">
                          Violeta = tu pronóstico · Negro = resultado final
                        </p>
                      </div>
                    )
                  })}
                </div>

                {finishedMatches.length === 0 && (
                  <p className="py-12 text-center font-semibold text-[#555]">Todavía no hay partidos finalizados.</p>
                )}
              </section>
            </motion.div>
          )}

          {activeTab === 'leagues' && (
            <motion.div key="leagues" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="min-h-[240px] space-y-8">
              <p className="text-sm font-medium text-[#444]">
                Creá una liga, compartí el código o unite con el que te pasaron. El ranking usa los mismos puntos que en Plot Mundial.
              </p>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="border-[3px] border-[#111] bg-white p-8 shadow-[8px_8px_0_#111]">
                  <Users className="mb-4 h-10 w-10 text-[#5d3fd3]" />
                  <h3 className="mb-2 text-2xl font-black uppercase text-[#111] [font-family:var(--font-store-display),sans-serif]">Unirse a liga</h3>
                  <p className="mb-6 text-sm text-[#555]">Ingresá el código que te compartieron.</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Ej: PLOT-1234"
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                      className="store-field min-w-0 flex-1 font-mono uppercase"
                    />
                    <button
                      type="button"
                      onClick={handleJoinLeague}
                      disabled={!joinCode.trim() || isJoining}
                      className="btn-primary shrink-0 px-4 disabled:opacity-50"
                      aria-label="Unirse"
                    >
                      {isJoining ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div className="border-[3px] border-[#111] bg-white p-8 shadow-[8px_8px_0_#111]">
                  <Trophy className="mb-4 h-10 w-10 text-[#EB671B]" />
                  <h3 className="mb-2 text-2xl font-black uppercase text-[#111] [font-family:var(--font-store-display),sans-serif]">Nueva liga</h3>
                  <p className="mb-6 text-sm text-[#555]">Sos admin y obtenés el código para invitar.</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Nombre de la liga"
                      value={newLeagueName}
                      onChange={(e) => setNewLeagueName(e.target.value)}
                      className="store-field min-w-0 flex-1"
                    />
                    <button
                      type="button"
                      onClick={handleCreateLeague}
                      disabled={!newLeagueName.trim() || isCreating}
                      className="btn-secondary shrink-0 px-4 disabled:opacity-50"
                      aria-label="Crear liga"
                    >
                      {isCreating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              </div>

              {leagues.length > 0 && (
                <div className="flex gap-3 overflow-x-auto pb-2 [-webkit-overflow-scrolling:touch]">
                  {leagues.map((l) => (
                    <button
                      type="button"
                      key={l.id}
                      onClick={() => loadLeaderboard(l.id)}
                      className={cn(
                        'whitespace-nowrap rounded-full border-2 px-6 py-2 text-sm font-black uppercase transition-all [font-family:var(--font-store-display),sans-serif]',
                        activeLeagueId === l.id
                          ? 'border-[#111] bg-[#ccff00] text-[#111] shadow-[3px_3px_0_#111]'
                          : 'border-[#111] bg-white text-[#111] hover:bg-[#fafafa]',
                      )}
                    >
                      {l.name}
                    </button>
                  ))}
                </div>
              )}

              {activeLeague && (
                <div className="border-[3px] border-[#111] bg-white p-6 shadow-[8px_8px_0_#111] md:p-8">
                  <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                    <div>
                      <h3 className="flex flex-wrap items-center gap-3 text-2xl font-black text-[#111] [font-family:var(--font-store-display),sans-serif]">
                        {activeLeague.name}{' '}
                        <span className="rounded-full border-2 border-[#111] bg-[#ccff00] px-3 py-0.5 text-xs font-black uppercase text-[#111]">
                          Activa
                        </span>
                      </h3>
                      <p className="mt-2 text-sm text-[#555]">
                        Código:{' '}
                        <span className="font-mono font-bold text-[#111]">{activeLeague.invite_code}</span>
                      </p>
                    </div>
                    {myRank > 0 && (
                      <div className="min-w-[120px] rounded-xl border-2 border-[#111] bg-[#fafafa] p-3 text-center shadow-[3px_3px_0_#111]">
                        <div className="text-[10px] font-bold uppercase tracking-widest text-[#666]">Tu posición</div>
                        <div className="text-2xl font-black text-[#EB671B]">#{myRank}</div>
                      </div>
                    )}
                  </div>

                  <div className="overflow-x-auto rounded-xl border-2 border-[#ddd] bg-[#fafafa]">
                    <div className="min-w-[450px]">
                      <div className="grid grid-cols-12 gap-4 border-b-2 border-[#111] bg-white p-4 text-xs font-black uppercase tracking-widest text-[#666]">
                        <div className="col-span-2 text-center">Pos</div>
                        <div className="col-span-7">Jugador</div>
                        <div className="col-span-3 pr-4 text-right">Pts</div>
                      </div>
                      <div className="divide-y-2 divide-[#eee]">
                        {leagueLeaderboard.map((member, idx) => {
                          const isMe = member.username === username || member.username === username.toLowerCase()
                          let row = 'bg-white hover:bg-[#fafafa]'
                          let posClass = 'text-[#999]'
                          let textClass = 'text-[#333]'
                          let ptsClass = 'text-[#555]'

                          if (idx === 0) {
                            row = 'bg-[#fffbeb]'
                            posClass = 'text-[#EB671B]'
                            textClass = 'text-[#111]'
                            ptsClass = 'text-[#111]'
                          } else if (idx === 1) {
                            row = 'bg-[#f5f5f5]'
                            posClass = 'text-[#666]'
                            textClass = 'text-[#111]'
                            ptsClass = 'text-[#444]'
                          } else if (idx === 2) {
                            row = 'bg-[#fff7ed]'
                            posClass = 'text-[#c2410c]'
                            textClass = 'text-[#111]'
                            ptsClass = 'text-[#333]'
                          }

                          if (isMe) {
                            row = 'border-l-4 border-[#5d3fd3] bg-[#f5f3ff]'
                            posClass = 'text-[#5d3fd3]'
                            textClass = 'text-[#111]'
                            ptsClass = 'text-[#5d3fd3]'
                          }

                          return (
                            <div key={member.user_id} className={cn('grid grid-cols-12 items-center gap-4 p-4', row)}>
                              <div className={cn('col-span-2 text-center font-black', posClass)}>#{idx + 1}</div>
                              <div className={cn('col-span-7 flex items-center gap-2 font-bold', textClass)}>
                                {member.avatar_url ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={member.avatar_url} alt="" className="h-6 w-6 rounded-full" />
                                ) : (
                                  <div className="h-6 w-6 rounded-full border border-[#ddd] bg-[#eee]" />
                                )}
                                {member.username} {isMe && '(vos)'}
                              </div>
                              <div className={cn('col-span-3 pr-4 text-right font-mono font-black', ptsClass)}>
                                {member.total_points || 0}
                              </div>
                            </div>
                          )
                        })}
                        {leagueLeaderboard.length === 0 && (
                          <div className="p-8 text-center font-medium text-[#666]">Esta liga aún no tiene datos.</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'medals' && (
            <motion.div key="medals" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-8">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div
                  className={cn(
                    'flex flex-col items-center border-[3px] border-[#111] bg-white p-6 text-center shadow-[8px_8px_0_#111]',
                    medals.includes('nostradamus') ? '' : 'opacity-80 grayscale',
                  )}
                >
                  <div
                    className={cn(
                      'mb-4 flex h-24 w-24 items-center justify-center rounded-full border-4 border-[#111]',
                      medals.includes('nostradamus') ? 'bg-gradient-to-br from-purple-400 to-indigo-600 text-white' : 'bg-[#eee] text-[#999]',
                    )}
                  >
                    <Star className="h-10 w-10" />
                  </div>
                  <h3 className={cn('mb-2 text-xl font-black [font-family:var(--font-store-display),sans-serif]', medals.includes('nostradamus') ? 'text-[#5d3fd3]' : 'text-[#999]')}>
                    Nostradamus
                  </h3>
                  <p className="text-sm text-[#555]">Resultado exacto en un partido difícil.</p>
                  <div className={cn('mt-4 rounded-full border-2 px-4 py-1.5 text-xs font-black uppercase', medals.includes('nostradamus') ? 'border-[#111] bg-[#ccff00]' : 'border-[#ccc] bg-[#fafafa] text-[#666]')}>
                    {medals.includes('nostradamus') ? 'Desbloqueada' : 'Bloqueada'}
                  </div>
                </div>

                <div
                  className={cn(
                    'flex flex-col items-center border-[3px] border-[#111] bg-white p-6 text-center shadow-[8px_8px_0_#111]',
                    medals.includes('madrugador') ? '' : 'opacity-80 grayscale',
                  )}
                >
                  <div
                    className={cn(
                      'mb-4 flex h-24 w-24 items-center justify-center rounded-full border-4 border-[#111]',
                      medals.includes('madrugador') ? 'bg-gradient-to-br from-blue-400 to-cyan-600 text-white' : 'bg-[#eee] text-[#999]',
                    )}
                  >
                    <Zap className="h-10 w-10" />
                  </div>
                  <h3 className={cn('mb-2 text-xl font-black [font-family:var(--font-store-display),sans-serif]', medals.includes('madrugador') ? 'text-[#2563eb]' : 'text-[#999]')}>
                    Madrugador
                  </h3>
                  <p className="text-sm text-[#555]">Todos los partidos de grupos a tiempo.</p>
                  <div className={cn('mt-4 rounded-full border-2 px-4 py-1.5 text-xs font-black uppercase', medals.includes('madrugador') ? 'border-[#111] bg-[#ccff00]' : 'border-[#ccc] bg-[#fafafa] text-[#666]')}>
                    {medals.includes('madrugador') ? 'Desbloqueada' : 'Bloqueada'}
                  </div>
                </div>

                <div
                  className={cn(
                    'flex flex-col items-center border-[3px] border-[#111] bg-white p-6 text-center shadow-[8px_8px_0_#111]',
                    medals.includes('cazagigantes') ? '' : 'opacity-80 grayscale',
                  )}
                >
                  <div
                    className={cn(
                      'mb-4 flex h-24 w-24 items-center justify-center rounded-full border-4 border-[#111]',
                      medals.includes('cazagigantes') ? 'bg-gradient-to-br from-green-400 to-emerald-600 text-white' : 'bg-[#eee] text-[#999]',
                    )}
                  >
                    <Target className="h-10 w-10" />
                  </div>
                  <h3 className={cn('mb-2 text-xl font-black [font-family:var(--font-store-display),sans-serif]', medals.includes('cazagigantes') ? 'text-[#15803d]' : 'text-[#999]')}>
                    Cazagigantes
                  </h3>
                  <p className="text-sm text-[#555]">Victoria del débil contra favorito.</p>
                  <div className={cn('mt-4 rounded-full border-2 px-4 py-1.5 text-xs font-black uppercase', medals.includes('cazagigantes') ? 'border-[#111] bg-[#ccff00]' : 'border-[#ccc] bg-[#fafafa] text-[#666]')}>
                    {medals.includes('cazagigantes') ? 'Desbloqueada' : 'Bloqueada'}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
