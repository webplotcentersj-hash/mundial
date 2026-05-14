'use client'

import { useState, useEffect } from 'react'
import { Trophy, Medal, ArrowUpRight, Flame, Shield, Zap, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { getRanking } from '@/lib/actions'

export default function RankingPage() {
  const [sortedUsers, setSortedUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRanking() {
      const data = await getRanking()
      setSortedUsers(data || [])
      setLoading(false)
    }
    fetchRanking()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center pt-24">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    )
  }

  if (sortedUsers.length === 0) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center pt-24 text-white">
        No hay perfiles registrados aún.
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-transparent relative font-outfit p-4 lg:p-8 pt-24 -mt-16 w-full">
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />
      <div className="fixed top-0 left-0 w-full h-[500px] bg-amber-900/10 rounded-b-[100%] blur-[100px] -z-10 pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        
        {/* HEADER */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shadow-[0_0_50px_rgba(245,158,11,0.2)] mb-6">
            <Trophy className="w-10 h-10 text-amber-500 drop-shadow-[0_0_15px_rgba(245,158,11,0.8)]" />
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-500 to-amber-200 tracking-widest mb-4">
            RANKING GLOBAL
          </h1>
          <p className="text-amber-500/60 font-bold tracking-widest uppercase text-sm">
            Los mejores pronosticadores del mundo
          </p>
        </motion.div>

        {/* PODIO: solo columnas para los puestos que existan (no rompe con 1 o 2 usuarios) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col md:flex-row items-end justify-center gap-4 lg:gap-8 mb-20 pt-10 px-4"
        >
          {sortedUsers.length >= 2 && (
          <div className="w-full md:w-1/3 flex flex-col items-center group">
            <div className="glass-card w-full border border-gray-300/30 bg-gradient-to-b from-gray-300/10 to-transparent p-6 rounded-t-3xl rounded-b-xl flex flex-col items-center relative overflow-hidden transition-all group-hover:-translate-y-2 group-hover:shadow-[0_0_30px_rgba(209,213,219,0.2)]">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-200 to-gray-500 flex items-center justify-center font-black text-3xl text-[#0a0f1c] shadow-lg mb-4 border-4 border-[#0a0f1c] relative z-10 overflow-hidden">
                {sortedUsers[1].avatar_url ? (
                  <img src={sortedUsers[1].avatar_url} alt={sortedUsers[1].username} className="w-full h-full object-cover" />
                ) : (
                  sortedUsers[1].username?.charAt(0).toUpperCase() || 'U'
                )}
                <div className="absolute -bottom-2 -right-2 bg-[#0a0f1c] rounded-full p-1 border border-gray-400">
                  <Medal className="w-4 h-4 text-gray-300" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-1">{sortedUsers[1].username}</h3>
              <div className="flex items-center gap-2 text-gray-300 font-black text-3xl mt-2 drop-shadow-md">
                {sortedUsers[1].total_points} <span className="text-xs text-gray-300/50 uppercase tracking-widest font-bold">PTS</span>
              </div>
            </div>
            <div className="w-full h-24 bg-gray-300/20 border-x border-t border-gray-300/30 rounded-t-xl flex items-start justify-center pt-4 mt-2 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
              <span className="text-5xl font-black text-gray-300/40">2</span>
            </div>
          </div>
          )}

          {sortedUsers.length >= 1 && (
          <div className="w-full md:w-1/3 flex flex-col items-center z-10 -mb-8 group">
            <div className="glass-card w-full border border-amber-400/50 bg-gradient-to-b from-amber-500/20 to-[#0a0f1c]/80 p-8 rounded-t-[2.5rem] rounded-b-2xl flex flex-col items-center relative overflow-hidden transition-all group-hover:-translate-y-4 group-hover:shadow-[0_0_60px_rgba(245,158,11,0.3)] shadow-[0_0_40px_rgba(245,158,11,0.15)]">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-amber-500/20 rounded-full blur-[40px]" />
              
              <div className="absolute top-4 right-4 bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-amber-500/30 flex items-center gap-1 animate-pulse">
                <Flame className="w-3 h-3" /> MVP
              </div>

              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-amber-200 via-amber-500 to-amber-700 flex items-center justify-center font-black text-5xl text-[#0a0f1c] shadow-[0_10px_30px_rgba(245,158,11,0.5)] mb-6 border-4 border-[#0a0f1c] ring-4 ring-amber-500/30 relative z-10 overflow-hidden">
                {sortedUsers[0].avatar_url ? (
                  <img src={sortedUsers[0].avatar_url} alt={sortedUsers[0].username} className="w-full h-full object-cover" />
                ) : (
                  sortedUsers[0].username?.charAt(0).toUpperCase() || 'U'
                )}
                <div className="absolute -bottom-3 bg-[#0a0f1c] rounded-full p-2 border-2 border-amber-500 shadow-xl">
                  <Trophy className="w-6 h-6 text-amber-400" />
                </div>
              </div>
              <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-amber-200 mb-2">{sortedUsers[0].username}</h3>
              <div className="flex items-center gap-2 text-amber-400 font-black text-5xl mt-2 drop-shadow-[0_0_15px_rgba(245,158,11,0.8)]">
                {sortedUsers[0].total_points} <span className="text-sm text-amber-500/50 uppercase tracking-widest font-bold">PTS</span>
              </div>
            </div>
            <div className="w-full h-40 bg-gradient-to-t from-amber-500/10 to-amber-500/30 border-x border-t border-amber-500/50 rounded-t-2xl flex items-start justify-center pt-6 mt-2 shadow-[0_-10px_30px_rgba(245,158,11,0.2)] relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
              <div className="absolute inset-0 bg-gradient-to-b from-amber-300/10 to-transparent" />
              <span className="text-7xl font-black text-amber-400/80 drop-shadow-xl relative z-10">1</span>
            </div>
          </div>
          )}

          {sortedUsers.length >= 3 && (
          <div className="w-full md:w-1/3 flex flex-col items-center group">
            <div className="glass-card w-full border border-orange-700/50 bg-gradient-to-b from-orange-800/20 to-transparent p-6 rounded-t-3xl rounded-b-xl flex flex-col items-center relative overflow-hidden transition-all group-hover:-translate-y-2 group-hover:shadow-[0_0_30px_rgba(194,65,12,0.2)]">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-600 to-transparent" />
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-orange-700 flex items-center justify-center font-black text-3xl text-[#0a0f1c] shadow-lg mb-4 border-4 border-[#0a0f1c] relative z-10 overflow-hidden">
                {sortedUsers[2].avatar_url ? (
                  <img src={sortedUsers[2].avatar_url} alt={sortedUsers[2].username} className="w-full h-full object-cover" />
                ) : (
                  sortedUsers[2].username?.charAt(0).toUpperCase() || 'U'
                )}
                <div className="absolute -bottom-2 -right-2 bg-[#0a0f1c] rounded-full p-1 border border-orange-600">
                  <Medal className="w-4 h-4 text-orange-500" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-1">{sortedUsers[2].username}</h3>
              <div className="flex items-center gap-2 text-orange-500 font-black text-3xl mt-2 drop-shadow-md">
                {sortedUsers[2].total_points} <span className="text-xs text-orange-500/50 uppercase tracking-widest font-bold">PTS</span>
              </div>
            </div>
            <div className="w-full h-16 bg-orange-900/40 border-x border-t border-orange-700/50 rounded-t-xl flex items-center justify-center mt-2 relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
              <span className="text-4xl font-black text-orange-500/40">3</span>
            </div>
          </div>
          )}
        </motion.div>

        {/* REST OF THE RANKING */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card rounded-3xl border border-white/10 overflow-hidden bg-[#0a0f1c]/80 backdrop-blur-xl relative"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          
          <div className="grid grid-cols-12 gap-4 p-6 border-b border-white/5 bg-white/5 text-xs font-black text-white/40 uppercase tracking-widest">
            <div className="col-span-2 text-center">Pos</div>
            <div className="col-span-6 md:col-span-7">Competidor</div>
            <div className="col-span-4 md:col-span-3 text-right pr-4">Puntos</div>
          </div>

          <div className="divide-y divide-white/5">
            {sortedUsers.slice(3).map((user, index) => {
              const pos = index + 4; // Start at 4
              return (
                <div key={user.id} className="grid grid-cols-12 gap-4 p-4 md:p-6 items-center hover:bg-white/5 transition-colors group">
                  <div className="col-span-2 flex justify-center">
                    <span className="font-black text-xl text-white/30 group-hover:text-white/70 transition-colors">#{pos}</span>
                  </div>
                  
                  <div className="col-span-6 md:col-span-7 flex items-center gap-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-white flex items-center justify-center font-black text-lg border border-white/10 shadow-inner overflow-hidden">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
                      ) : (
                        user.username?.charAt(0).toUpperCase() || 'U'
                      )}
                    </div>
                    <div>
                      <span className="font-bold text-white/90 text-lg md:text-xl block">{user.username}</span>
                      {/* Random simulated badges for visual flair */}
                      <div className="flex gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         {pos % 2 === 0 && <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded border border-green-500/30 flex items-center gap-1"><ArrowUpRight className="w-3 h-3"/> En Racha</span>}
                         {pos === 4 && <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded border border-blue-500/30 flex items-center gap-1"><Shield className="w-3 h-3"/> Defensor</span>}
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-span-4 md:col-span-3 text-right pr-2 md:pr-4">
                    <div className="flex flex-col items-end">
                      <span className="text-2xl md:text-3xl font-black font-mono text-white/90 drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
                        {user.total_points}
                      </span>
                      <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest mt-0.5">Puntos Totales</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
