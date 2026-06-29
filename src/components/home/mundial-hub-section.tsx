'use client'

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Globe2,
  MapPin,
  Timer,
  Trophy,
  Users,
  X,
} from 'lucide-react'
import { getHomeMundialSnapshot, type HomeMundialSnapshot } from '@/lib/actions'
import {
  flagCodeForCdn,
  formatMundialDate,
  formatMundialTime,
  WC2026_ARGENTINA_DEBUT,
  WC2026_FINAL_ISO,
  WC2026_FACTS,
  WC2026_KICKOFF_ISO,
  WC2026_OPENING_MATCH,
  type MundialMatchPreview,
} from '@/lib/world-cup-2026'

type HubMatch = MundialMatchPreview & {
  status?: string
  homeScore?: number | null
  awayScore?: number | null
}

type Countdown = {
  days: number
  hours: number
  minutes: number
  seconds: number
  done: boolean
}

type HubCardId = 'next-match' | 'argentina' | 'facts' | 'prode'

type HubCard = {
  id: HubCardId
  title: string
  visual: ReactNode
  summary: ReactNode
  detailTitle: string
  detail: ReactNode
}

function computeCountdown(targetIso: string): Countdown {
  const diff = Date.parse(targetIso) - Date.now()
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true }
  }
  const totalSeconds = Math.floor(diff / 1000)
  return {
    days: Math.floor(totalSeconds / 86_400),
    hours: Math.floor((totalSeconds % 86_400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    done: false,
  }
}

function pad(n: number) {
  return String(n).padStart(2, '0')
}

function MatchFlags({ match, size = 48 }: { match: HubMatch; size?: number }) {
  const h = Math.round(size * 0.75)
  const renderFlag = (code: string, name: string) => {
    if (code === 'tbd') {
      return (
        <div
          style={{ width: size, height: h }}
          className="flex items-center justify-center rounded border border-[#111]/15 bg-[#f5f5f5] text-sm font-black text-[#999]"
          aria-hidden
        >
          ?
        </div>
      )
    }
    return (
      <Image
        unoptimized
        src={`https://flagcdn.com/w80/${flagCodeForCdn(code)}.png`}
        alt={name}
        width={size}
        height={h}
        className="rounded border border-[#111]/10 object-cover shadow-sm"
      />
    )
  }
  return (
    <div className="flex items-center justify-center gap-3">
      {renderFlag(match.homeCode, match.homeName)}
      <span className="text-xs font-bold uppercase tracking-widest text-[#888]">vs</span>
      {renderFlag(match.awayCode, match.awayName)}
    </div>
  )
}

function matchScoreLine(match: HubMatch) {
  if (match.homeScore == null || match.awayScore == null) return null
  return `${match.homeScore}-${match.awayScore}`
}

function HubDetailModal({
  card,
  onClose,
}: {
  card: HubCard | null
  onClose: () => void
}) {
  useEffect(() => {
    if (!card) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [card, onClose])

  if (!card) return null

  return (
    <div
      className="mundial-modal-overlay"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="mundial-modal-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mundial-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="mundial-modal-close" onClick={onClose} aria-label="Cerrar">
          <X className="h-5 w-5" />
        </button>
        <h4 id="mundial-modal-title" className="mundial-modal-title">
          {card.detailTitle}
        </h4>
        <div className="mundial-modal-body">{card.detail}</div>
      </div>
    </div>
  )
}

function HubCarousel({
  cards,
  onOpen,
}: {
  cards: HubCard[]
  onOpen: (id: HubCardId) => void
}) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  const scrollToIndex = (index: number) => {
    const track = trackRef.current
    if (!track) return
    const slide = track.children[index] as HTMLElement | undefined
    slide?.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' })
    setActiveIndex(index)
  }

  const scrollByDir = (dir: -1 | 1) => {
    const next = Math.max(0, Math.min(cards.length - 1, activeIndex + dir))
    scrollToIndex(next)
  }

  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    const onScroll = () => {
      const slides = Array.from(track.children) as HTMLElement[]
      const left = track.scrollLeft
      let closest = 0
      let minDist = Infinity
      slides.forEach((slide, i) => {
        const dist = Math.abs(slide.offsetLeft - left)
        if (dist < minDist) {
          minDist = dist
          closest = i
        }
      })
      setActiveIndex(closest)
    }

    track.addEventListener('scroll', onScroll, { passive: true })
    return () => track.removeEventListener('scroll', onScroll)
  }, [cards.length])

  return (
    <div className="mundial-carousel-wrap">
      <button
        type="button"
        className="mundial-carousel-btn mundial-carousel-btn--prev"
        onClick={() => scrollByDir(-1)}
        disabled={activeIndex === 0}
        aria-label="Tarjeta anterior"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <div ref={trackRef} className="mundial-carousel-track">
        {cards.map((card) => (
          <article
            key={card.id}
            className="product-card hover-lift mundial-carousel-slide product-card--clickable"
            role="button"
            tabIndex={0}
            onClick={() => onOpen(card.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onOpen(card.id)
              }
            }}
          >
            <div className="product-image flex flex-col items-center justify-center gap-3 p-4 !h-auto min-h-[180px]">
              {card.visual}
            </div>
            <h4>{card.title}</h4>
            <div className="text-sm text-[#555] leading-relaxed">{card.summary}</div>
            <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-[#EB671B]">
              Tocá para más info →
            </p>
          </article>
        ))}
      </div>

      <button
        type="button"
        className="mundial-carousel-btn mundial-carousel-btn--next"
        onClick={() => scrollByDir(1)}
        disabled={activeIndex >= cards.length - 1}
        aria-label="Tarjeta siguiente"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      <div className="mundial-carousel-dots" role="tablist" aria-label="Tarjetas del Mundial">
        {cards.map((card, i) => (
          <button
            key={card.id}
            type="button"
            role="tab"
            aria-selected={i === activeIndex}
            aria-label={card.title}
            className={`mundial-carousel-dot${i === activeIndex ? ' is-active' : ''}`}
            onClick={() => scrollToIndex(i)}
          />
        ))}
      </div>
    </div>
  )
}

