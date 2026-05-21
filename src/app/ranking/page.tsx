'use client'

import { useState, useEffect, useCallback } from 'react'
import { Trophy, Medal, ArrowUpRight, Flame, Shield, Zap, Loader2, Brain } from 'lucide-react'
import { motion } from 'framer-motion'
import { getRanking, getTriviaRanking } from '@/lib/actions'

type RankingTab = 'prode' | 'trivia'

type RankingUser = {
  id: string
  username: string | null
  avatar_url: string | null
  fixture_points?: number
  trivia_points?: number
  total_points?: number
}

function getPoints(user: RankingUser, tab: RankingTab) {
  if (tab === 'trivia') return user.trivia_points ?? 0
  return user.fixture_points ?? user.total_points ?? 0
}

export default function RankingPage() {
  const [tab, setTab] = useState<RankingTab>('prode')
  const [sortedUsers, setSortedUsers] = useState<RankingUser[]>([])
  const [loading, setLoading] = useState(true)

  const fetchRanking = useCallback(async (activeTab: RankingTab) => {
    setLoading(true)
    const data = activeTab === 'prode' ? await getRanking() : await getTriviaRanking()
    setSortedUsers((data as RankingUser[]) || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchRanking(tab)
  }, [tab, fetchRanking])

  const pointsLabel = tab === 'prode' ? 'Pts prode' : 'Pts trivia'
  const title = tab === 'prode' ? 'Ranking Prode' : 'Ranking Trivia'
  const subtitle =
    tab === 'prode'
      ? 'Solo pronósticos del fixture · 3 pts exacto · 1 pt tendencia'
      : 'Solo trivia mundialista · puntos por acierto y velocidad'

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center font-outfit">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    )
  }

  const withPoints = sortedUsers.filter((u) => getPoints(u, tab) > 0)

  return (
    <div className="min-h-[calc(100vh-4rem)] w-full max-w-[100vw] overflow-x-hidden px-4 py-8 md:px-8 md:py-10 bg-transparent relative font-outfit">
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />
      <div className="fixed top-0 left-0 w-full h-[500px] bg-amber-900/10 rounded-b-[100%] blur-[100px] -z-10 pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shadow-[0_0_50px_rgba(245,158,11,0.2)] mb-6">
            {tab === 'prode' ? (
              <Trophy className="w-10 h-10 text-amber-500 drop-shadow-[0_0_15px_rgba(245,158,11,0.8)]" />
            ) : (
              <Brain className="w-10 h-10 text-violet-400 drop-shadow-[0_0_15px_rgba(167,139,250,0.8)]" />
            )}
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-500 to-amber-200 tracking-widest mb-4">
            {title.toUpperCase()}
          </h1>
          <p className="text-amber-500/60 font-bold tracking-widest uppercase text-sm mb-6">{subtitle}</p>

          <div className="inline-flex rounded-xl border border-white/15 bg-white/5 p-1">
            <button
              type="button"
              onClick={() => setTab('prode')}
              className={`rounded-lg px-5 py-2 text-xs font-black uppercase tracking-widest transition-colors ${
                tab === 'prode' ? 'bg-amber-500 text-[#0a0f1c]' : 'text-white/60 hover:text-white'
              }`}
            >
              Prode
            </button>
            <button
              type="button"
              onClick={() => setTab('trivia')}
              className={`rounded-lg px-5 py-2 text-xs font-black uppercase tracking-widest transition-colors ${
                tab === 'trivia' ? 'bg-violet-500 text-white' : 'text-white/60 hover:text-white'
              }`}
            >
              Trivia
            </button>
          </div>
        </motion.div>

        {withPoints.length === 0 ? (
          <div className="text-center text-white/70 py-16 border border-white/10 rounded-2xl bg-white/5">
            {tab === 'prode'
              ? 'Todavía no hay puntos de prode. Cargá resultados en el fixture o esperá que cierren partidos.'
              : 'Todavía no hay puntos de trivia. Jugá en /trivia para sumar al ranking.'}
          </div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col md:flex-row items-end justify-center gap-4 lg:gap-8 mb-20 pt-10 px-4"
            >
              {withPoints.length >= 2 && (
                <PodiumCard user={withPoints[1]} points={getPoints(withPoints[1], tab)} rank={2} medal="silver" />
              )}
              {withPoints.length >= 1 && (
                <PodiumCard user={withPoints[0]} points={getPoints(withPoints[0], tab)} rank={1} medal="gold" tall />
              )}
              {withPoints.length >= 3 && (
                <PodiumCard user={withPoints[2]} points={getPoints(withPoints[2], tab)} rank={3} medal="bronze" />
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-card border border-white/10 rounded-3xl overflow-hidden bg-[#0a0f1c]/40 backdrop-blur-xl"
            >
              <div className="grid grid-cols-12 gap-4 p-4 md:p-6 border-b border-white/10 bg-white/5 text-xs font-bold uppercase tracking-widest text-white/40">
                <div className="col-span-2 text-center">Pos</div>
                <div className="col-span-6 md:col-span-7">Jugador</div>
                <div className="col-span-4 md:col-span-3 text-right">{pointsLabel}</div>
              </div>
              <div className="divide-y divide-white/5">
                {withPoints.slice(3).map((user, index) => {
                  const pos = index + 4
                  const pts = getPoints(user, tab)
                  return (
                    <div
                      key={user.id}
                      className="grid grid-cols-12 gap-4 p-4 md:p-6 items-center hover:bg-white/5 transition-colors group"
                    >
                      <div className="col-span-2 flex justify-center">
                        <span className="font-black text-xl text-white/30 group-hover:text-white/70 transition-colors">
                          #{pos}
                        </span>
                      </div>
                      <div className="col-span-6 md:col-span-7 flex items-center gap-4">
                        <Avatar user={user} />
                        <div>
                          <span className="font-bold text-white/90 text-lg md:text-xl block">{user.username}</span>
                          <div className="flex gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {pos % 2 === 0 && (
                              <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded border border-green-500/30 flex items-center gap-1">
                                <ArrowUpRight className="w-3 h-3" /> En Racha
                              </span>
                            )}
                            {pos === 4 && (
                              <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded border border-blue-500/30 flex items-center gap-1">
                                <Shield className="w-3 h-3" /> Defensor
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="col-span-4 md:col-span-3 text-right pr-2 md:pr-4">
                        <span className="text-2xl md:text-3xl font-black font-mono text-white/90">{pts}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  )
}

function Avatar({ user }: { user: RankingUser }) {
  return (
    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-white flex items-center justify-center font-black text-lg border border-white/10 shadow-inner overflow-hidden">
      {user.avatar_url ? (
        <img src={user.avatar_url} alt={user.username ?? ''} className="w-full h-full object-cover" />
      ) : (
        user.username?.charAt(0).toUpperCase() || 'U'
      )}
    </div>
  )
}

function PodiumCard({
  user,
  points,
  rank,
  medal,
  tall,
}: {
  user: RankingUser
  points: number
  rank: number
  medal: 'gold' | 'silver' | 'bronze'
  tall?: boolean
}) {
  const styles = {
    gold: {
      border: 'border-amber-500/50',
      bg: 'from-amber-500/20 to-transparent',
      line: 'via-amber-500',
      text: 'text-amber-500',
      icon: 'text-amber-500',
      flame: true,
    },
    silver: {
      border: 'border-gray-300/30',
      bg: 'from-gray-300/10 to-transparent',
      line: 'via-gray-300',
      text: 'text-gray-300',
      icon: 'text-gray-300',
      flame: false,
    },
    bronze: {
      border: 'border-orange-700/30',
      bg: 'from-orange-900/20 to-transparent',
      line: 'via-orange-700',
      text: 'text-orange-500',
      icon: 'text-orange-500',
      flame: false,
    },
  }[medal]

  return (
    <div className={`w-full md:w-1/3 flex flex-col items-center group ${tall ? 'order-first md:order-none mb-8 md:mb-0 md:-mt-10' : ''}`}>
      {tall && (
        <div className="mb-4 animate-bounce">
          <Flame className="w-8 h-8 text-amber-500 drop-shadow-[0_0_15px_rgba(245,158,11,0.8)]" />
        </div>
      )}
      <div
        className={`glass-card w-full border ${styles.border} bg-gradient-to-b ${styles.bg} p-6 rounded-t-3xl rounded-b-xl flex flex-col items-center relative overflow-hidden transition-all group-hover:-translate-y-2`}
      >
        <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent ${styles.line} to-transparent`} />
        <div
          className={`${tall ? 'w-24 h-24 text-4xl' : 'w-20 h-20 text-3xl'} rounded-full bg-gradient-to-br from-gray-200 to-gray-500 flex items-center justify-center font-black text-[#0a0f1c] shadow-lg mb-4 border-4 border-[#0a0f1c] relative z-10 overflow-hidden`}
        >
          {user.avatar_url ? (
            <img src={user.avatar_url} alt={user.username ?? ''} className="w-full h-full object-cover" />
          ) : (
            user.username?.charAt(0).toUpperCase() || 'U'
          )}
          <div className="absolute -bottom-2 -right-2 bg-[#0a0f1c] rounded-full p-1 border border-gray-400">
            <Medal className={`w-4 h-4 ${styles.icon}`} />
          </div>
        </div>
        <span className={`font-black text-5xl ${styles.text} mb-2`}>#{rank}</span>
        <h3 className="font-bold text-white text-lg mb-1 text-center">{user.username}</h3>
        <div className={`font-black font-mono ${tall ? 'text-4xl' : 'text-3xl'} ${styles.text} flex items-center gap-1`}>
          {points} <span className="text-xs opacity-50 uppercase tracking-widest font-bold">PTS</span>
        </div>
      </div>
      {tall && (
        <div className="w-full h-16 bg-gradient-to-b from-amber-500/20 to-transparent rounded-b-3xl border-x border-b border-amber-500/30 flex items-center justify-center">
          <Zap className="w-6 h-6 text-amber-500 animate-pulse" />
        </div>
      )}
    </div>
  )
}
