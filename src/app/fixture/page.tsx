'use client'

import { useState, useEffect, useMemo } from 'react'
import { groupColors } from '@/lib/mockData'
import { MapPin, X, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { getMatches } from '@/lib/actions'
import { parseToLocalDateKey, toLocalDateKey } from '@/lib/localDateKey'

const generateCalendarDays = (year: number, month: number) => {
  const date = new Date(year, month, 1)
  const days = []
  
  // Fill empty slots for first week
  const firstDay = date.getDay() // 0 = Sun, 1 = Mon
  for (let i = 0; i < firstDay; i++) {
    days.push(null)
  }
  
  while (date.getMonth() === month) {
    days.push(new Date(date))
    date.setDate(date.getDate() + 1)
  }
  return days
}

const JuneDays = generateCalendarDays(2026, 5) // Month is 0-indexed, 5 = June
const JulyDays = generateCalendarDays(2026, 6) // 6 = July

const weekDays = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB']

export default function FixtureCalendarPage() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [matches, setMatches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadMatches() {
      const data = await getMatches()
      const mapped = (data || []).map(m => ({
        ...m,
        homeScore: m.home_score,
        awayScore: m.away_score,
        homeTeam: m.homeTeam ? { ...m.homeTeam, group: m.homeTeam.group_id } : { name: 'Por definir', code: 'tbd', group: 'KO' },
        awayTeam: m.awayTeam ? { ...m.awayTeam, group: m.awayTeam.group_id } : { name: 'Por definir', code: 'tbd', group: 'KO' },
      }))
      setMatches(mapped)
      setLoading(false)
    }
    loadMatches()
  }, [])

  const matchesByDate = useMemo(() => {
    return matches.reduce((acc, match) => {
      const dateStr = parseToLocalDateKey(match.date)
      if (!acc[dateStr]) acc[dateStr] = []
      acc[dateStr].push(match)
      return acc
    }, {} as Record<string, any[]>)
  }, [matches])


  const renderCalendar = (monthName: string, days: (Date | null)[]) => (
    <div className="bg-[#0a0f1c]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />
      <h2 className="text-2xl font-black text-white mb-6 uppercase tracking-widest pl-2">{monthName} 2026</h2>
      
      <div className="grid grid-cols-7 gap-2 mb-4">
        {weekDays.map(day => (
          <div key={day} className="text-center text-xs font-bold text-white/40 tracking-wider">
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-2 sm:gap-3">
        {days.map((date, i) => {
          if (!date) return <div key={`empty-${i}`} className="aspect-square" />
          
          const dateStr = toLocalDateKey(date)
          const dayMatches = matchesByDate[dateStr] || []
          const hasMatches = dayMatches.length > 0
          const isSelected = selectedDate === dateStr
          
          return (
            <button
              key={i}
              disabled={!hasMatches}
              onClick={() => hasMatches && setSelectedDate(dateStr)}
              className={`aspect-square rounded-xl flex flex-col items-center justify-between p-1 sm:p-2 transition-all relative overflow-hidden group
                ${hasMatches ? 'cursor-pointer border border-white/10 hover:border-primary/50 shadow-lg' : 'opacity-30'}
                ${isSelected ? 'bg-primary/20 border-primary ring-1 ring-primary' : (hasMatches ? 'bg-white/5 hover:bg-white/10' : 'bg-transparent')}
              `}
            >
              {/* Highlight match days */}
              {hasMatches && <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-50" />}
              
              <span className={`text-xs sm:text-lg font-bold z-10 ${hasMatches ? 'text-white' : 'text-white/40'}`}>
                {date.getDate()}
              </span>
              
              {hasMatches && (
                <div className="flex flex-wrap items-center justify-center gap-0.5 sm:gap-1 z-10 w-full mt-auto">
                  {dayMatches.slice(0, 4).map((m: any, idx: number) => (
                    <div key={idx} className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-white/20 overflow-hidden relative" title={`${m.homeTeam.name} vs ${m.awayTeam.name}`}>
                      {m.homeTeam.code !== 'tbd' && <Image unoptimized src={`https://flagcdn.com/${m.homeTeam.code}.svg`} alt="flag" fill className="object-cover opacity-80" />}
                    </div>
                  ))}
                  {dayMatches.length > 4 && <span className="text-[8px] font-bold text-white/50">+{dayMatches.length - 4}</span>}
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )

  const selectedMatches = selectedDate ? matchesByDate[selectedDate] : []

  return (
    <div className="min-h-screen w-full bg-transparent relative font-outfit p-4 lg:p-8 pt-24 -mt-16">
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />
      <div className="fixed top-0 left-0 w-full h-[400px] bg-gradient-to-b from-primary/10 to-transparent blur-[50px] -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 pt-4">
        {loading ? (
          <div className="flex justify-center items-center h-64">
             <Loader2 className="w-10 h-10 text-primary animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {renderCalendar('Junio', JuneDays)}
            {renderCalendar('Julio', JulyDays)}
          </div>
        )}
      </div>

      {/* MATCH DETAILS MODAL */}
      <AnimatePresence>
        {selectedDate && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm sm:p-4"
            onClick={() => setSelectedDate(null)}
          >
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="bg-[#0a0f1c]/95 backdrop-blur-2xl border-l border-white/10 w-full sm:w-[500px] h-full sm:rounded-[2rem] shadow-2xl flex flex-col relative overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
              
              <div className="flex items-center justify-between p-6 border-b border-white/10 relative z-10">
                <div>
                  <h3 className="text-2xl font-black text-white tracking-widest">PARTIDOS</h3>
                  <p className="text-primary font-bold text-sm tracking-widest uppercase mt-1">
                    {new Date(selectedDate + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </p>
                </div>
                <button onClick={() => setSelectedDate(null)} className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
                  <X className="w-6 h-6 text-white/50 hover:text-white" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4 relative z-10">
                {selectedMatches.map((match: any) => {
                  const groupColorClass = groupColors[match.homeTeam.group] || 'from-gray-500 to-gray-700'
                  const kickoff = new Date(match.date)
                  const timeStr = kickoff.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false })
                  return (
                    <div key={match.id} className="relative bg-black/40 hover:bg-black/60 p-4 rounded-2xl border border-white/10 transition-colors group">
                      <div className={`absolute left-0 top-4 bottom-4 w-1 rounded-r-full bg-gradient-to-b ${groupColorClass}`} />
                      
                      <div className="flex items-center justify-between mb-4 px-2">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest bg-gradient-to-r ${groupColorClass} bg-opacity-20 text-white shadow-lg`}>
                          {match.homeTeam.group === 'KO' ? match.stage : `GRUPO ${match.homeTeam.group}`}
                        </span>
                        <span className="text-xs font-mono text-white/40">{timeStr} hs</span>
                      </div>

                      <div className="flex items-center justify-between px-2 gap-4">
                        <div className="flex flex-col items-center gap-2 flex-1">
                          <div className="w-12 h-8 rounded relative overflow-hidden shadow-md border border-white/10">
                            {match.homeTeam.code === 'tbd' ? <span className="m-auto text-white/30 text-xs font-bold pt-1">?</span> : <Image unoptimized src={`https://flagcdn.com/${match.homeTeam.code}.svg`} alt="flag" fill className="object-cover" />}
                          </div>
                          <span className="text-sm font-bold text-white text-center leading-tight">{match.homeTeam.name}</span>
                        </div>
                        
                        <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 font-mono font-bold text-white">
                          {match.status === 'finished' ? `${match.homeScore} - ${match.awayScore}` : 'VS'}
                        </div>

                        <div className="flex flex-col items-center gap-2 flex-1">
                          <div className="w-12 h-8 rounded relative overflow-hidden shadow-md border border-white/10">
                            {match.awayTeam.code === 'tbd' ? <span className="m-auto text-white/30 text-xs font-bold pt-1">?</span> : <Image unoptimized src={`https://flagcdn.com/${match.awayTeam.code}.svg`} alt="flag" fill className="object-cover" />}
                          </div>
                          <span className="text-sm font-bold text-white text-center leading-tight">{match.awayTeam.name}</span>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-center gap-1.5 pt-3 border-t border-white/5">
                        <MapPin className="w-3 h-3 text-primary/50" />
                        <span className="text-[11px] text-white/50">{match.venue}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