function buildHubCards(
  snapshot: HomeMundialSnapshot | null,
  countdown: Countdown,
): HubCard[] {
  const facts = snapshot?.facts ?? WC2026_FACTS
  const phase = snapshot?.phase ?? 'pre'
  const liveMatch = snapshot?.liveMatch as HubMatch | null | undefined
  const lastResult = snapshot?.lastResult as HubMatch | null | undefined
  const nextMatch = (snapshot?.nextMatch ?? (phase === 'pre' ? WC2026_OPENING_MATCH : null)) as HubMatch | null
  const argMatch = (snapshot?.argentinaMatch ?? WC2026_ARGENTINA_DEBUT) as HubMatch
  const playerCount = snapshot?.playerCount ?? 0
  const predictionCount = snapshot?.predictionCount ?? 0
  const leagueCount = snapshot?.leagueCount ?? 0
  const daysLeft = snapshot?.daysUntilKickoff ?? countdown.days
  const finishedCount = snapshot?.finishedCount ?? 0
  const totalMatches = snapshot?.totalMatches ?? facts.matches
  const featuredMatch = liveMatch ?? nextMatch

  const cards: HubCard[] = []

  cards.push({
    id: 'next-match',
    title: liveMatch ? 'Partido en juego' : phase === 'finished' ? 'Último partido' : 'Próximo partido',
    visual: (
      <div className="flex flex-col items-center justify-center gap-3 w-full h-full bg-gradient-to-br from-green-50 to-white rounded-sm py-2">
        <Calendar className="w-10 h-10 text-emerald-700" aria-hidden />
        {featuredMatch ? (
          <>
            <MatchFlags match={featuredMatch} />
            <p className="text-center text-sm font-bold text-[#111] leading-snug">
              {featuredMatch.homeName} vs {featuredMatch.awayName}
            </p>
            {matchScoreLine(featuredMatch) ? (
              <p className="text-lg font-black tabular-nums text-emerald-700">{matchScoreLine(featuredMatch)}</p>
            ) : null}
          </>
        ) : lastResult ? (
          <>
            <MatchFlags match={lastResult} />
            <p className="text-lg font-black tabular-nums text-[#111]">{matchScoreLine(lastResult)}</p>
          </>
        ) : (
          <p className="text-sm font-bold text-[#111]">Consultando fixture…</p>
        )}
      </div>
    ),
    summary: featuredMatch ? (
      <>
        <strong>{formatMundialDate(featuredMatch.date)}</strong> · {formatMundialTime(featuredMatch.date)} hs (ARG)
        {featuredMatch.stage ? ` · ${featuredMatch.stage}` : ''}
        {liveMatch ? ' · en juego' : ''}
      </>
    ) : lastResult ? (
      <>
        Último resultado: <strong>{matchScoreLine(lastResult)}</strong>
        {lastResult.stage ? ` · ${lastResult.stage}` : ''}
      </>
    ) : (
      'Consultando calendario…'
    ),
    detailTitle: featuredMatch
      ? `${featuredMatch.homeName} vs ${featuredMatch.awayName}`
      : lastResult
        ? `${lastResult.homeName} ${matchScoreLine(lastResult)} ${lastResult.awayName}`
        : 'Fixture del Mundial',
    detail: featuredMatch || lastResult ? (
      <div className="space-y-4 text-sm text-[#444] leading-relaxed font-[family-name:var(--font-store-sans)]">
        <div className="flex justify-center py-2">
          <MatchFlags match={(featuredMatch ?? lastResult)!} size={64} />
        </div>
        {(featuredMatch ?? lastResult) && matchScoreLine(featuredMatch ?? lastResult!) ? (
          <p className="text-center text-2xl font-black tabular-nums text-[#111]">
            {matchScoreLine(featuredMatch ?? lastResult!)}
          </p>
        ) : null}
        <ul className="mundial-modal-list">
          {(featuredMatch ?? lastResult) ? (
            <>
              <li>
                <Calendar className="inline w-4 h-4 mr-1.5 -mt-0.5" aria-hidden />
                <strong>Fecha:</strong>{' '}
                {formatMundialDate((featuredMatch ?? lastResult)!.date)} ·{' '}
                {formatMundialTime((featuredMatch ?? lastResult)!.date)} hs (Argentina)
              </li>
              {(featuredMatch ?? lastResult)!.stage ? (
                <li>
                  <Trophy className="inline w-4 h-4 mr-1.5 -mt-0.5" aria-hidden />
                  <strong>Fase:</strong> {(featuredMatch ?? lastResult)!.stage}
                </li>
              ) : null}
              {(featuredMatch ?? lastResult)!.venue ? (
                <li>
                  <MapPin className="inline w-4 h-4 mr-1.5 -mt-0.5" aria-hidden />
                  <strong>Sede:</strong> {(featuredMatch ?? lastResult)!.venue}
                </li>
              ) : null}
            </>
          ) : null}
          {phase === 'pre' ? (
            <li>
              <Timer className="inline w-4 h-4 mr-1.5 -mt-0.5" aria-hidden />
              <strong>Cuenta regresiva al inaugural:</strong> {daysLeft} días, {pad(countdown.hours)}:
              {pad(countdown.minutes)}:{pad(countdown.seconds)}
            </li>
          ) : (
            <li>
              <Trophy className="inline w-4 h-4 mr-1.5 -mt-0.5" aria-hidden />
              <strong>Progreso:</strong> {finishedCount} de {totalMatches} partidos jugados
            </li>
          )}
        </ul>
        <p>
          {liveMatch
            ? 'Partido en curso según el fixture oficial de Plot Mundial. Los resultados finales se cargan desde admin.'
            : 'Es el partido más cercano en el fixture. Podés cargar tu pronóstico desde el dashboard antes del pitazo inicial.'}
        </p>
        <Link href="/fixture" className="btn-primary hover-lift inline-block text-sm !py-2 !px-4">
          Ver calendario completo
        </Link>
      </div>
    ) : (
      <p className="text-sm text-[#555]">No hay partidos cargados todavía.</p>
    ),
  })

  const argIsUpcoming = phase !== 'finished' && Date.parse(argMatch.date) >= Date.now()
  cards.push({
    id: 'argentina',
    title: 'Argentina en el Mundial',
    visual: (
      <div className="flex flex-col items-center justify-center gap-2 w-full h-full bg-gradient-to-br from-sky-50 to-white rounded-sm py-2">
        <Globe2 className="w-10 h-10 text-sky-700" aria-hidden />
        <MatchFlags match={argMatch} />
      </div>
    ),
    summary: (
      <>
        {argIsUpcoming ? 'Próximo partido' : 'Campeón defensor'} ·{' '}
        <strong>
          {formatMundialDate(argMatch.date)} · {formatMundialTime(argMatch.date)} hs
        </strong>
        {argMatch.stage ? ` · ${argMatch.stage}` : ''}
      </>
    ),
    detailTitle: 'Argentina — campeón defensor',
    detail: argMatch ? (
      <div className="space-y-4 text-sm text-[#444] leading-relaxed font-[family-name:var(--font-store-sans)]">
        <div className="flex justify-center py-2">
          <MatchFlags match={argMatch} size={64} />
        </div>
        <p>
          La Albiceleste llega como campeona de Qatar 2022 y abre su campaña en el <strong>Grupo J</strong> frente a{' '}
          {argMatch.homeCode === 'ar' ? argMatch.awayName : argMatch.homeName}.
        </p>
        <ul className="mundial-modal-list">
          <li>
            <strong>Debut:</strong> {formatMundialDate(argMatch.date)} · {formatMundialTime(argMatch.date)} hs (ARG)
          </li>
          {argMatch.venue ? (
            <li>
              <strong>Sede del debut:</strong> {argMatch.venue}
            </li>
          ) : null}
          <li>
            <strong>Grupo J:</strong> Argentina, Argelia, Austria y Jordania
          </li>
          <li>
            <strong>Fechas clave del grupo:</strong> 16, 22 y 27 de junio de 2026
          </li>
        </ul>
        <p>
          En Plot Mundial podés pronosticar los 6 partidos de la fase de grupos de la Scaloneta y seguir cómo impactan
          en tu ranking global y en tus ligas privadas.
        </p>
        <Link href="/dashboard" className="btn-secondary hover-lift inline-block text-sm !py-2 !px-4">
          Ir a mis pronósticos
        </Link>
      </div>
    ) : (
      <p className="text-sm text-[#555]">Fixture de Argentina no disponible.</p>
    ),
  })

  cards.push({
    id: 'facts',
    title: 'La Copa en cifras',
    visual: (
      <div className="flex flex-col items-center justify-center gap-3 w-full h-full bg-gradient-to-br from-amber-50 to-white rounded-sm py-2">
        <Trophy className="w-10 h-10 text-amber-600" aria-hidden />
        <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-center tabular-nums">
          <div>
            <div className="text-2xl font-black text-[#111]">{facts.teams}</div>
            <div className="text-[10px] uppercase tracking-wider text-[#888]">Selecciones</div>
          </div>
          <div>
            <div className="text-2xl font-black text-[#111]">{facts.matches}</div>
            <div className="text-[10px] uppercase tracking-wider text-[#888]">Partidos</div>
          </div>
          <div>
            <div className="text-2xl font-black text-[#111]">{facts.groups}</div>
            <div className="text-[10px] uppercase tracking-wider text-[#888]">Grupos</div>
          </div>
          <div>
            <div className="text-2xl font-black text-[#111]">{facts.venues}</div>
            <div className="text-[10px] uppercase tracking-wider text-[#888]">Sedes</div>
          </div>
        </div>
      </div>
    ),
    summary: (
      <>
        Primera Copa de 48 equipos · final{' '}
        <strong>{formatMundialDate(WC2026_FINAL_ISO)}</strong>
      </>
    ),
    detailTitle: 'Mundial FIFA 2026 — formato y sedes',
    detail: (
      <div className="space-y-4 text-sm text-[#444] leading-relaxed font-[family-name:var(--font-store-sans)]">
        <p>
          Por primera vez en la historia, la Copa del Mundo reunirá <strong>{facts.teams} selecciones</strong> en{' '}
          <strong>{facts.matches} partidos</strong>, organizada conjuntamente por{' '}
          {facts.hostCountries.join(', ')}.
        </p>
        <ul className="mundial-modal-list">
          <li>
            <strong>Fase de grupos:</strong> 12 grupos de 4 equipos (11 jun – 27 jun 2026)
          </li>
          <li>
            <strong>Eliminatorias:</strong> 32 clasificados avanzan a 16avos de final
          </li>
          <li>
            <strong>Final:</strong> {formatMundialDate(WC2026_FINAL_ISO)} · {formatMundialTime(WC2026_FINAL_ISO)} hs (ARG) en {facts.finalVenue}
          </li>
          <li>
            <strong>Sedes:</strong> {facts.venues} estadios en ciudades de EE.UU., México y Canadá
          </li>
        </ul>
        <p>
          Plot Mundial replica el fixture oficial: pronosticá desde el inaugural hasta la final y armá tu llave
          eliminatoria en el bracket.
        </p>
        <Link href="/bracket" className="btn-secondary hover-lift inline-block text-sm !py-2 !px-4">
          Ver llave eliminatoria
        </Link>
      </div>
    ),
  })

  cards.push({
    id: 'prode',
    title: 'Prode en vivo',
    visual: (
      <div className="flex flex-col items-center justify-center gap-3 w-full h-full bg-gradient-to-br from-orange-50 to-white rounded-sm py-2">
        <Users className="w-10 h-10 text-[#EB671B]" aria-hidden />
        <div className="grid grid-cols-1 gap-2 w-full max-w-[200px] text-center tabular-nums">
          <div>
            <div className="text-3xl font-black text-[#111]">{playerCount.toLocaleString('es-AR')}</div>
            <div className="text-[10px] uppercase tracking-wider text-[#888]">Jugadores en Plot</div>
          </div>
          <div className="flex justify-center gap-6 text-sm">
            <div>
              <div className="font-black text-[#111]">{predictionCount.toLocaleString('es-AR')}</div>
              <div className="text-[10px] uppercase text-[#888]">Pronósticos</div>
            </div>
            <div>
              <div className="font-black text-[#111]">{leagueCount.toLocaleString('es-AR')}</div>
              <div className="text-[10px] uppercase text-[#888]">Ligas</div>
            </div>
          </div>
        </div>
      </div>
    ),
    summary: (
      <>
        <strong>{predictionCount.toLocaleString('es-AR')}</strong> pronósticos ·{' '}
        <strong>{finishedCount}/{totalMatches}</strong> partidos oficiales
      </>
    ),
    detailTitle: 'Comunidad Plot Mundial — en vivo',
    detail: (
      <div className="space-y-4 text-sm text-[#444] leading-relaxed font-[family-name:var(--font-store-sans)]">
        <div className="grid grid-cols-3 gap-3 text-center border-2 border-[#eee] p-4 tabular-nums">
          <div>
            <div className="text-2xl font-black text-[#111]">{playerCount.toLocaleString('es-AR')}</div>
            <div className="text-[10px] uppercase text-[#888] mt-1">Jugadores</div>
          </div>
          <div>
            <div className="text-2xl font-black text-[#111]">{predictionCount.toLocaleString('es-AR')}</div>
            <div className="text-[10px] uppercase text-[#888] mt-1">Pronósticos</div>
          </div>
          <div>
            <div className="text-2xl font-black text-[#111]">{leagueCount.toLocaleString('es-AR')}</div>
            <div className="text-[10px] uppercase text-[#888] mt-1">Ligas</div>
          </div>
        </div>
        <p>Estos números se actualizan desde la base de datos de Plot Mundial cada 30–60 segundos.</p>
        <ul className="mundial-modal-list">
          <li>
            <strong>Puntos:</strong> 3 por resultado exacto, 1 por acertar ganador o empate
          </li>
          <li>
            <strong>Fixture:</strong> {finishedCount} finalizados · {totalMatches - finishedCount} pendientes
          </li>
          <li>
            <strong>Ranking global:</strong> competí contra todos los usuarios registrados
          </li>
          <li>
            <strong>Ligas privadas:</strong> creá grupos con amigos y compará tablas
          </li>
          <li>
            <strong>Trivia y medallas:</strong> sumá puntos extra y desbloqueá logros
          </li>
        </ul>
        <div className="flex flex-wrap gap-2">
          <Link href="/login" className="btn-primary hover-lift inline-block text-sm !py-2 !px-4">
            Entrar y jugar
          </Link>
          <Link href="/ranking" className="btn-secondary hover-lift inline-block text-sm !py-2 !px-4">
            Ver ranking
          </Link>
        </div>
      </div>
    ),
  })

  return cards
}

