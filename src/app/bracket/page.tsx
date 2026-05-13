'use client'

import { useState, useEffect, useRef } from 'react'
import { toPng } from 'html-to-image'
import { motion, AnimatePresence } from 'framer-motion'
import { groupColors, Team } from '@/lib/mockData'
import Image from 'next/image'
import { Trophy, Save, Lock, Zap, Loader2 } from 'lucide-react'
import { getTeams, getUserBracket, saveUserBracket, getOfficialBracket, saveOfficialBracket } from '@/lib/actions'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

// --- Types & Constants ---
type GroupSlot = { id: string; label: string; allowedGroups: string[] }

const R32_LEFT: GroupSlot[][] = [
  [ { id: 'm74_h', label: '1E', allowedGroups: ['E'] }, { id: 'm74_a', label: '3 ABCDF', allowedGroups: ['A','B','C','D','F'] } ],
  [ { id: 'm77_h', label: '1I', allowedGroups: ['I'] }, { id: 'm77_a', label: '3 CDFGH', allowedGroups: ['C','D','F','G','H'] } ],
  [ { id: 'm73_h', label: '2A', allowedGroups: ['A'] }, { id: 'm73_a', label: '2B', allowedGroups: ['B'] } ],
  [ { id: 'm75_h', label: '1F', allowedGroups: ['F'] }, { id: 'm75_a', label: '2C', allowedGroups: ['C'] } ],
  [ { id: 'm83_h', label: '2K', allowedGroups: ['K'] }, { id: 'm83_a', label: '2L', allowedGroups: ['L'] } ],
  [ { id: 'm84_h', label: '1H', allowedGroups: ['H'] }, { id: 'm84_a', label: '2J', allowedGroups: ['J'] } ],
  [ { id: 'm81_h', label: '1D', allowedGroups: ['D'] }, { id: 'm81_a', label: '3 BEFIJ', allowedGroups: ['B','E','F','I','J'] } ],
  [ { id: 'm82_h', label: '1G', allowedGroups: ['G'] }, { id: 'm82_a', label: '3 AEHIJ', allowedGroups: ['A','E','H','I','J'] } ],
]

const R32_RIGHT: GroupSlot[][] = [
  [ { id: 'm76_h', label: '1C', allowedGroups: ['C'] }, { id: 'm76_a', label: '2F', allowedGroups: ['F'] } ],
  [ { id: 'm78_h', label: '2E', allowedGroups: ['E'] }, { id: 'm78_a', label: '2I', allowedGroups: ['I'] } ],
  [ { id: 'm79_h', label: '1A', allowedGroups: ['A'] }, { id: 'm79_a', label: '3 CEFHI', allowedGroups: ['C','E','F','H','I'] } ],
  [ { id: 'm80_h', label: '1L', allowedGroups: ['L'] }, { id: 'm80_a', label: '3 EHIJK', allowedGroups: ['E','H','I','J','K'] } ],
  [ { id: 'm86_h', label: '1J', allowedGroups: ['J'] }, { id: 'm86_a', label: '2H', allowedGroups: ['H'] } ],
  [ { id: 'm88_h', label: '2D', allowedGroups: ['D'] }, { id: 'm88_a', label: '2G', allowedGroups: ['G'] } ],
  [ { id: 'm85_h', label: '1B', allowedGroups: ['B'] }, { id: 'm85_a', label: '3 EFGIJ', allowedGroups: ['E','F','G','I','J'] } ],
  [ { id: 'm87_h', label: '1K', allowedGroups: ['K'] }, { id: 'm87_a', label: '3 DEIJL', allowedGroups: ['D','E','I','J','L'] } ],
]

