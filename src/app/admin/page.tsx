'use client'

import { useState, useEffect } from 'react'
import { Settings, Save, ShieldAlert, Users, Trophy, Download, Eye, Loader2, Store, RotateCcw, X, BarChart3 } from 'lucide-react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { STORE_PRINTS_BUCKET } from '@/lib/storePrints'
import {
  getMatches,
  getAdminProfiles,
  getAdminUserDetail,
  type AdminUserDetail,
  type AdminProfileListItem,
  getAdminStoreDashboard,
  updatePrintOrderAdmin,
  updateMatchScore,
  resetMatchResult,
  adminSyncRankingTotalsFromPredictions,
  type AdminStoreDashboard,
  type PrintOrderStatus,
} from '@/lib/actions'
import { AdminUserFichaModal } from '@/components/admin/AdminUserFichaModal'
import { AdminStoreOrdersPanel } from '@/components/admin/AdminStoreOrdersPanel'
import { AdminAnalyticsPanel } from '@/components/admin/AdminAnalyticsPanel'
import { getAdminAnalyticsStats, type AdminAnalyticsStats } from '@/lib/actions/analytics'
import './admin-store.css'

function formatAdminDate(iso: string | null | undefined) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })
  } catch {
    return iso
  }
}

export default function AdminPage() {
  const [matches, setMatches] = useState<any[]>([])
  const [users, setUsers] = useState<AdminProfileListItem[]>([])
  const [userFicha, setUserFicha] = useState<AdminUserDetail | null>(null)
  const [userFichaLoading, setUserFichaLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState<string | null>(null)
  const [resettingId, setResettingId] = useState<string | null>(null)
  const [syncRankingBusy, setSyncRankingBusy] = useState(false)
  const [results, setResults] = useState<Record<string, { home: string, away: string }>>({})
  const [activeTab, setActiveTab] = useState<'results' | 'users' | 'podium' | 'print-orders' | 'analytics'>('results')

  const [storeDashboard, setStoreDashboard] = useState<AdminStoreDashboard | null>(null)
  const [printOrdersLoading, setPrintOrdersLoading] = useState(false)
  const [analyticsStats, setAnalyticsStats] = useState<AdminAnalyticsStats | null>(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(false)
  const [analyticsError, setAnalyticsError] = useState<string | null>(null)
  const [printSavingId, setPrintSavingId] = useState<string | null>(null)
  const [adminNotesDraft, setAdminNotesDraft] = useState<Record<string, string>>({})

  useEffect(() => {
    async function loadData() {
      const fetchedMatches = await getMatches()
      const fetchedUsers = await getAdminProfiles()
      
      const mappedMatches = (fetchedMatches || []).map((m: any) => ({
        ...m,
        homeScore: m.home_score,
        awayScore: m.away_score,
        homeTeam: m.homeTeam ? { ...m.homeTeam, group: m.homeTeam.group_id } : { name: 'Por definir', code: 'tbd', group: 'KO' },
        awayTeam: m.awayTeam ? { ...m.awayTeam, group: m.awayTeam.group_id } : { name: 'Por definir', code: 'tbd', group: 'KO' },
      }))

      setMatches(mappedMatches)
      setUsers(fetchedUsers || [])
      setLoading(false)
    }
    loadData()
  }, [])

  useEffect(() => {
    if (activeTab !== 'print-orders') return
    let cancelled = false
    async function loadPrint() {
      setPrintOrdersLoading(true)
      try {
        const dash = await getAdminStoreDashboard()
        if (cancelled) return
        setStoreDashboard(dash)
        setAdminNotesDraft((prev) => {
          const next = { ...prev }
          for (const o of dash.orders) {
            if (next[o.id] === undefined) next[o.id] = o.admin_notes ?? ''
          }
          return next
        })
      } catch (e: any) {
        if (!cancelled) alert(e?.message || 'Error al cargar pedidos del Store')
      } finally {
        if (!cancelled) setPrintOrdersLoading(false)
      }
    }
    loadPrint()
    return () => {
      cancelled = true
    }
  }, [activeTab])

  useEffect(() => {
    if (activeTab !== 'analytics') return
    let cancelled = false
    async function loadAnalytics() {
      setAnalyticsLoading(true)
      setAnalyticsError(null)
      try {
        const stats = await getAdminAnalyticsStats()
        if (!cancelled) setAnalyticsStats(stats)
      } catch (e: unknown) {
        if (!cancelled) {
          setAnalyticsError(e instanceof Error ? e.message : 'Error al cargar analytics')
          setAnalyticsStats(null)
        }
      } finally {
        if (!cancelled) setAnalyticsLoading(false)
      }
    }
    loadAnalytics()
    return () => {
      cancelled = true
    }
  }, [activeTab])

  const handlePrintStatusChange = async (orderId: string, status: PrintOrderStatus) => {
    setPrintSavingId(orderId)
    try {
      await updatePrintOrderAdmin(orderId, { status })
      setStoreDashboard((prev) =>
        prev ? { ...prev, orders: prev.orders.map((o) => (o.id === orderId ? { ...o, status } : o)) } : prev,
      )
    } catch (e: any) {
      alert(e?.message || 'No se pudo actualizar el estado')
    } finally {
      setPrintSavingId(null)
    }
  }

  const handleSavePrintAdminNotes = async (orderId: string) => {
    setPrintSavingId(orderId)
    try {
      const notes = adminNotesDraft[orderId] ?? ''
      await updatePrintOrderAdmin(orderId, { admin_notes: notes.trim() || null })
      setStoreDashboard((prev) =>
        prev
          ? {
              ...prev,
              orders: prev.orders.map((o) =>
                o.id === orderId ? { ...o, admin_notes: notes.trim() || null } : o,
              ),
            }
          : prev,
      )
    } catch (e: any) {
      alert(e?.message || 'No se pudieron guardar las notas')
    } finally {
      setPrintSavingId(null)
    }
  }

  const handleAdminStoreFileUpload = async (orderId: string, file: File | null) => {
    if (!file) return
    const max = 10 * 1024 * 1024
    if (file.size > max) {
      alert('El archivo supera 10 MB.')
      return
    }
    setPrintSavingId(orderId)
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('No hay sesión')
      const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
      const path = `admin/${orderId}/${Date.now()}-${safe}`
      const { error: upErr } = await supabase.storage.from(STORE_PRINTS_BUCKET).upload(path, file, {
        contentType: file.type || 'application/octet-stream',
        upsert: true,
      })
      if (upErr) throw new Error(upErr.message)
      const pub = supabase.storage.from(STORE_PRINTS_BUCKET).getPublicUrl(path).data.publicUrl
      await updatePrintOrderAdmin(orderId, { admin_file_url: pub })
      setStoreDashboard((prev) =>
        prev
          ? { ...prev, orders: prev.orders.map((o) => (o.id === orderId ? { ...o, admin_file_url: pub } : o)) }
          : prev,
      )
    } catch (e: any) {
      alert(e?.message || 'No se pudo subir el archivo (¿bucket store-prints y políticas SQL?)')
    } finally {
      setPrintSavingId(null)
    }
  }

  const handleResultChange = (matchId: string, team: 'home' | 'away', value: string) => {
    setResults(prev => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        [team]: value
      }
    }))
  }

  const saveResult = async (matchId: string) => {
    const res = results[matchId]
    if (res && res.home !== '' && res.away !== '') {
      setIsSaving(matchId)
      try {
        await updateMatchScore(matchId, parseInt(res.home), parseInt(res.away))
        setMatches(prev => prev.map(m => 
          m.id === matchId 
            ? { ...m, status: 'finished', homeScore: parseInt(res.home), awayScore: parseInt(res.away) } 
            : m
        ))
        alert('Resultado real guardado y puntos calculados')
      } catch (e: any) {
        alert(e.message || 'Error al guardar el resultado')
      } finally {
        setIsSaving(null)
      }
    }
  }

  const handleResetMatch = async (matchId: string) => {
    const ok = window.confirm(
      '¿Resetear este resultado? El partido volverá a pendiente, se borrará el marcador oficial y se restarán de cada usuario los puntos ganados solo por este partido.',
    )
    if (!ok) return

    setResettingId(matchId)
    try {
      await resetMatchResult(matchId)
      setMatches((prev) =>
        prev.map((m) =>
          m.id === matchId
            ? {
                ...m,
                status: 'pending',
                homeScore: undefined,
                awayScore: undefined,
                home_score: null,
                away_score: null,
              }
            : m,
        ),
      )
      setResults((prev) => {
        const next = { ...prev }
        delete next[matchId]
        return next
      })
      alert('Resultado reseteado. Podés cargar un marcador nuevo cuando quieras.')
    } catch (e: any) {
      alert(e?.message || 'No se pudo resetear el resultado')
    } finally {
      setResettingId(null)
    }
  }

  const handleSyncRankingTotals = async () => {
    if (
      !window.confirm(
        'Se va a recalcular prode (fixture_points) y trivia (trivia_points) por separado. ¿Continuar?',
      )
    )
      return
    setSyncRankingBusy(true)
    try {
      const res = await adminSyncRankingTotalsFromPredictions()
      alert(
        `Ranking sincronizado.\nPerfiles: ${res.profilesUpdated}\nPronósticos: ${res.predictionsCounted}\nRespuestas trivia: ${res.triviaAnswersCounted}\nProde y trivia van por columnas separadas.`,
      )
      const fetchedUsers = await getAdminProfiles()
      setUsers(fetchedUsers || [])
    } catch (e: any) {
      alert(e?.message || 'No se pudo sincronizar el ranking')
    } finally {
      setSyncRankingBusy(false)
    }
  }

  const handleExportCSV = () => {
    alert('Simulación: Descargando podio_ganadores.csv con los correos electrónicos para entrega de premios.')
  }

  const openUserFicha = async (userId: string) => {
    setUserFichaLoading(true)
    setUserFicha(null)
    try {
      const detail = await getAdminUserDetail(userId)
      if (!detail) {
        alert('No se encontró el perfil del usuario.')
        return
      }
      setUserFicha(detail)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Error al cargar la ficha'
      alert(msg)
    } finally {
      setUserFichaLoading(false)
    }
  }

  const closeUserFicha = () => setUserFicha(null)

  return (
    <div className="min-h-screen bg-transparent relative font-outfit p-4 lg:p-8 pt-24 -mt-16 w-full">
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />
      <div className="fixed top-0 left-0 w-full h-[500px] bg-red-900/10 rounded-b-[100%] blur-[100px] -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8 border-b border-white/10 pb-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.2)]">
              <ShieldAlert className="w-8 h-8 text-red-500" />
            </div>
            <div>
              <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70 tracking-widest">ADMIN PANEL</h1>
              <p className="text-red-400/80 font-bold tracking-widest uppercase mt-1 text-xs">Gestión Central y CRM del Torneo</p>
            </div>
          </div>
        </motion.div>

        {/* TABS NAVIGATION */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={() => setActiveTab('results')}
              className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${activeTab === 'results' ? 'bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)] border border-red-500/50' : 'bg-white/5 text-white/50 hover:bg-white/10 border border-white/5'}`}
            >
              <Settings className="w-5 h-5" /> Resultados Oficiales
            </button>
            <button 
              onClick={() => setActiveTab('users')}
              className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${activeTab === 'users' ? 'bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)] border border-red-500/50' : 'bg-white/5 text-white/50 hover:bg-white/10 border border-white/5'}`}
            >
              <Users className="w-5 h-5" /> Usuarios Registrados
            </button>
            <button 
              onClick={() => setActiveTab('podium')}
              className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${activeTab === 'podium' ? 'bg-amber-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.4)] border border-amber-400/50' : 'bg-white/5 text-white/50 hover:bg-white/10 border border-white/5'}`}
            >
              <Trophy className="w-5 h-5" /> Podio y Ganadores
            </button>
            <button 
              onClick={() => setActiveTab('print-orders')}
              className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${activeTab === 'print-orders' ? 'bg-violet-600 text-white shadow-[0_0_20px_rgba(139,92,246,0.35)] border border-violet-400/50' : 'bg-white/5 text-white/50 hover:bg-white/10 border border-white/5'}`}
            >
              <Store className="w-5 h-5" /> Store
            </button>
            <button 
              onClick={() => setActiveTab('analytics')}
              className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${activeTab === 'analytics' ? 'bg-emerald-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.35)] border border-emerald-400/50' : 'bg-white/5 text-white/50 hover:bg-white/10 border border-white/5'}`}
            >
              <BarChart3 className="w-5 h-5" /> Visitas
            </button>
          </div>
          
          <a 
            href="/bracket?mode=admin"
            className="px-6 py-3 rounded-xl font-black flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-[0_0_20px_rgba(147,51,234,0.4)] border border-purple-400/50 hover:scale-105 transition-transform"
          >
            Configurar Llaves Reales 🏆
          </a>
        </div>

        {/* CONTENT AREA */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-red-500 animate-spin" />
          </div>
        ) : (
        <AnimatePresence mode="wait">
          {/* TAB 1: RESULTADOS */}
          {activeTab === 'results' && (
            <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
              <motion.div className="mb-6 flex flex-wrap items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleSyncRankingTotals}
                  disabled={syncRankingBusy}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-bold text-white hover:bg-white/15 disabled:opacity-50"
                >
                    {syncRankingBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trophy className="h-4 w-4 text-amber-400" />}
                    {syncRankingBusy ? 'Sincronizando…' : 'Sincronizar ranking'}
                  </button>
              </motion.div>

              <motion.div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {matches.map(match => (
                  <div key={match.id} className="relative glass-card p-6 rounded-2xl border border-white/10 hover:border-white/20 transition-all group overflow-hidden bg-[#0a0f1c]/80 backdrop-blur-xl">
                    {match.status === 'finished' && <div className="absolute inset-0 bg-green-500/5 pointer-events-none" />}
                    
                    <div className="flex items-center justify-between mb-6">
                      <span className="text-[10px] font-bold px-2 py-1 rounded bg-white/5 text-white/50 uppercase tracking-widest border border-white/10">{match.stage}</span>
                      <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest border ${match.status === 'finished' ? 'bg-green-500/10 text-green-400 border-green-500/30 shadow-[0_0_10px_rgba(34,197,94,0.2)]' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'}`}>
                        {match.status === 'finished' ? 'Finalizado' : 'Pendiente'}
                      </span>
                    </div>
                    
                    {/* Home Team Input */}
                    <div className="flex items-center justify-between mb-4 bg-black/40 p-3 rounded-xl border border-white/5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-6 rounded overflow-hidden relative border border-white/10 bg-white/5 flex items-center justify-center">
                          {match.homeTeam.code === 'tbd' ? <span className="text-white/30 text-[10px] font-bold">?</span> : <Image unoptimized src={`https://flagcdn.com/${match.homeTeam.code}.svg`} alt={match.homeTeam.name} fill className="object-cover" />}
                        </div>
                        <span className="font-bold text-white text-sm">{match.homeTeam.name}</span>
                      </div>
                      <input 
                        type="number" 
                        min="0"
                        placeholder={match.homeScore?.toString() ?? "-"}
                        className="w-14 h-12 bg-[#060913] border border-white/10 rounded-lg text-center font-mono font-bold text-xl text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all"
                        value={results[match.id]?.home ?? match.homeScore ?? ''}
                        onChange={(e) => handleResultChange(match.id, 'home', e.target.value)}
                      />
                    </div>

                    {/* Away Team Input */}
                    <div className="flex items-center justify-between mb-6 bg-black/40 p-3 rounded-xl border border-white/5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-6 rounded overflow-hidden relative border border-white/10 bg-white/5 flex items-center justify-center">
                          {match.awayTeam.code === 'tbd' ? <span className="text-white/30 text-[10px] font-bold">?</span> : <Image unoptimized src={`https://flagcdn.com/${match.awayTeam.code}.svg`} alt={match.awayTeam.name} fill className="object-cover" />}
                        </div>
                        <span className="font-bold text-white text-sm">{match.awayTeam.name}</span>
                      </div>
                      <input 
                        type="number" 
                        min="0"
                        placeholder={match.awayScore?.toString() ?? "-"}
                        className="w-14 h-12 bg-[#060913] border border-white/10 rounded-lg text-center font-mono font-bold text-xl text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all"
                        value={results[match.id]?.away ?? match.awayScore ?? ''}
                        onChange={(e) => handleResultChange(match.id, 'away', e.target.value)}
                      />
                    </div>

                    <button 
                      onClick={() => saveResult(match.id)}
                      disabled={isSaving === match.id || resettingId === match.id || (match.status === 'finished' && (!results[match.id]?.home || !results[match.id]?.away))}
                      className={`w-full font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-sm border 
                        ${match.status === 'finished' 
                          ? 'bg-white/5 hover:bg-white/10 text-white/70 border-white/10' 
                          : 'bg-red-600/80 hover:bg-red-600 text-white border-red-500/50 shadow-[0_0_15px_rgba(220,38,38,0.3)] disabled:opacity-30 disabled:shadow-none'
                        }
                      `}
                    >
                      {isSaving === match.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      {isSaving === match.id ? 'Guardando...' : match.status === 'finished' ? 'Actualizar Resultado' : 'Cargar Resultado Real'}
                    </button>

                    {match.status === 'finished' && (
                      <button
                        type="button"
                        onClick={() => handleResetMatch(match.id)}
                        disabled={isSaving === match.id || resettingId === match.id}
                        className="mt-3 w-full font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-sm border border-amber-500/40 bg-amber-500/10 text-amber-200 hover:bg-amber-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {resettingId === match.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                        {resettingId === match.id ? 'Reseteando…' : 'Resetear resultado'}
                      </button>
                    )}
                  </div>
                ))}
              </motion.div>
            </motion.div>
          )}

          {/* TAB 2: USUARIOS */}
          {activeTab === 'users' && (
            <motion.div key="users" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
              <div className="glass-card rounded-2xl border border-white/10 overflow-hidden bg-[#0a0f1c]/80 backdrop-blur-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-white/5 border-b border-white/10 text-xs uppercase tracking-widest text-white/50">
                      <tr>
                        <th className="px-6 py-4 font-bold">Usuario</th>
                        <th className="px-6 py-4 font-bold">Rol</th>
                        <th className="px-6 py-4 font-bold text-center">Partidos Predichos</th>
                        <th className="px-6 py-4 font-bold text-center">Prode</th>
                        <th className="px-6 py-4 font-bold text-center">Trivia</th>
                        <th className="px-6 py-4 font-bold">Última Actividad</th>
                        <th className="px-6 py-4 font-bold text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {users.map(user => (
                        <tr
                          key={user.id}
                          className="cursor-pointer hover:bg-white/5 transition-colors"
                          onClick={() => openUserFicha(user.id)}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center font-bold text-white shadow-md overflow-hidden">
                                {user.avatar_url ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={user.avatar_url} alt={user.username ?? ''} className="w-full h-full object-cover" />
                                ) : (
                                  user.username?.charAt(0).toUpperCase() || 'U'
                                )}
                              </div>
                              <span className="font-bold text-white">{user.username ?? '—'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide ${
                              user.role === 'admin'
                                ? 'border-red-500/40 bg-red-500/15 text-red-300'
                                : 'border-white/15 bg-white/5 text-white/60'
                            }`}>
                              {user.role === 'admin' ? 'Admin' : 'Usuario'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="bg-white/10 px-3 py-1 rounded-full text-xs font-mono text-white/80 border border-white/10">
                              {user.predictions_count} / {matches.length}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="text-lg font-bold text-amber-400 drop-shadow-[0_0_5px_rgba(245,158,11,0.5)]">
                              {user.fixture_points ?? user.total_points ?? 0}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="text-lg font-bold text-violet-400 drop-shadow-[0_0_5px_rgba(167,139,250,0.5)]">
                              {user.trivia_points ?? 0}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-white/40">{formatAdminDate(user.last_active)}</td>
                          <td className="px-6 py-4 text-right">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                void openUserFicha(user.id)
                              }}
                              className="p-2 rounded-lg bg-white/5 hover:bg-primary/20 text-white/50 hover:text-primary transition-all border border-transparent hover:border-primary/30"
                              title="Ver ficha"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 3: PODIO */}
          {activeTab === 'podium' && (
            <motion.div key="podium" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
              
              <div className="flex items-center justify-between bg-amber-500/5 border border-amber-500/20 rounded-2xl p-6 backdrop-blur-sm shadow-xl">
                <div>
                  <h3 className="text-amber-400 font-bold text-lg mb-1">Estado del Premio</h3>
                  <p className="text-white/60 text-sm">Este panel muestra el ranking actualizado. Puedes descargar la lista completa para contactar a los ganadores por correo electrónico.</p>
                </div>
                <button 
                  onClick={handleExportCSV}
                  className="bg-amber-500 hover:bg-amber-400 text-black font-bold px-6 py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(245,158,11,0.4)] flex items-center gap-2 border border-amber-300"
                >
                  <Download className="w-5 h-5" /> Exportar CSV
                </button>
              </div>

              <div className="flex flex-col md:flex-row items-end justify-center gap-6 pt-10">
                {/* 2nd Place */}
                {users.length > 1 && (
                <div className="w-full md:w-1/3 flex flex-col items-center">
                  <div className="glass-card w-full border border-gray-300/30 bg-gradient-to-b from-gray-300/10 to-transparent p-6 rounded-t-3xl rounded-b-xl flex flex-col items-center relative overflow-hidden shadow-[0_0_30px_rgba(209,213,219,0.1)]">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 flex items-center justify-center font-black text-2xl text-white shadow-lg mb-4 border-4 border-[#0a0f1c] overflow-hidden">
                      {users[1].avatar_url ? <img src={users[1].avatar_url} alt={users[1].username ?? ''} className="w-full h-full object-cover" /> : users[1].username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <h3 className="text-xl font-bold text-white">{users[1].username}</h3>
                    <div className="flex items-center gap-2 text-gray-300 font-black text-3xl mt-2 drop-shadow-md">
                      {users[1].fixture_points ?? users[1].total_points ?? 0} <span className="text-sm text-gray-300/50 uppercase tracking-widest">PTS PRODE</span>
                    </div>
                    <a href="/store" className="mt-6 flex items-center gap-2 text-xs text-white/50 hover:text-white transition-colors bg-white/5 px-4 py-2 rounded-full border border-white/10">
                      Ir al Store
                    </a>
                  </div>
                  <div className="w-full h-16 bg-gray-300/20 border-x border-t border-gray-300/30 rounded-t-xl flex items-center justify-center mt-2">
                    <span className="text-3xl font-black text-gray-300/50">2</span>
                  </div>
                </div>
                )}

                {/* 1st Place */}
                {users.length > 0 && (
                <div className="w-full md:w-1/3 flex flex-col items-center z-10 -mb-4">
                  <div className="glass-card w-full border border-amber-400/50 bg-gradient-to-b from-amber-500/20 to-transparent p-8 rounded-t-3xl rounded-b-xl flex flex-col items-center relative overflow-hidden shadow-[0_0_50px_rgba(245,158,11,0.2)]">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
                    <Trophy className="w-10 h-10 text-amber-400 absolute top-4 right-4 opacity-20" />
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-300 to-amber-600 flex items-center justify-center font-black text-3xl text-white shadow-xl mb-4 border-4 border-[#0a0f1c] ring-4 ring-amber-500/30 overflow-hidden">
                      {users[0].avatar_url ? <img src={users[0].avatar_url} alt={users[0].username ?? ''} className="w-full h-full object-cover" /> : users[0].username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-amber-100">{users[0].username}</h3>
                    <div className="flex items-center gap-2 text-amber-400 font-black text-5xl mt-2 drop-shadow-[0_0_10px_rgba(245,158,11,0.8)]">
                      {users[0].fixture_points ?? users[0].total_points ?? 0} <span className="text-base text-amber-500/50 uppercase tracking-widest">PTS PRODE</span>
                    </div>
                    <a href="/store" className="mt-8 flex items-center gap-2 text-sm text-amber-100 hover:text-white transition-colors bg-amber-500/20 px-5 py-2.5 rounded-full border border-amber-500/30 font-bold">
                      Ir al Store
                    </a>
                  </div>
                  <div className="w-full h-24 bg-gradient-to-t from-amber-500/20 to-amber-500/40 border-x border-t border-amber-500/50 rounded-t-xl flex items-start justify-center pt-4 mt-2 shadow-[0_-10px_20px_rgba(245,158,11,0.15)]">
                    <span className="text-5xl font-black text-amber-400/80 drop-shadow-md">1</span>
                  </div>
                </div>
                )}

                {/* 3rd Place */}
                {users.length > 2 && (
                <div className="w-full md:w-1/3 flex flex-col items-center">
                  <div className="glass-card w-full border border-orange-700/50 bg-gradient-to-b from-orange-800/20 to-transparent p-6 rounded-t-3xl rounded-b-xl flex flex-col items-center relative overflow-hidden shadow-[0_0_30px_rgba(194,65,12,0.1)]">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-600 to-transparent" />
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-orange-800 flex items-center justify-center font-black text-2xl text-white shadow-lg mb-4 border-4 border-[#0a0f1c] overflow-hidden">
                      {users[2].avatar_url ? <img src={users[2].avatar_url} alt={users[2].username ?? ''} className="w-full h-full object-cover" /> : users[2].username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <h3 className="text-xl font-bold text-white">{users[2].username}</h3>
                    <div className="flex items-center gap-2 text-orange-500 font-black text-3xl mt-2 drop-shadow-md">
                      {users[2].fixture_points ?? users[2].total_points ?? 0} <span className="text-sm text-orange-500/50 uppercase tracking-widest">PTS PRODE</span>
                    </div>
                    <a href="/store" className="mt-6 flex items-center gap-2 text-xs text-white/50 hover:text-white transition-colors bg-white/5 px-4 py-2 rounded-full border border-white/10">
                      Ir al Store
                    </a>
                  </div>
                  <div className="w-full h-12 bg-orange-900/40 border-x border-t border-orange-700/50 rounded-t-xl flex items-center justify-center mt-2">
                    <span className="text-2xl font-black text-orange-500/50">3</span>
                  </div>
                </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'print-orders' && (
            <motion.div
              key="print-orders"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <AdminStoreOrdersPanel
                loading={printOrdersLoading}
                data={storeDashboard}
                printSavingId={printSavingId}
                adminNotesDraft={adminNotesDraft}
                onNotesDraftChange={(id, value) =>
                  setAdminNotesDraft((prev) => ({ ...prev, [id]: value }))
                }
                onStatusChange={handlePrintStatusChange}
                onSaveAdminNotes={handleSavePrintAdminNotes}
                onAdminFileUpload={handleAdminStoreFileUpload}
              />
            </motion.div>
          )}

          {activeTab === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <AdminAnalyticsPanel
                loading={analyticsLoading}
                stats={analyticsStats}
                error={analyticsError}
              />
            </motion.div>
          )}
        </AnimatePresence>
        )}
      </div>

      <AdminUserFichaModal
        open={userFichaLoading || !!userFicha}
        loading={userFichaLoading && !userFicha}
        detail={userFicha}
        totalMatches={matches.length}
        onClose={closeUserFicha}
      />
     </div>
  )
}