export function MundialHubSection({
  onSnapshotChange,
}: {
  onSnapshotChange?: (snapshot: HomeMundialSnapshot) => void
}) {
  const [snapshot, setSnapshot] = useState<HomeMundialSnapshot | null>(null)
  const [countdown, setCountdown] = useState<Countdown>(() =>
    computeCountdown(WC2026_KICKOFF_ISO),
  )
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null)
  const [activeCardId, setActiveCardId] = useState<HubCardId | null>(null)
  const onSnapshotChangeRef = useRef(onSnapshotChange)
  onSnapshotChangeRef.current = onSnapshotChange

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const data = await getHomeMundialSnapshot()
        if (cancelled) return
        setSnapshot(data)
        onSnapshotChangeRef.current?.(data)
        setUpdatedAt(new Date())
      } catch {
        /* fallback silencioso */
      }
    }
    load()
    const id = setInterval(load, 30_000)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [])

  useEffect(() => {
    const target = snapshot?.kickoffIso ?? WC2026_KICKOFF_ISO
    const tick = () => setCountdown(computeCountdown(target))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [snapshot?.kickoffIso])

  const phase = snapshot?.phase ?? 'pre'
  const liveMatch = snapshot?.liveMatch as HubMatch | null | undefined
  const nextMatch = snapshot?.nextMatch
  const lastResult = snapshot?.lastResult as HubMatch | null | undefined
  const finishedCount = snapshot?.finishedCount ?? 0
  const totalMatches = snapshot?.totalMatches ?? WC2026_FACTS.matches
  const cards = useMemo(() => buildHubCards(snapshot, countdown), [snapshot, countdown])
  const activeCard = cards.find((c) => c.id === activeCardId) ?? null

  const updatedLabel = updatedAt
    ? `Actualizado ${updatedAt.toLocaleString('es-AR', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      })} hs`
    : 'Conectando…'

  return (
    <section className="trending-section mundial-hub-section">
      <div className="container">
        {/* Banner de Video Mundial */}
        <div className="relative w-full mb-6 overflow-hidden border-2 border-[#111] bg-black shadow-[4px_4px_0px_#111] aspect-[1920/418]">
          <video
            src="/BANNER%20WEB%20(1).mp4"
            className="w-full h-full object-cover"
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
          />
        </div>

        <div className="trending-header flex-wrap gap-3">
          <div>
            <h3>Mundial FIFA 2026</h3>
            <p className="mt-1 text-sm text-[#555] font-[family-name:var(--font-store-sans)]">
              USA · México · Canadá — deslizá las tarjetas y tocá para ver el detalle
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#888] font-[family-name:var(--font-store-sans)]">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-600" />
            </span>
            {updatedLabel}
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
                  {WC2026_OPENING_MATCH.homeName} vs {WC2026_OPENING_MATCH.awayName} ·{' '}
                  {formatMundialDate(WC2026_KICKOFF_ISO)} · {formatMundialTime(WC2026_KICKOFF_ISO)} hs (ARG) ·{' '}
                  {WC2026_OPENING_MATCH.venue}
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
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2">
                <p className="text-sm font-bold uppercase tracking-widest text-emerald-800">
                  {liveMatch
                    ? `⚽ En juego · ${liveMatch.homeName} vs ${liveMatch.awayName}`
                    : '⚽ Mundial en curso — seguí resultados, fixture y tu prode en tiempo real'}
                </p>
                {nextMatch && !liveMatch ? (
                  <p className="text-sm text-emerald-900/90 font-[family-name:var(--font-store-sans)]">
                    Próximo: <strong>{nextMatch.homeName} vs {nextMatch.awayName}</strong>
                    {nextMatch.stage ? ` · ${nextMatch.stage}` : ''} ·{' '}
                    {formatMundialDate(nextMatch.date)} {formatMundialTime(nextMatch.date)} hs (ARG)
                  </p>
                ) : null}
                {lastResult ? (
                  <p className="text-sm text-emerald-900/80 font-[family-name:var(--font-store-sans)]">
                    Último resultado:{' '}
                    <strong>
                      {lastResult.homeName}{' '}
                      {lastResult.homeScore != null && lastResult.awayScore != null
                        ? `${lastResult.homeScore}-${lastResult.awayScore}`
                        : '—'}{' '}
                      {lastResult.awayName}
                    </strong>
                    {lastResult.stage ? ` · ${lastResult.stage}` : ''}
                  </p>
                ) : null}
              </div>
              <div className="text-right">
                <p className="text-2xl font-black tabular-nums text-emerald-900">
                  {finishedCount}/{totalMatches}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800/80">partidos jugados</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href="/fixture" className="btn-secondary hover-lift text-xs !py-2 !px-3">
                Fixture
              </Link>
              <Link href="/dashboard" className="btn-secondary hover-lift text-xs !py-2 !px-3">
                Mi prode
              </Link>
              <Link href="/ranking" className="btn-primary hover-lift text-xs !py-2 !px-3">
                Ranking
              </Link>
            </div>
          </div>
        )}

        {phase === 'finished' && (
          <div className="mundial-countdown-banner mb-6 border-[#111]/20 bg-[#fafafa]">
            <p className="text-sm font-bold uppercase tracking-widest text-[#111]">
              🏆 Mundial 2026 finalizado · {finishedCount} partidos en el fixture oficial
            </p>
            <p className="mt-2 text-sm text-[#555] font-[family-name:var(--font-store-sans)]">
              Revisá el ranking final, tus medallas y la llave completa en Plot Mundial.
            </p>
          </div>
        )}

        <HubCarousel cards={cards} onOpen={setActiveCardId} />

        <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-[#eee] pt-4 text-xs text-[#666] font-[family-name:var(--font-store-sans)]">
          <span className="inline-flex items-center gap-1.5">
            <Timer className="w-3.5 h-3.5" aria-hidden />
            {phase === 'pre'
              ? `Faltan ${snapshot?.daysUntilKickoff ?? countdown.days} días para el pitazo inicial`
              : phase === 'live'
                ? `${finishedCount} de ${totalMatches} partidos jugados · datos en vivo`
                : 'Copa finalizada · ranking y medallas disponibles'}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" aria-hidden />
            Fixture Plot · refresh {phase === 'live' ? '30 s' : '60 s'}
          </span>
        </div>
      </div>

      <HubDetailModal card={activeCard} onClose={() => setActiveCardId(null)} />
    </section>
  )
}