const KO_STRUCTURE = {
  R16_LEFT: [
    { matchId: 'm89', homeSource: 'm74', awaySource: 'm77' },
    { matchId: 'm90', homeSource: 'm73', awaySource: 'm75' },
    { matchId: 'm93', homeSource: 'm83', awaySource: 'm84' },
    { matchId: 'm94', homeSource: 'm81', awaySource: 'm82' },
  ],
  R16_RIGHT: [
    { matchId: 'm91', homeSource: 'm76', awaySource: 'm78' },
    { matchId: 'm92', homeSource: 'm79', awaySource: 'm80' },
    { matchId: 'm95', homeSource: 'm86', awaySource: 'm88' },
    { matchId: 'm96', homeSource: 'm85', awaySource: 'm87' },
  ],
  Q_LEFT: [
    { matchId: 'm97', homeSource: 'm89', awaySource: 'm90' },
    { matchId: 'm98', homeSource: 'm93', awaySource: 'm94' },
  ],
  Q_RIGHT: [
    { matchId: 'm99', homeSource: 'm91', awaySource: 'm92' },
    { matchId: 'm100', homeSource: 'm95', awaySource: 'm96' },
  ],
  S_LEFT: [ { matchId: 'm101', homeSource: 'm97', awaySource: 'm98' } ],
  S_RIGHT: [ { matchId: 'm102', homeSource: 'm99', awaySource: 'm100' } ],
  FINAL: { matchId: 'm104', homeSource: 'm101', awaySource: 'm102' },
}


const GroupBox = ({ groupName, teams }: { groupName: string, teams: Team[] }) => {
  const color = groupColors[groupName] || 'from-gray-500 to-gray-700'
  return (
    <div className={`p-2 rounded-xl bg-black/60 backdrop-blur-xl border border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.5)] relative overflow-hidden group w-[160px] h-[95px] flex flex-col justify-between hover:border-white/30 transition-colors`}>
      <div className={`absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b ${color}`} />
      <div className="grid grid-cols-2 gap-1.5 h-full content-start ml-1">
        {teams.map(t => (
          <div key={t.id} className="w-full h-5 rounded relative overflow-hidden border border-white/10 bg-white/5" title={t.name}>
            <Image unoptimized src={`https://flagcdn.com/${t.code}.svg`} alt={t.name} fill className="object-cover object-center" />
          </div>
        ))}
      </div>
      <div className={`w-full py-0.5 text-center text-[10px] font-black tracking-widest text-white rounded bg-gradient-to-r ${color} mt-1 ml-0.5 shadow-lg`}>
        GRUPO {groupName}
      </div>
    </div>
  )
}

