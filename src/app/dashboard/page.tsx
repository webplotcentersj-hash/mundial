'use client'

import { useState, useEffect } from 'react'
import { Trophy, Save, MapPin, GitBranch, Users, Medal, Search, Plus, Sparkles, Flame, Star, Target, Loader2, Zap } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { getMatches, getUserPredictions, savePrediction as savePredictionAction, getUserBracket, getOfficialBracket, getUserLeagues, getLeagueLeaderboard, createLeague, joinLeague, getUserMedals } from '@/lib/actions'
import { createClient } from '@/lib/supabase/client'

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'matches' | 'leagues' | 'medals'>('matches')
  const [predictions, setPredictions] = useState<Record<string, { home: string, away: string }>>({})
  const [matches, setMatches] = useState<any[]>([])
  const [bracketPoints, setBracketPoints] = useState(0)
  const [basePoints, setBasePoints] = useState(0)
  const [isSaving, setIsSaving] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState('JUGADOR')
  
  // Ligas
  const [leagues, setLeagues] = useState<any[]>([])
  const [activeLeagueId, setActiveLeagueId] = useState<string | null>(null)
  const [leagueLeaderboard, setLeagueLeaderboard] = useState<any[]>([])
  const [joinCode, setJoinCode] = useState('')
  const [newLeagueName, setNewLeagueName] = useState('')
  const [isJoining, setIsJoining] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  
  // Medallas
  const [medals, setMedals] = useState<string[]>([])

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUsername(user.user_metadata?.username || user.email?.split('@')[0] || 'JUGADOR')
      }

      const allMatches = await getMatches()
      const mappedMatches = allMatches.map((m: any) => ({
        ...m,
        homeScore: m.home_score,
        awayScore: m.away_score,
        homeTeam: m.homeTeam ? { ...m.homeTeam, group: m.homeTeam.group_id } : { name: 'Por definir', code: 'tbd', group: 'KO' },
        awayTeam: m.awayTeam ? { ...m.awayTeam, group: m.awayTeam.group_id } : { name: 'Por definir', code: 'tbd', group: 'KO' },
      }))
      setMatches(mappedMatches)
      const userPreds = await getUserPredictions()
      
      const predsMap: Record<string, { home: string, away: string }> = {}
      let totalPts = 0
      userPreds.forEach((p: any) => {
        predsMap[p.match_id] = { home: String(p.home_score), away: String(p.away_score) }
        totalPts += (p.points_earned || 0)
      })
      setPredictions(predsMap)
      setBasePoints(totalPts)

      // Cargar Puntos de Bracket
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
      } catch(e) {}

      // Ligas
      const myLeagues = await getUserLeagues()
      setLeagues(myLeagues)
      if (myLeagues.length > 0) {
        setActiveLeagueId(myLeagues[0].id)
        const lb = await getLeagueLeaderboard(myLeagues[0].id)
        setLeagueLeaderboard(lb)
      }

      // Medallas
      const myMedals = await getUserMedals()
      setMedals(myMedals.map((m: any) => m.medal_id))

      setLoading(false)
    }
    loadData()
  }, [])

  const pendingMatches = matches.filter(m => m.status === 'pending').slice(0, 8)

  const handlePredictionChange = (matchId: string, team: 'home' | 'away', value: string) => {
    setPredictions(prev => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        [team]: value
      }
    }))
  }

  const savePrediction = async (matchId: string) => {
    const pred = predictions[matchId]
    if (pred && pred.home !== '' && pred.away !== '') {
      setIsSaving(matchId)
      try {
        const result = await savePredictionAction(matchId, parseInt(pred.home), parseInt(pred.away))
        if (result?.error) {
          alert(result.error)
        }
      } catch (err: any) {
        console.error(err)
        alert("Ocurrió un error inesperado al guardar la predicción.")
      } finally {
        setIsSaving(null)
      }
    }
  }

  const handleJoinLeague = async () => {
    if (!joinCode) return
    setIsJoining(true)
    try {
      await joinLeague(joinCode)
      const myLeagues = await getUserLeagues()
      setLeagues(myLeagues)
      setJoinCode('')
      alert('Te has unido a la liga exitosamente')
      if (myLeagues.length > 0) loadLeaderboard(myLeagues[myLeagues.length - 1].id)
    } catch (err: any) {
      alert(err.message)
    } finally {
      setIsJoining(false)
    }
  }

  const handleCreateLeague = async () => {
    if (!newLeagueName) return
    setIsCreating(true)
    try {
      await createLeague(newLeagueName)
      const myLeagues = await getUserLeagues()
      setLeagues(myLeagues)
      setNewLeagueName('')
      alert('Liga creada exitosamente')
      if (myLeagues.length > 0) loadLeaderboard(myLeagues[myLeagues.length - 1].id)
    } catch (err: any) {
      alert(err.message)
    } finally {
      setIsCreating(false)
    }
  }

  const loadLeaderboard = async (leagueId: string) => {
    setActiveLeagueId(leagueId)
    const lb = await getLeagueLeaderboard(leagueId)
    setLeagueLeaderboard(lb)
  }

  const activeLeague = leagues.find(l => l.id === activeLeagueId)
  const myRank = activeLeagueId ? leagueLeaderboard.findIndex(m => m.username === username || m.username === username.toLowerCase()) + 1 : 0

  return (
    <div className="min-h-screen bg-[#030712] relative font-outfit p-4 lg:p-8 pt-24 -mt-16 w-full">
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />
      <div className="fixed top-0 left-0 w-full h-[500px] bg-primary/10 rounded-b-[100%] blur-[100px] -z-10 pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* HEADER */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12 border-b border-white/10 pb-8"
        >
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-amber-600 flex items-center justify-center font-black text-3xl text-white shadow-[0_0_30px_rgba(235,103,27,0.4)] border-2 border-white/10 uppercase">
              {username.substring(0,2)}
            </div>
            <div>
              <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70 tracking-widest uppercase">HOLA, {username}</h1>
              <p className="text-primary font-bold tracking-widest uppercase mt-1 text-sm">Tu Prode Personal</p>
            </div>
          </div>
          
          <div className="glass-card px-8 py-4 rounded-2xl border border-white/10 flex items-center gap-4 bg-[#0a0f1c]/80 backdrop-blur-xl">
            <Trophy className="w-8 h-8 text-primary drop-shadow-[0_0_10px_rgba(235,103,27,0.8)]" />
            <div>
              <div className="text-xs text-white/50 uppercase tracking-widest font-bold mb-1">Mis Puntos</div>
              <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-amber-400 leading-none">
                {basePoints + bracketPoints}
              </div>
              {bracketPoints > 0 && (
                <div className="text-[10px] text-amber-400 mt-1 font-bold">
                  +{bracketPoints} pts por Llaves
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* TABS */}
        <div className="flex flex-wrap gap-4 mb-8">
          <button 
            onClick={() => setActiveTab('matches')}
            className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${activeTab === 'matches' ? 'bg-primary text-white shadow-[0_0_20px_rgba(235,103,27,0.4)] border border-primary/50' : 'bg-white/5 text-white/50 hover:bg-white/10 border border-white/5'}`}
          >
            <Sparkles className="w-5 h-5" /> Mis Pronósticos
          </button>
          <button 
            onClick={() => setActiveTab('leagues')}
            className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${activeTab === 'leagues' ? 'bg-primary text-white shadow-[0_0_20px_rgba(235,103,27,0.4)] border border-primary/50' : 'bg-white/5 text-white/50 hover:bg-white/10 border border-white/5'}`}
          >
            <Users className="w-5 h-5" /> Ligas de Amigos
          </button>
          <button 
            onClick={() => setActiveTab('medals')}
            className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${activeTab === 'medals' ? 'bg-primary text-white shadow-[0_0_20px_rgba(235,103,27,0.4)] border border-primary/50' : 'bg-white/5 text-white/50 hover:bg-white/10 border border-white/5'}`}
          >
            <Medal className="w-5 h-5" /> Mis Trofeos
          </button>
        </div>

        {/* CONTENT AREA */}
        <AnimatePresence mode="wait">
          
          {/* TAB: MATCHES */}
          {activeTab === 'matches' && (
            <motion.div key="matches" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-12">
              
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-black text-white flex items-center gap-3">
                    PARTIDOS PENDIENTES
                    <span className="bg-primary/20 text-primary text-sm px-3 py-1 rounded-full border border-primary/30">{pendingMatches.length}</span>
                  </h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {pendingMatches.map(match => (
                    <div key={match.id} className="relative glass-card p-6 rounded-2xl border border-white/10 hover:border-white/20 transition-all group overflow-hidden bg-[#0a0f1c]/80 backdrop-blur-xl">
                      <div className="flex items-center justify-between mb-6">
                        <span className="text-[10px] font-bold px-2 py-1 rounded bg-white/5 text-white/50 uppercase tracking-widest border border-white/10">{match.stage}</span>
                        <div className="flex items-center gap-1 text-[10px] text-white/40 uppercase font-bold tracking-widest">
                          <MapPin className="w-3 h-3" /> {match.venue}
                        </div>
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
                          type="number" min="0" placeholder="-"
                          className="w-14 h-12 bg-[#060913] border border-white/10 rounded-lg text-center font-mono font-bold text-xl text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                          value={predictions[match.id]?.home ?? ''} onChange={(e) => handlePredictionChange(match.id, 'home', e.target.value)}
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
                          type="number" min="0" placeholder="-"
                          className="w-14 h-12 bg-[#060913] border border-white/10 rounded-lg text-center font-mono font-bold text-xl text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                          value={predictions[match.id]?.away ?? ''} onChange={(e) => handlePredictionChange(match.id, 'away', e.target.value)}
                        />
                      </div>

                      <button 
                        onClick={() => savePrediction(match.id)}
                        disabled={!predictions[match.id]?.home || !predictions[match.id]?.away || isSaving === match.id}
                        className="w-full bg-primary/80 hover:bg-primary text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-30 disabled:hover:bg-primary/80 border border-primary/50 shadow-[0_0_15px_rgba(235,103,27,0.2)] disabled:shadow-none"
                      >
                        {isSaving === match.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} 
                        {isSaving === match.id ? 'Guardando...' : 'Guardar Predicción'}
                      </button>
                    </div>
                  ))}
                </div>
              </section>

            </motion.div>
          )}

          {/* TAB: LEAGUES */}
          {activeTab === 'leagues' && (
            <motion.div key="leagues" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-card p-8 rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent relative overflow-hidden group hover:border-primary/50 transition-colors">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[40px] group-hover:bg-primary/20 transition-all" />
                  <Users className="w-10 h-10 text-primary mb-4" />
                  <h3 className="text-2xl font-black text-white mb-2">Unirse a Liga</h3>
                  <p className="text-white/50 text-sm mb-6">Ingresa el código que te compartieron tus amigos para entrar a su ranking privado.</p>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Ej: PLOT-1234" 
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                      className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 text-white focus:outline-none focus:border-primary uppercase font-mono" 
                    />
                    <button 
                      onClick={handleJoinLeague}
                      disabled={!joinCode || isJoining}
                      className="bg-primary hover:bg-primary/90 disabled:opacity-50 text-white p-3 rounded-xl transition-colors"
                    >
                      {isJoining ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="glass-card p-8 rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent relative overflow-hidden group hover:border-amber-500/50 transition-colors">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-[40px] group-hover:bg-amber-500/20 transition-all" />
                  <Trophy className="w-10 h-10 text-amber-500 mb-4" />
                  <h3 className="text-2xl font-black text-white mb-2">Crear Nueva Liga</h3>
                  <p className="text-white/50 text-sm mb-6">Conviértete en administrador, crea tus propias reglas e invita a tu grupo.</p>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Nombre de la liga" 
                      value={newLeagueName}
                      onChange={(e) => setNewLeagueName(e.target.value)}
                      className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 text-white focus:outline-none focus:border-amber-500 font-outfit" 
                    />
                    <button 
                      onClick={handleCreateLeague}
                      disabled={!newLeagueName || isCreating}
                      className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white p-3 rounded-xl transition-colors"
                    >
                      {isCreating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* LIGAS ACTIVAS */}
              {leagues.length > 0 && (
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide mt-8">
                  {leagues.map(l => (
                    <button 
                      key={l.id}
                      onClick={() => loadLeaderboard(l.id)}
                      className={`whitespace-nowrap px-6 py-2 rounded-full border text-sm font-bold transition-all ${activeLeagueId === l.id ? 'bg-primary/20 border-primary text-white shadow-[0_0_15px_rgba(235,103,27,0.3)]' : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'}`}
                    >
                      {l.name}
                    </button>
                  ))}
                </div>
              )}

              {/* RANKING DE LIGA SELECCIONADA */}
              {activeLeague && (
                <div className="glass-card p-6 md:p-8 rounded-3xl border border-primary/30 bg-[#0a0f1c]/90 relative overflow-hidden shadow-[0_0_30px_rgba(235,103,27,0.1)]">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
                    <div>
                      <h3 className="text-2xl font-black text-white flex items-center gap-3">
                        {activeLeague.name} <span className="bg-green-500/20 text-green-400 text-xs px-3 py-1 rounded-full border border-green-500/30 font-bold">Activa</span>
                      </h3>
                      <p className="text-white/50 text-sm mt-1">
                        Código de invitación: <span className="font-mono text-white bg-white/10 px-2 py-0.5 rounded">{activeLeague.invite_code}</span>
                      </p>
                    </div>
                    {myRank > 0 && (
                      <div className="bg-black/50 border border-white/10 rounded-xl p-3 text-center min-w-[120px]">
                        <div className="text-[10px] text-white/50 uppercase tracking-widest font-bold mb-1">Mi Posición</div>
                        <div className="text-2xl font-black text-primary">#{myRank}</div>
                      </div>
                    )}
                  </div>

                  <div className="bg-white/5 rounded-2xl border border-white/5 overflow-x-auto">
                    <div className="min-w-[450px]">
                      <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/5 bg-black/40 text-xs font-bold text-white/40 uppercase tracking-widest">
                        <div className="col-span-2 text-center">Pos</div>
                        <div className="col-span-7">Jugador</div>
                        <div className="col-span-3 text-right pr-4">Pts</div>
                      </div>
                      <div className="divide-y divide-white/5">
                        {leagueLeaderboard.map((member, idx) => {
                          const isMe = member.username === username || member.username === username.toLowerCase()
                          let bgClass = "hover:bg-white/5 transition-colors"
                          let posClass = "text-white/30"
                          let textClass = "text-white/70"
                          let ptsClass = "text-white/50"

                          if (idx === 0) { bgClass = "bg-amber-500/5"; posClass = "text-amber-500"; textClass = "text-white"; ptsClass = "text-amber-500" }
                          else if (idx === 1) { bgClass = "bg-gray-400/5"; posClass = "text-gray-400"; textClass = "text-white"; ptsClass = "text-gray-400" }
                          else if (idx === 2) { bgClass = "bg-amber-700/10"; posClass = "text-amber-700"; textClass = "text-white"; ptsClass = "text-amber-700" }

                          if (isMe) { bgClass = "bg-primary/10 border-l-2 border-primary"; posClass = "text-primary"; textClass = "text-white"; ptsClass = "text-primary" }

                          return (
                            <div key={member.user_id} className={`grid grid-cols-12 gap-4 p-4 items-center ${bgClass}`}>
                              <div className={`col-span-2 text-center font-black ${posClass}`}>#{idx + 1}</div>
                              <div className={`col-span-7 font-bold flex items-center gap-2 ${textClass}`}>
                                {member.avatar_url ? <img src={member.avatar_url} className="w-6 h-6 rounded-full" /> : <div className="w-6 h-6 rounded-full bg-white/10" />}
                                {member.username} {isMe && "(Tú)"}
                              </div>
                              <div className={`col-span-3 text-right pr-4 font-mono font-bold ${ptsClass}`}>{member.total_points || 0}</div>
                            </div>
                          )
                        })}
                        {leagueLeaderboard.length === 0 && (
                          <div className="p-8 text-center text-white/50">Esta liga aún no tiene miembros o puntos.</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </motion.div>
          )}

          {/* TAB: MEDALS */}
          {activeTab === 'medals' && (
            <motion.div key="medals" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* MEDAL 1: Nostradamus */}
                <div className={`glass-card p-6 rounded-2xl border ${medals.includes('nostradamus') ? 'border-purple-500/30 bg-gradient-to-b from-purple-500/10 to-transparent shadow-[0_0_20px_rgba(168,85,247,0.15)]' : 'border-white/5 bg-black/50 grayscale opacity-70'} flex flex-col items-center text-center relative overflow-hidden group`}>
                  <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay pointer-events-none" />
                  <div className={`w-24 h-24 rounded-full ${medals.includes('nostradamus') ? 'bg-gradient-to-br from-purple-400 to-indigo-600 shadow-[0_0_30px_rgba(168,85,247,0.5)]' : 'bg-white/5 text-white/30'} flex items-center justify-center mb-4 border-4 border-[#0a0f1c] relative z-10`}>
                    <Star className="w-10 h-10 text-white" />
                  </div>
                  <h3 className={`text-xl font-black ${medals.includes('nostradamus') ? 'text-purple-300' : 'text-white/50'} mb-2`}>Nostradamus</h3>
                  <p className="text-sm text-white/60">Acertaste el resultado exacto (goles) de un partido difícil.</p>
                  <div className={`mt-4 px-4 py-1.5 rounded-full text-xs font-bold border ${medals.includes('nostradamus') ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' : 'bg-black/50 text-white/30 border-white/10'}`}>
                    {medals.includes('nostradamus') ? 'Desbloqueada' : 'Bloqueada'}
                  </div>
                </div>

                {/* MEDAL 2: Madrugador */}
                <div className={`glass-card p-6 rounded-2xl border ${medals.includes('madrugador') ? 'border-blue-500/30 bg-gradient-to-b from-blue-500/10 to-transparent shadow-[0_0_20px_rgba(59,130,246,0.15)]' : 'border-white/5 bg-black/50 grayscale opacity-70'} flex flex-col items-center text-center relative overflow-hidden group`}>
                  <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay pointer-events-none" />
                  <div className={`w-24 h-24 rounded-full ${medals.includes('madrugador') ? 'bg-gradient-to-br from-blue-400 to-cyan-600 shadow-[0_0_30px_rgba(59,130,246,0.5)]' : 'bg-white/5 text-white/30'} flex items-center justify-center mb-4 border-4 border-[#0a0f1c] relative z-10`}>
                    <Zap className="w-10 h-10 text-white" />
                  </div>
                  <h3 className={`text-xl font-black ${medals.includes('madrugador') ? 'text-blue-300' : 'text-white/50'} mb-2`}>Madrugador</h3>
                  <p className="text-sm text-white/60">Pronosticaste todos los partidos de la Fase de Grupos a tiempo.</p>
                  <div className={`mt-4 px-4 py-1.5 rounded-full text-xs font-bold border ${medals.includes('madrugador') ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' : 'bg-black/50 text-white/30 border-white/10'}`}>
                    {medals.includes('madrugador') ? 'Desbloqueada' : 'Bloqueada'}
                  </div>
                </div>

                {/* MEDAL 3: Cazagigantes */}
                <div className={`glass-card p-6 rounded-2xl border ${medals.includes('cazagigantes') ? 'border-green-500/30 bg-gradient-to-b from-green-500/10 to-transparent shadow-[0_0_20px_rgba(34,197,94,0.15)]' : 'border-white/5 bg-black/50 grayscale opacity-70'} flex flex-col items-center text-center relative overflow-hidden group`}>
                  <div className={`w-24 h-24 rounded-full ${medals.includes('cazagigantes') ? 'bg-gradient-to-br from-green-400 to-emerald-600 shadow-[0_0_30px_rgba(34,197,94,0.5)]' : 'bg-white/5 text-white/30'} flex items-center justify-center mb-4 border-4 border-[#0a0f1c] relative z-10`}>
                    <Target className="w-10 h-10 text-white" />
                  </div>
                  <h3 className={`text-xl font-black ${medals.includes('cazagigantes') ? 'text-green-300' : 'text-white/50'} mb-2`}>Cazagigantes</h3>
                  <p className="text-sm text-white/60">Predice la victoria de un equipo débil contra un claro favorito.</p>
                  <div className={`mt-4 px-4 py-1.5 rounded-full text-xs font-bold border ${medals.includes('cazagigantes') ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-black/50 text-white/30 border-white/10'}`}>
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
