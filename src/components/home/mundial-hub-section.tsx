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
  WC2026_FINAL_ISO,
  WC2026_FACTS,
  type MundialMatchPreview,
} from '@/lib/world-cup-2026'

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

function MatchFlags({ match, size = 48 }: { match: MundialMatchPreview; size?: number }) {
  const h = Math.round(size * 0.75)
  return (
    <div className="flex items-center justify-center gap-3">
      <Image
        unoptimized
        src={`https://flagcdn.com/w80/${flagCodeForCdn(match.homeCode)}.png`}
        alt={match.homeName}
        width={size}
        height={h}
        className="rounded border border-[#111]/10 object-cover shadow-sm"
      />
      <span className="text-xs font-bold uppercase tracking-widest text-[#888]">vs</span>
      <Image
        unoptimized
        src={`https://flagcdn.com/w80/${flagCodeForCdn(match.awayCode)}.png`}
        alt={match.awayName}
        width={size}
        height={h}
        className="rounded border border-[#111]/10 object-cover shadow-sm"
      />
    </div>
  )
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
  const nextMatch = snapshot?.nextMatch
  const argMatch = snapshot?.argentinaMatch
  const playerCount = snapshot?.playerCount ?? 0
  const predictionCount = snapshot?.predictionCount ?? 0
  const leagueCount = snapshot?.leagueCount ?? 0
  const daysLeft = snapshot?.daysUntilKickoff ?? countdown.days

  const cards: HubCard[] = []

  cards.push({
    id: 'next-match',
    title: 'Próximo partido',
    visual: (
      <div className="flex flex-col items-center justify-center gap-3 w-full h-full bg-gradient-to-br from-green-50 to-white rounded-sm py-2">
        <Calendar className="w-10 h-10 text-emerald-700" aria-hidden />
        {nextMatch ? (
          <>
            <MatchFlags match={nextMatch} />
            <p className="text-center text-sm font-bold text-[#111] leading-snug">
              {nextMatch.homeName} vs {nextMatch.awayName}
            </p>
          </>
        ) : (
          <p className="text-sm font-bold text-[#111]">Cargando fixture…</p>
        )}
      </div>
    ),
    summary: nextMatch ? (
      <>
        <strong>{formatMundialDate(nextMatch.date)}</strong> · {formatMundialTime(nextMatch.date)} hs (ARG)
        {nextMatch.stage ? ` · ${nextMatch.stage}` : ''}
      </>
    ) : (
      'Consultando calendario…'
    ),
    detailTitle: nextMatch
      ? `${nextMatch.homeName} vs ${nextMatch.awayName}`
      : 'Próximo partido del Mundial',
    detail: nextMatch ? (
      <div className="space-y-4 text-sm text-[#444] leading-relaxed font-[family-name:var(--font-store-sans)]">
        <div className="flex justify-center py-2">
          <MatchFlags match={nextMatch} size={64} />
        </div>
        <ul className="mundial-modal-list">
          <li>
            <Calendar className="inline w-4 h-4 mr-1.5 -mt-0.5" aria-hidden />
            <strong>Fecha:</strong> {formatMundialDate(nextMatch.date)} · {formatMundialTime(nextMatch.date)} hs (Argentina)
          </li>
          {nextMatch.stage ? (
            <li>
              <Trophy className="inline w-4 h-4 mr-1.5 -mt-0.5" aria-hidden />
              <strong>Fase:</strong> {nextMatch.stage}
            </li>
          ) : null}
          {nextMatch.venue ? (
            <li>
              <MapPin className="inline w-4 h-4 mr-1.5 -mt-0.5" aria-hidden />
              <strong>Sede:</strong> {nextMatch.venue}
            </li>
          ) : null}
          <li>
            <Timer className="inline w-4 h-4 mr-1.5 -mt-0.5" aria-hidden />
            <strong>Cuenta regresiva general:</strong> {daysLeft} días, {pad(countdown.hours)}:{pad(countdown.minutes)}:{pad(countdown.seconds)} al inaugural
          </li>
        </ul>
        <p>
          Es el partido más cercano en el fixture de Plot Mundial. Podés cargar tu pronóstico desde el dashboard
          antes del pitazo inicial.
        </p>
        <Link href="/fixture" className="btn-primary hover-lift inline-block text-sm !py-2 !px-4">
          Ver calendario completo
        </Link>
      </div>
    ) : (
      <p className="text-sm text-[#555]">No hay partidos cargados todavía.</p>
    ),
  })

  cards.push({
    id: 'argentina',
    title: 'Argentina en el Mundial',
    visual: (
      <div className="flex flex-col items-center justify-center gap-2 w-full h-full bg-gradient-to-br from-sky-50 to-white rounded-sm py-2">
        <Globe2 className="w-10 h-10 text-sky-700" aria-hidden />
        {argMatch ? <MatchFlags match={argMatch} /> : null}
      </div>
    ),
    summary: argMatch ? (
      <>
        Campeón defensor · debut{' '}
        <strong>
          {formatMundialDate(argMatch.date)} · {formatMundialTime(argMatch.date)} hs
        </strong>
      </>
    ) : (
      'Grupo J — buscando fixture…'
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
        <strong>3 pts</strong> marcador exacto · <strong>1 pt</strong> ganador o empate
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
        <p>Estos números se actualizan cada 60 segundos desde la base de datos de Plot Mundial.</p>
        <ul className="mundial-modal-list">
          <li>
            <strong>Puntos:</strong> 3 por resultado exacto, 1 por acertar ganador o empate
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
    computeCountdown('2026-06-11T15:00:00Z'),
  )
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null)
  const [activeCardId, setActiveCardId] = useState<HubCardId | null>(null)
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
  const cards = useMemo(() => buildHubCards(snapshot, countdown), [snapshot, countdown])
  const activeCard = cards.find((c) => c.id === activeCardId) ?? null

  return (
    <section className="trending-section mundial-hub-section">
      <div className="container">
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

        <HubCarousel cards={cards} onOpen={setActiveCardId} />

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

      <HubDetailModal card={activeCard} onClose={() => setActiveCardId(null)} />
    </section>
  )
}