export default function BracketPage() {
  const isAdminMode = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('mode') === 'admin' : false

  const [r32Slots, setR32Slots] = useState<Record<string, string>>({})
  const [matchWinners, setMatchWinners] = useState<Record<string, string>>({})
  const [activeSlot, setActiveSlot] = useState<GroupSlot | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isCapturing, setIsCapturing] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [teams, setTeams] = useState<any[]>([])
  const [loadingTeams, setLoadingTeams] = useState(true)
  const bracketRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const getTeam = (id: string | null) => id ? teams.find(t => t.id === id) || null : null

  // Initial load
  useEffect(() => {
    async function initData() {
      // 1. Load Teams
      const data = await getTeams()
      setTeams((data || []).map((t: any) => ({ ...t, group: t.group_id })))
      setLoadingTeams(false)

      // 2. Check auth
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (isAdminMode) {
        setIsLoggedIn(true) // Assumes admin is verified by server actions
        const official = await getOfficialBracket()
        if (official) {
          setR32Slots(official.r32_slots || {})
          setMatchWinners(official.match_winners || {})
        }
      } else {
        if (user) {
          setIsLoggedIn(true)
          const bracket = await getUserBracket(user.id)
          if (bracket) {
            setR32Slots(bracket.r32_slots || {})
            setMatchWinners(bracket.match_winners || {})
          }
        }
      }
      setIsLoaded(true)
    }
    initData()
  }, [isAdminMode])

  // Auto-save logic (debounced)
  useEffect(() => {
    if (!isLoaded || !isLoggedIn) return

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    
    saveTimeoutRef.current = setTimeout(async () => {
      setIsSaving(true)
      try {
        if (isAdminMode) {
          await saveOfficialBracket(r32Slots, matchWinners)
        } else {
          await saveUserBracket(r32Slots, matchWinners)
        }
      } catch (err) {
        console.error('Error auto-saving bracket:', err)
      } finally {
        setIsSaving(false)
      }
    }, 1500) // Auto-save after 1.5 seconds of inactivity
    
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    }
  }, [r32Slots, matchWinners, isLoaded, isLoggedIn, isAdminMode])

  const handleSlotClick = (slot: GroupSlot) => setActiveSlot(slot)
  const selectTeamForSlot = (teamId: string) => {
    if (!activeSlot) return
    setR32Slots(prev => ({ ...prev, [activeSlot.id]: teamId }))
    setActiveSlot(null)
    const matchId = activeSlot.id.split('_')[0]
    if (matchWinners[matchId] && matchWinners[matchId] !== teamId) {
      clearDownstream(matchId)
    }
  }

  const clearDownstream = (matchId: string) => {
    setMatchWinners(prev => {
      const next = { ...prev }
      delete next[matchId]
      return {} 
    })
  }

  const isTeamAvailable = (teamId: string) => !Object.values(r32Slots).includes(teamId)

  const advanceTeam = (matchId: string, teamId: string | null) => {
    if (!teamId) return
    setMatchWinners(prev => ({ ...prev, [matchId]: teamId }))
  }

  const captureAndShare = async () => {
    if (!bracketRef.current) return
    try {
      setIsCapturing(true)
      const dataUrl = await toPng(bracketRef.current, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: '#030712',
        filter: (node) => {
          // exclude buttons/modals that might clutter the screenshot if needed
          return !node.classList?.contains('exclude-from-capture')
        }
      })

      // Fetch blob for sharing
      const res = await fetch(dataUrl)
      const blob = await res.blob()
      const file = new File([blob], 'mi-bracket-mundial.png', { type: 'image/png' })

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'Mi Bracket - PLOT MUNDIAL 2026',
          text: '¡Mira mi pronóstico para el Mundial 2026! Arma el tuyo en Plot Mundial.',
          files: [file]
        })
      } else {
        // Fallback: download
        const link = document.createElement('a')
        link.download = 'mi-bracket-mundial.png'
        link.href = dataUrl
        link.click()
      }
    } catch (err) {
      console.error('Error capturing bracket:', err)
      alert('Hubo un error al generar la imagen. Intenta nuevamente.')
    } finally {
      setIsCapturing(false)
    }
  }

  // Ultra-premium unified match card
  const UnifiedMatchCard = ({ 
    matchId, 
    homeTeamId, 
    awayTeamId, 
    homeFallback, 
    awayFallback,
    onHomeClick,
    onAwayClick
  }: {
    matchId: string, homeTeamId: string | null, awayTeamId: string | null, 
    homeFallback: string, awayFallback: string,
    onHomeClick: () => void, onAwayClick: () => void
  }) => {
    const homeTeam = getTeam(homeTeamId)
    const awayTeam = getTeam(awayTeamId)
    const winnerId = matchWinners[matchId]

    const TeamRow = ({ team, fallback, onClick, isWinner, isSelectable }: any) => (
      <div 
        onClick={onClick}
        className={`flex items-center px-1.5 py-1 transition-all relative overflow-hidden h-[26px] w-full
          ${onClick && isSelectable ? 'cursor-pointer hover:bg-white/10' : 'cursor-default'}
          ${isWinner ? 'bg-gradient-to-r from-amber-500/20 to-transparent' : ''}
        `}
      >
        {isWinner && <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-amber-400 shadow-[0_0_10px_rgba(245,158,11,1)]" />}
        {team ? (
          <>
            <div className="w-[18px] h-[12px] rounded-[2px] relative overflow-hidden border border-white/20 mr-1.5 flex-shrink-0 shadow-md">
              <Image unoptimized src={`https://flagcdn.com/${team.code}.svg`} alt={team.name} fill className="object-cover object-center" />
            </div>
            <span className={`text-[9px] sm:text-[10px] font-bold truncate ${isWinner ? 'text-amber-400 drop-shadow-md' : 'text-white'}`}>{team.name}</span>
          </>
        ) : (
          <span className="text-[8px] font-mono text-white/30 font-bold m-auto leading-tight text-center tracking-wider">{fallback}</span>
        )}
      </div>
    )

    return (
      <div className={`flex flex-col w-full min-w-[70px] max-w-[130px] bg-[#060913]/80 backdrop-blur-xl rounded-lg border relative overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.5)] transition-all duration-300
        ${winnerId ? 'border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.15)]' : 'border-white/10 hover:border-primary/50'}
      `}>
        {/* Glow effect inside card if resolved */}
        {winnerId && <div className="absolute inset-0 bg-amber-500/5 blur-xl pointer-events-none" />}
        
        <TeamRow 
          team={homeTeam} 
          fallback={homeFallback} 
          onClick={onHomeClick} 
          isWinner={winnerId === homeTeamId && !!winnerId}
          isSelectable={!!homeTeamId || !winnerId} 
        />
        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <TeamRow 
          team={awayTeam} 
          fallback={awayFallback} 
          onClick={onAwayClick} 
          isWinner={winnerId === awayTeamId && !!winnerId}
          isSelectable={!!awayTeamId || !winnerId}
        />
      </div>
    )
  }

  const renderR32Match = (slots: GroupSlot[]) => {
    const matchId = slots[0].id.split('_')[0]
    return (
      <UnifiedMatchCard
        matchId={matchId}
        homeTeamId={r32Slots[slots[0].id] || null}
        awayTeamId={r32Slots[slots[1].id] || null}
        homeFallback={slots[0].label}
        awayFallback={slots[1].label}
        onHomeClick={() => r32Slots[slots[0].id] ? advanceTeam(matchId, r32Slots[slots[0].id]) : handleSlotClick(slots[0])}
        onAwayClick={() => r32Slots[slots[1].id] ? advanceTeam(matchId, r32Slots[slots[1].id]) : handleSlotClick(slots[1])}
      />
    )
  }

  const renderKOMatch = (matchConfig: { matchId: string, homeSource: string, awaySource: string }) => {
    const homeTeamId = matchWinners[matchConfig.homeSource] || null
    const awayTeamId = matchWinners[matchConfig.awaySource] || null
    return (
      <UnifiedMatchCard
        matchId={matchConfig.matchId}
        homeTeamId={homeTeamId}
        awayTeamId={awayTeamId}
        homeFallback={`W${matchConfig.homeSource.replace('m','')}`}
        awayFallback={`W${matchConfig.awaySource.replace('m','')}`}
        onHomeClick={() => advanceTeam(matchConfig.matchId, homeTeamId)}
        onAwayClick={() => advanceTeam(matchConfig.matchId, awayTeamId)}
      />
    )
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] w-full overflow-x-auto bg-transparent relative font-outfit p-4 lg:p-6 flex flex-col">
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />
      
      {/* Epic Background Lighting */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-primary/10 rounded-full blur-[150px] -z-10 pointer-events-none opacity-50" />
      <div className="fixed top-0 left-0 w-full h-[300px] bg-gradient-to-b from-primary/10 to-transparent blur-[50px] -z-10 pointer-events-none" />

      {loadingTeams && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
        </div>
      )}

      {/* Admin Mode Badge */}
      {isAdminMode && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-red-600/90 backdrop-blur-md text-white font-bold text-xs px-4 py-1.5 rounded-full border border-red-500/50 z-50 shadow-[0_0_15px_rgba(220,38,38,0.4)] exclude-from-capture flex items-center gap-2 uppercase tracking-widest">
          <Zap className="w-3.5 h-3.5" /> Admin: Llaves Oficiales
        </div>
      )}

      {/* Auth Gate Overlay */}
      {!isLoggedIn && isLoaded && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-4">
          <div className="glass-card p-8 md:p-12 rounded-3xl max-w-md w-full text-center border border-white/10 shadow-[0_0_50px_rgba(235,103,27,0.2)]">
            <div className="relative w-48 h-48 mx-auto mb-2 drop-shadow-[0_0_15px_rgba(235,103,27,0.8)] flex items-center justify-center">
              <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full"></div>
              <Image src="/plot center mundial.png" alt="Plot Mundial Logo" fill className="object-contain relative z-10" />
            </div>
            <p className="text-white/70 mb-8">
              Debes iniciar sesión para comenzar a predecir tu llave eliminatoria y competir por el premio mayor en el Ranking.
            </p>
            <button 
              onClick={() => router.push('/login')}
              className="w-full bg-gradient-to-r from-primary to-amber-600 text-white font-bold px-6 py-4 rounded-xl hover:scale-105 transition-transform shadow-[0_0_20px_rgba(235,103,27,0.4)]"
            >
              Iniciar Sesión para Jugar
            </button>
          </div>
        </div>
      )}

      {/* Floating Share Button & Saving indicator */}
      <div className="fixed bottom-6 right-6 z-50 exclude-from-capture flex items-center gap-4">
        <AnimatePresence>
          {isSaving && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="bg-black/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-xs font-bold text-white/70 flex items-center gap-2">
              <Loader2 className="w-3 h-3 animate-spin text-primary" /> Guardando en nube...
            </motion.div>
          )}
        </AnimatePresence>

        <button 
          onClick={captureAndShare}
          disabled={isCapturing}
          className="bg-gradient-to-r from-primary to-amber-600 hover:from-primary/90 hover:to-amber-600/90 text-white font-bold px-4 py-3 rounded-full transition-all shadow-[0_0_30px_rgba(235,103,27,0.6)] flex items-center gap-2 text-sm border border-white/20 hover:scale-105 disabled:opacity-50 backdrop-blur-md"
        >
          {isCapturing ? 'Generando...' : <><Save className="w-5 h-5" /> Compartir Bracket</>}
        </button>
      </div>

      {/* Bracket Container - Responsive Scale */}
      <div className="w-full overflow-x-auto overflow-y-hidden pb-8 custom-scrollbar">
        <div ref={bracketRef} className="w-full min-w-[1100px] max-w-[1600px] h-[750px] mx-auto flex items-stretch justify-between gap-1 sm:gap-2 relative z-10 mt-4 px-2">
          
          {/* LEFT GROUPS */}
          <div className="flex flex-col justify-around h-full w-[60px] sm:w-[90px] shrink-0">
            {['A','B','C','D','E','F'].map(g => (
              <div key={g} className="flex-1 flex items-center justify-start pr-1">
                <GroupBox groupName={g} teams={teams.filter(t => t.group === g)} />
              </div>
            ))}
          </div>

          {/* LEFT 16AVOS */}
          <div className="flex flex-col justify-around h-full flex-1">
            {R32_LEFT.map((slots, i) => (
              <div key={i} className="flex-1 flex items-center justify-center">
                {renderR32Match(slots)}
              </div>
            ))}
          </div>

        {/* LEFT 8VOS */}
        <div className="flex flex-col justify-around h-full flex-1">
          {KO_STRUCTURE.R16_LEFT.map(match => (
            <div key={match.matchId} className="flex-1 flex items-center justify-center">
              {renderKOMatch(match)}
            </div>
          ))}
        </div>

        {/* LEFT CUARTOS */}
        <div className="flex flex-col justify-around h-full flex-1">
          {KO_STRUCTURE.Q_LEFT.map(match => (
            <div key={match.matchId} className="flex-1 flex items-center justify-center">
              {renderKOMatch(match)}
            </div>
          ))}
        </div>

        {/* LEFT SEMIS */}
        <div className="flex flex-col justify-around h-full flex-1">
          {KO_STRUCTURE.S_LEFT.map(match => (
            <div key={match.matchId} className="flex-1 flex items-center justify-center">
              {renderKOMatch(match)}
            </div>
          ))}
        </div>

        {/* CENTER (Trophy) */}
        <div className="flex flex-col items-center justify-center relative w-[130px] sm:w-[180px] shrink-0 px-1">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-32 h-32 relative mb-4 flex items-center justify-center"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-amber-500/60 to-amber-300/10 blur-[50px] rounded-full pointer-events-none animate-pulse" />
            <span className="text-[80px] sm:text-[100px] drop-shadow-[0_0_40px_rgba(245,158,11,0.8)] relative z-10 hover:scale-110 transition-transform duration-500 cursor-pointer">🏆</span>
          </motion.div>
          
          <div className="text-[10px] text-amber-400 font-black tracking-[0.3em] mb-2 drop-shadow-[0_0_10px_rgba(245,158,11,1)] text-center">FINAL</div>
          
          <div className="w-full">
            <UnifiedMatchCard
              matchId={KO_STRUCTURE.FINAL.matchId}
              homeTeamId={matchWinners[KO_STRUCTURE.FINAL.homeSource] || null}
              awayTeamId={matchWinners[KO_STRUCTURE.FINAL.awaySource] || null}
              homeFallback="Semi 1"
              awayFallback="Semi 2"
              onHomeClick={() => advanceTeam(KO_STRUCTURE.FINAL.matchId, matchWinners[KO_STRUCTURE.FINAL.homeSource])}
              onAwayClick={() => advanceTeam(KO_STRUCTURE.FINAL.matchId, matchWinners[KO_STRUCTURE.FINAL.awaySource])}
            />
          </div>
          
          {matchWinners[KO_STRUCTURE.FINAL.matchId] && (
            <motion.div 
              initial={{ scale: 0, y: 30 }} animate={{ scale: 1, y: 0 }} transition={{ type: "spring" }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-[80px] px-3 py-2 rounded-xl bg-gradient-to-b from-amber-400 to-amber-600 text-black font-black text-sm sm:text-lg tracking-wider shadow-[0_0_40px_rgba(245,158,11,1)] border-2 border-yellow-200 uppercase text-center w-[130%] z-50 overflow-hidden"
            >
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30 mix-blend-overlay pointer-events-none" />
              {getTeam(matchWinners[KO_STRUCTURE.FINAL.matchId])?.name} <br/> <span className="text-[8px] sm:text-[10px] opacity-80 mt-0.5 block leading-tight">CAMPEÓN</span>
            </motion.div>
          )}
        </div>

        {/* RIGHT SEMIS */}
        <div className="flex flex-col justify-around h-full flex-1">
          {KO_STRUCTURE.S_RIGHT.map(match => (
            <div key={match.matchId} className="flex-1 flex items-center justify-center">
              {renderKOMatch(match)}
            </div>
          ))}
        </div>

        {/* RIGHT CUARTOS */}
        <div className="flex flex-col justify-around h-full flex-1">
          {KO_STRUCTURE.Q_RIGHT.map(match => (
            <div key={match.matchId} className="flex-1 flex items-center justify-center">
              {renderKOMatch(match)}
            </div>
          ))}
        </div>

        {/* RIGHT 8VOS */}
        <div className="flex flex-col justify-around h-full flex-1">
          {KO_STRUCTURE.R16_RIGHT.map(match => (
            <div key={match.matchId} className="flex-1 flex items-center justify-center">
              {renderKOMatch(match)}
            </div>
          ))}
        </div>

        {/* RIGHT 16AVOS */}
        <div className="flex flex-col justify-around h-full flex-1">
          {R32_RIGHT.map((slots, i) => (
            <div key={i} className="flex-1 flex items-center justify-center">
              {renderR32Match(slots)}
            </div>
          ))}
        </div>

        {/* RIGHT GROUPS */}
        <div className="flex flex-col justify-around h-full w-[60px] sm:w-[90px] shrink-0">
          {['G','H','I','J','K','L'].map(g => (
            <div key={g} className="flex-1 flex items-center justify-end pl-1">
              <GroupBox groupName={g} teams={teams.filter(t => t.group === g)} />
            </div>
            ))}
          </div>

        </div>
      </div>

      {/* MODAL FOR SELECTION */}
      <AnimatePresence>
        {activeSlot && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl px-4"
            onClick={() => setActiveSlot(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-[#060913] border border-primary/30 p-8 rounded-[2rem] max-w-lg w-full shadow-[0_0_50px_rgba(235,103,27,0.2)] relative overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px] pointer-events-none -translate-y-1/2 translate-x-1/2" />
              
              <h3 className="text-3xl font-black text-white mb-2 tracking-wide">Clasifica a {activeSlot.label}</h3>
              <p className="text-white/50 text-sm mb-8 font-light">Elige al equipo que ocupará este lugar en los Dieciseisavos de Final. Solo se muestran equipos disponibles.</p>
              
              <div className="grid grid-cols-2 gap-3 relative z-10">
                {teams
                  .filter(t => activeSlot.allowedGroups.includes(t.group))
                  .filter(t => isTeamAvailable(t.id))
                  .map(t => (
                  <button
                    key={t.id}
                    onClick={() => selectTeamForSlot(t.id)}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-primary/20 border border-white/10 hover:border-primary transition-all text-left group shadow-lg"
                  >
                    <Image unoptimized src={`https://flagcdn.com/${t.code}.svg`} alt={t.name} width={36} height={26} className="rounded object-cover shadow-md border border-white/20 group-hover:scale-110 transition-transform" />
                    <div>
                      <span className="font-bold text-white text-sm block">{t.name}</span>
                      <span className="text-[10px] text-white/40 font-mono">Grupo {t.group}</span>
                    </div>
                  </button>
                ))}
              </div>
              
              {teams.filter(t => activeSlot.allowedGroups.includes(t.group) && isTeamAvailable(t.id)).length === 0 && (
                <div className="text-center p-8 text-primary border border-dashed border-primary/30 bg-primary/5 rounded-2xl mt-4 text-sm font-semibold">
                  No quedan equipos disponibles.<br/>Haz clic en otra llave para liberar espacio.
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
