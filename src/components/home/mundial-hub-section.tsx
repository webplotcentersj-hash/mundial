'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Calendar, Clock, Globe2, MapPin, Timer, Trophy, Users } from 'lucide-react'
import { getHomeMundialSnapshot, type HomeMundialSnapshot } from '@/lib/actions'
import {
  flagCodeForCdn,
  formatMundialDate,
  formatMundialTime,
  type MundialMatchPreview,
} from '@/lib/world-cup-2026'

type Countdown = {
  days: number
  hours: number
  minutes: number
  seconds: number
  done: boolean
}

function computeCountdown(targetIso: string): Countdown {
  const diff = Date.parse(targetIso) - Date.now()
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true }
  }
  const totalSeconds = Math.floor(diff / 1000)
  const days = Math.floor(totalSeconds / 86_400)
  const hours = Math.floor((totalSeconds % 86_400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return { days, hours, minutes, seconds, done: false }
}

function pad(n: number) {
  return String(n).padStart(2, '0')
}

function MatchFlags({ match }: { match: MundialMatchPreview }) {
  return (
    <div className="flex items-center justify-center gap-3">
      <Image
        unoptimized
        src={`https://flagcdn.com/w80/${flagCodeForCdn(match.homeCode)}.png`}
        alt={match.homeName}
        width={48}
        height={36}
        className="rounded border border-[#111]/10 object-cover shadow-sm"
      />
      <span className="text-xs font-bold uppercase tracking-widest text-[#888]">vs</span>
      <Image
        unoptimized
        src={`https://flagcdn.com/w80/${flagCodeForCdn(match.awayCode)}.png`}
        alt={match.awayName}
        width={48}
        height={36}
        className="rounded border border-[#111]/10 object-cover shadow-sm"
      />
    </div>
  )
}

export function MundialHubSection({
  onSnapshotChange,
}: {
  onSnapshotChange?: (snapshot: HomeMundialSnapshot) => void
}) {
  const [snapshot, setSnapshot] = useState<HomeMundialSnapshot | null>(null)
  const [countdown, setCountdown] = useState<Countdown>(() =>
    computeCountdown('2026-06-11T15:00:00Z'),
  )
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null)
  const onSnapshotChangeRef = useRef(onSnapshotChange)
  onSnapshotChangeRef.current = onSnapshotChange

  useEffect(() => {
    async function load() {
      try {
        const data = await getHomeMundialSnapshot()
        setSnapshot(data)
        onSnapshotChangeRef.current?.(data)
        setUpdatedAt(new Date())
      } catch {
        /* fallback silencioso */
      }
    }
    load()
    const id = setInterval(load, 60_000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const target = snapshot?.kickoffIso ?? '2026-06-11T15:00:00Z'
    const tick = () => setCountdown(computeCountdown(target))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [snapshot?.kickoffIso])

  const phase = snapshot?.phase ?? 'pre'
  const facts = snapshot?.facts
  const nextMatch = snapshot?.nextMatch
  const argMatch = snapshot?.argentinaMatch

  return (
    <section className="trending-section mundial-hub-section">
      <div className="container">
        <div className="trending-header flex-wrap gap-3">
          <div>
            <h3>Mundial FIFA 2026</h3>
            <p className="mt-1 text-sm text-[#555] font-[family-name:var(--font-store-sans)]">
              USA · México · Canadá — 48 selecciones, 104 partidos oficiales
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#888] font-[family-name:var(--font-store-sans)]">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-600" />
            </span>
            {updatedAt
              ? `Actualizado ${updatedAt.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}`
              : 'Conectando…'}
          </div>
        </div>

        {phase === 'pre' && (
          <div className="mundial-countdown-banner mb-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#EB671B] mb-1">
                  Cuenta regresiva al inaugural
                </p>
                <p className="text-sm text-[#555] font-[family-name:var(--font-store-sans)]">
                  México vs Sudáfrica · 11 jun · Estadio Ciudad de México
                </p>
              </div>
              <div className="mundial-countdown-digits" aria-live="polite">
                <div className="mundial-countdown-unit">
                  <span className="mundial-countdown-value">{countdown.days}</span>
                  <span className="mundial-countdown-label">días</span>
                </div>
                <span className="mundial-countdown-sep">:</span>
                <div className="mundial-countdown-unit">
                  <span className="mundial-countdown-value">{pad(countdown.hours)}</span>
                  <span className="mundial-countdown-label">hs</span>
                </div>
                <span className="mundial-countdown-sep">:</span>
                <div className="mundial-countdown-unit">
                  <span className="mundial-countdown-value">{pad(countdown.minutes)}</span>
                  <span className="mundial-countdown-label">min</span>
                </div>
                <span className="mundial-countdown-sep">:</span>
                <div className="mundial-countdown-unit">
                  <span className="mundial-countdown-value">{pad(countdown.seconds)}</span>
                  <span className="mundial-countdown-label">seg</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {phase === 'live' && (
          <div className="mundial-countdown-banner mb-6 border-emerald-600/30 bg-emerald-50">
            <p className="text-sm font-bold uppercase tracking-widest text-emerald-800">
              ⚽ Mundial en curso — seguí resultados, fixture y tu prode en tiempo real
            </p>
          </div>
        )}

        <div className="product-grid">
          <article className="product-card hover-lift cursor-default">
            <div className="product-image flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-green-50 to-white p-4 !h-auto min-h-[200px]">
              <Calendar className="w-10 h-10 text-emerald-700" aria-hidden />
              {nextMatch ? (
                <>
                  <MatchFlags match={nextMatch} />
                  <p className="text-center text-sm font-bold text-[#111] leading-snug">
                    {nextMatch.homeName} vs {nextMatch.awayName}
                  </p>
                </>
              ) : (
                <p className="text-sm font-bold text-[#111]">Próximo partido</p>
              )}
            </div>
            <h4>Próximo partido</h4>
            {nextMatch ? (
              <p className="text-sm text-[#555] leading-relaxed">
                <strong>{formatMundialDate(nextMatch.date)}</strong> · {formatMundialTime(nextMatch.date)} hs (ARG)
                {nextMatch.stage ? ` · ${nextMatch.stage}` : ''}
                {nextMatch.venue ? (
                  <>
                    <br />
                    <MapPin className="inline w-3.5 h-3.5 mr-0.5 -mt-0.5" aria-hidden />
                    {nextMatch.venue}
                  </>
                ) : null}
              </p>
            ) : (
              <p className="text-sm text-[#555]">Cargando fixture…</p>
            )}
            <Link href="/fixture" className="inline-block mt-2 text-xs font-bold underline">
              Ver calendario completo
            </Link>
          </article>

          <article className="product-card hover-lift cursor-default">
            <div className="product-image flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-sky-50 to-white p-4 !h-auto min-h-[200px]">
              <Globe2 className="w-10 h-10 text-sky-700" aria-hidden />
              {argMatch ? <MatchFlags match={argMatch} /> : null}
            </div>
            <h4>Argentina en el Mundial</h4>
            {argMatch ? (
              <p className="text-sm text-[#555] leading-relaxed">
                Campeón defensor: debut{' '}
                <strong>
                  {formatMundialDate(argMatch.date)} · {formatMundialTime(argMatch.date)} hs
                </strong>{' '}
                vs {argMatch.homeCode === 'ar' ? argMatch.awayName : argMatch.homeName}.
                {argMatch.venue ? (
                  <>
                    {' '}
                    Sede: {argMatch.venue}.
                  </>
                ) : null}
              </p>
            ) : (
              <p className="text-sm text-[#555]">Grupo J — buscando fixture…</p>
            )}
          </article>

          <article className="product-card hover-lift cursor-default">
            <div className="product-image flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-amber-50 to-white p-4 !h-auto min-h-[200px]">
              <Trophy className="w-10 h-10 text-amber-600" aria-hidden />
              <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-center tabular-nums">
                <div>
                  <div className="text-2xl font-black text-[#111]">{facts?.teams ?? 48}</div>
                  <div className="text-[10px] uppercase tracking-wider text-[#888]">Selecciones</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-[#111]">{facts?.matches ?? 104}</div>
                  <div className="text-[10px] uppercase tracking-wider text-[#888]">Partidos</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-[#111]">{facts?.groups ?? 12}</div>
                  <div className="text-[10px] uppercase tracking-wider text-[#888]">Grupos</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-[#111]">{facts?.venues ?? 16}</div>
                  <div className="text-[10px] uppercase tracking-wider text-[#888]">Sedes</div>
                </div>
              </div>
            </div>
            <h4>La Copa en cifras</h4>
            <p className="text-sm text-[#555] leading-relaxed">
              Primera Copa de 48 equipos. Final el{' '}
              <strong>{formatMundialDate('2026-07-19T19:00:00Z')}</strong> en {facts?.finalVenue ?? 'MetLife Stadium'}.
              Fase de grupos del 11 jun al 27 jun; eliminatorias hasta la final del 19 jul.
            </p>
          </article>

          <article className="product-card hover-lift cursor-default">
            <div className="product-image flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-orange-50 to-white p-4 !h-auto min-h-[200px]">
              <Users className="w-10 h-10 text-[#EB671B]" aria-hidden />
              <div className="grid grid-cols-1 gap-2 w-full max-w-[200px] text-center tabular-nums">
                <div>
                  <div className="text-3xl font-black text-[#111]">
                    {(snapshot?.playerCount ?? 0).toLocaleString('es-AR')}
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-[#888]">Jugadores en Plot</div>
                </div>
                <div className="flex justify-center gap-6 text-sm">
                  <div>
                    <div className="font-black text-[#111]">
                      {(snapshot?.predictionCount ?? 0).toLocaleString('es-AR')}
                    </div>
                    <div className="text-[10px] uppercase text-[#888]">Pronósticos</div>
                  </div>
                  <div>
                    <div className="font-black text-[#111]">
                      {(snapshot?.leagueCount ?? 0).toLocaleString('es-AR')}
                    </div>
                    <div className="text-[10px] uppercase text-[#888]">Ligas</div>
                  </div>
                </div>
              </div>
            </div>
            <h4>Prode en vivo</h4>
            <p className="text-sm text-[#555] leading-relaxed">
              <strong>3 pts</strong> marcador exacto · <strong>1 pt</strong> ganador o empate. Creá ligas privadas,
              armá tu llave y competí en el ranking global antes de que arranque la Copa.
            </p>
            <Link href="/login" className="inline-block mt-2 text-xs font-bold underline">
              Entrar y jugar
            </Link>
          </article>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-[#eee] pt-4 text-xs text-[#666] font-[family-name:var(--font-store-sans)]">
          <span className="inline-flex items-center gap-1.5">
            <Timer className="w-3.5 h-3.5" aria-hidden />
            {phase === 'pre'
              ? `Faltan ${snapshot?.daysUntilKickoff ?? countdown.days} días para el pitazo inicial`
              : 'Mundial 2026 activo'}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" aria-hidden />
            Datos del fixture desde Plot · actualización cada 60 s
          </span>
        </div>
      </div>
    </section>
  )
}
