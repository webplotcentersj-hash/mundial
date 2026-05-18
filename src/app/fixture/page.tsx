'use client'

import { useState, useEffect, useMemo } from 'react'
import { groupColors } from '@/lib/mockData'
import { MapPin, X, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { getMatches } from '@/lib/actions'
import { parseToLocalDateKey, toLocalDateKey } from '@/lib/localDateKey'
import { cn } from '@/lib/utils'

const generateCalendarDays = (year: number, month: number) => {
  const date = new Date(year, month, 1)
  const days = []

  const firstDay = date.getDay()
  for (let i = 0; i < firstDay; i++) {
    days.push(null)
  }

  while (date.getMonth() === month) {
    days.push(new Date(date))
    date.setDate(date.getDate() + 1)
  }
  return days
}

const JuneDays = generateCalendarDays(2026, 5)
const JulyDays = generateCalendarDays(2026, 6)

const weekDays = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB']

export default function FixtureCalendarPage() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [matches, setMatches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadMatches() {
      const data = await getMatches()
      const mapped = (data || []).map((m) => ({
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
      setMatches(mapped)
      setLoading(false)
    }
    loadMatches()
  }, [])

  const matchesByDate = useMemo(() => {
    return matches.reduce(
      (acc, match) => {
        const dateStr = parseToLocalDateKey(match.date)
        if (!acc[dateStr]) acc[dateStr] = []
        acc[dateStr].push(match)
        return acc
      },
      {} as Record<string, any[]>,
    )
  }, [matches])

  const renderCalendar = (monthName: string, days: (Date | null)[]) => (
    <div
      className={cn(
        'relative overflow-hidden border-[3px] border-[#111] bg-white p-5 shadow-[8px_8px_0_#111] sm:p-6',
        'font-[family-name:var(--font-store-sans)]',
      )}
    >
      <h2 className="mb-5 border-b-2 border-[#111] pb-3 text-xl font-black uppercase tracking-wide text-[#111] sm:text-2xl [font-family:var(--font-store-display),sans-serif]">
        {monthName} 2026
      </h2>

      <div className="mb-3 grid grid-cols-7 gap-2">
        {weekDays.map((day) => (
          <div key={day} className="text-center text-[10px] font-bold uppercase tracking-widest text-[#555] sm:text-xs">
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
              type="button"
              disabled={!hasMatches}
              onClick={() => hasMatches && setSelectedDate(dateStr)}
              className={cn(
                'group relative flex aspect-square flex-col items-center justify-between overflow-hidden rounded-lg border-2 p-1 transition-all sm:rounded-xl sm:p-2',
                hasMatches
                  ? 'cursor-pointer border-[#111] bg-[#fafafa] shadow-[2px_2px_0_#ccc] hover:-translate-x-px hover:-translate-y-px hover:bg-[#fffff0] hover:shadow-[4px_4px_0_#111]'
                  : 'cursor-not-allowed border-transparent bg-[#f0f0f0] opacity-45',
                isSelected && 'bg-[#ccff00] ring-2 ring-[#111] ring-offset-2 ring-offset-[#f8f8f8] shadow-[4px_4px_0_#111]',
              )}
            >
              {hasMatches && (
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#EB671B]/[0.07] to-transparent opacity-70" />
              )}

              <span
                className={cn(
                  'z-10 text-xs font-black sm:text-lg',
                  hasMatches ? 'text-[#111]' : 'text-[#999]',
                )}
              >
                {date.getDate()}
              </span>

              {hasMatches && (
                <div className="z-10 mt-auto flex w-full flex-wrap items-center justify-center gap-0.5 sm:gap-1">
                  {dayMatches.slice(0, 4).map((m: any, idx: number) => (
                    <div
                      key={idx}
                      className="relative h-2 w-2 overflow-hidden rounded-full border border-[#111]/25 bg-white sm:h-3 sm:w-3"
                      title={`${m.homeTeam.name} vs ${m.awayTeam.name}`}
                    >
                      {m.homeTeam.code !== 'tbd' && (
                        <Image
                          unoptimized
                          src={`https://flagcdn.com/${m.homeTeam.code}.svg`}
                          alt="flag"
                          fill
                          className="object-cover opacity-90"
                        />
                      )}
                    </div>
                  ))}
                  {dayMatches.length > 4 && (
                    <span className="text-[8px] font-black text-[#111]/60">+{dayMatches.length - 4}</span>
                  )}
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
    <div className="min-h-[calc(100vh-4rem)] w-full max-w-[100vw] overflow-x-hidden px-4 py-8 text-[#111] md:px-8 md:py-10">
      <div className="relative z-10 mx-auto max-w-7xl font-[family-name:var(--font-store-sans)]">
        <div className="mb-8 text-center sm:text-left">
          <h1 className="text-3xl font-black uppercase tracking-tight text-[#111] md:text-4xl [font-family:var(--font-store-display),sans-serif]">
            Fixture mundial
          </h1>
          <p className="mt-2 max-w-xl text-base font-medium text-[#444]">
            Calendario de partidos. Tocá un día con partidos para ver horarios y sedes.
          </p>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-[#111]" aria-hidden />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {renderCalendar('Junio', JuneDays)}
            {renderCalendar('Julio', JulyDays)}
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedDate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-x-0 bottom-0 top-16 z-[60] flex justify-end bg-[#111]/40 backdrop-blur-[2px] sm:p-4"
            onClick={() => setSelectedDate(null)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              className={cn(
                'relative flex h-full w-full flex-col overflow-hidden border-[#111] bg-white font-[family-name:var(--font-store-sans)]',
                'shadow-[-12px_0_40px_rgba(0,0,0,0.12)] sm:max-h-full sm:w-[min(100vw,500px)] sm:rounded-2xl sm:border-[3px] sm:shadow-[8px_8px_0_#111]',
              )}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative z-10 flex items-center justify-between gap-3 border-b-2 border-[#111] p-5 sm:p-6">
                <div>
                  <h3 className="text-xl font-black uppercase tracking-wide text-[#111] sm:text-2xl [font-family:var(--font-store-display),sans-serif]">
                    Partidos
                  </h3>
                  <p className="mt-1 text-sm font-bold uppercase tracking-wider text-[#5d3fd3]">
                    {new Date(selectedDate + 'T12:00:00').toLocaleDateString('es-ES', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                    })}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedDate(null)}
                  className={cn(
                    'shrink-0 rounded-full border-2 border-[#111] bg-white p-2.5 text-[#111]',
                    'shadow-[2px_2px_0_#bbb] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#111]',
                  )}
                  aria-label="Cerrar"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="relative z-10 flex-1 space-y-4 overflow-y-auto bg-[#f8f8f8] p-5 sm:p-6">
                {selectedMatches.map((match: any) => {
                  const groupColorClass = groupColors[match.homeTeam.group] || 'from-gray-500 to-gray-700'
                  const kickoff = new Date(match.date)
                  const timeStr = kickoff.toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false,
                  })
                  return (
                    <div
                      key={match.id}
                      className={cn(
                        'relative overflow-hidden rounded-xl border-2 border-[#ddd] bg-white p-4 transition-all',
                        'hover:border-[#111] hover:shadow-[3px_3px_0_#111]',
                      )}
                    >
                      <div className={cn('absolute bottom-4 left-0 top-4 w-1 rounded-r-full bg-gradient-to-b', groupColorClass)} />

                      <div className="mb-4 flex items-center justify-between px-2">
                        <span
                          className={cn(
                            'rounded border border-[#111] px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-white shadow-sm',
                            `bg-gradient-to-r ${groupColorClass}`,
                          )}
                        >
                          {match.homeTeam.group === 'KO' ? match.stage : `Grupo ${match.homeTeam.group}`}
                        </span>
                        <span className="font-mono text-xs font-bold text-[#444]">{timeStr} hs</span>
                      </div>

                      <div className="flex items-center justify-between gap-4 px-2">
                        <div className="flex flex-1 flex-col items-center gap-2">
                          <div className="relative h-8 w-12 overflow-hidden rounded border-2 border-[#111] bg-white shadow-sm">
                            {match.homeTeam.code === 'tbd' ? (
                              <span className="flex h-full items-center justify-center text-xs font-black text-[#999]">?</span>
                            ) : (
                              <Image
                                unoptimized
                                src={`https://flagcdn.com/${match.homeTeam.code}.svg`}
                                alt="flag"
                                fill
                                className="object-cover"
                              />
                            )}
                          </div>
                          <span className="text-center text-xs font-bold leading-tight text-[#111] sm:text-sm">
                            {match.homeTeam.name}
                          </span>
                        </div>

                        <div
                          className={cn(
                            'rounded-lg border-2 border-[#111] bg-[#fafafa] px-3 py-2 font-mono text-sm font-black text-[#111]',
                            'shadow-[2px_2px_0_#ccc]',
                          )}
                        >
                          {match.status === 'finished'
                            ? `${match.homeScore} - ${match.awayScore}`
                            : 'vs'}
                        </div>

                        <div className="flex flex-1 flex-col items-center gap-2">
                          <div className="relative h-8 w-12 overflow-hidden rounded border-2 border-[#111] bg-white shadow-sm">
                            {match.awayTeam.code === 'tbd' ? (
                              <span className="flex h-full items-center justify-center text-xs font-black text-[#999]">?</span>
                            ) : (
                              <Image
                                unoptimized
                                src={`https://flagcdn.com/${match.awayTeam.code}.svg`}
                                alt="flag"
                                fill
                                className="object-cover"
                              />
                            )}
                          </div>
                          <span className="text-center text-xs font-bold leading-tight text-[#111] sm:text-sm">
                            {match.awayTeam.name}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-center gap-1.5 border-t-2 border-dashed border-[#ddd] pt-3">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-[#EB671B]" aria-hidden />
                        <span className="text-center text-[11px] font-medium text-[#555]">{match.venue}</span>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="border-t-2 border-[#111] bg-white p-4 sm:p-5">
                <button
                  type="button"
                  onClick={() => setSelectedDate(null)}
                  className="btn-secondary hover-lift w-full py-3 text-center [font-family:var(--font-store-display),sans-serif]"
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
