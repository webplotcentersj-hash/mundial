'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Circle } from 'lucide-react'
import { getLiveTickerNews } from '@/lib/actions'
import { InteractiveTravelCard } from '@/components/store/interactive-figurita-card'
import { MundialHubSection } from '@/components/home/mundial-hub-section'

const MARQUEE_HOME =
  '104 PARTIDOS FIFA • PLOT MUNDIAL 2026 • PRODE EN VIVO • LIGAS PRIVADAS • RANKING GLOBAL • STORE • '

export default function Home() {
  const heroCardRef = useRef<HTMLDivElement>(null)
  const [tickerNews, setTickerNews] = useState<string[]>([
    '⚽ Cargando novedades en vivo...',
    '🏆 Conectando con los servidores...',
  ])

  const [playerCount, setPlayerCount] = useState(0)

  useEffect(() => {
    async function loadNews() {
      try {
        const data = await getLiveTickerNews()
        if (data?.news?.length) setTickerNews(data.news)
      } catch {
        /* ticker fallback */
      }
    }
    loadNews()
    const interval = setInterval(loadNews, 30_000)
    return () => clearInterval(interval)
  }, [])

  const tickerDup = useMemo(() => [...tickerNews, ...tickerNews], [tickerNews])

  return (
    <>
      <div className="marquee-bar">
        <div className="marquee-container">
          <div className="marquee-content">{MARQUEE_HOME.repeat(2)}</div>
        </div>
      </div>

      <main className="hero-section">
        <div className="hero-content">
          <div className="season-badge">COPA 2026 // PRODE EN VIVO</div>

          <div className="flex items-center gap-2 mb-4 -mt-2">
            <div className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-600" />
            </div>
            <span className="text-[#111] font-bold text-xs uppercase tracking-widest tabular-nums font-[family-name:var(--font-store-sans)]">
              {playerCount > 0
                ? `${playerCount.toLocaleString('es-AR')} jugadores en Plot`
                : 'Prode Mundial 2026'}
            </span>
          </div>

          <h1 className="hero-headline">
            PLOT
            <br />
            <span className="hero-headline-highlight">MUNDIAL</span>
          </h1>

          <p className="hero-subtext">
            Predecí los <strong>104 partidos</strong> oficiales de FIFA. Sumá puntos por resultados exactos,
            competí en el ranking global y en ligas con tus amigos.
          </p>

          <div className="cta-buttons flex-wrap">
            <Link href="/login" className="btn-primary hover-lift">
              JUGAR AHORA
            </Link>
            <Link href="/fixture" className="btn-secondary hover-lift">
              VER FIXTURE
            </Link>
            <Link href="/store" className="btn-secondary hover-lift">
              STORE
            </Link>
          </div>

          <div className="social-proof">
            <div className="avatar-stack">
              <img
                src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop"
                alt=""
              />
              <img
                src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop"
                alt=""
              />
              <img
                src="https://images.unsplash.com/photo-1552058544-f2b08422138a?w=100&h=100&fit=crop"
                alt=""
              />
            </div>
            <div>
              <div className="social-proof-title">Comunidad Plot Mundial</div>
              <div className="social-proof-subtitle">Prode, llaves y figuritas coleccionables</div>
            </div>
          </div>
        </div>

        <div className="hero-visuals">
          <svg
            className="abstract-shape"
            width="600"
            height="600"
            viewBox="0 0 200 200"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden
          >
            <path
              fill="#EB671B"
              d="M44.7,-76.4C58.9,-69.2,71.8,-59.1,81.6,-46.6C91.4,-34.1,98.1,-19.2,95.8,-5.3C93.5,8.6,82.2,21.5,70.6,31.6C59,41.7,47.1,49,35.3,55.1C23.5,61.2,11.8,66.1,-0.6,67.1C-12.9,68.1,-25.8,65.2,-37.9,59.2C-50,53.2,-61.3,44.1,-70.5,32.6C-79.7,21.1,-86.8,7.2,-85.1,-6.1C-83.3,-19.4,-72.7,-32.1,-61.6,-41.8C-50.5,-51.5,-38.9,-58.2,-27.1,-66.9C-15.3,-75.6,-3.3,-86.3,10.2,-83.8C23.7,-81.3,30.5,-83.6,44.7,-76.4Z"
              transform="translate(100 100)"
            />
          </svg>
          <motion.div
            ref={heroCardRef}
            className="main-image-container main-image-container--interactive"
            initial={{ opacity: 0.4, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <InteractiveTravelCard />
          </motion.div>
        </div>
      </main>

      <MundialHubSection onSnapshotChange={(s) => setPlayerCount(s.playerCount)} />

      <section className="trending-section border-t-2 border-[#111] !py-6">
        <div className="container overflow-hidden">
          <motion.div
            className="flex w-max gap-8 items-center will-change-transform"
            animate={{ x: ['0%', '-50%'] }}
            transition={{ ease: 'linear', duration: 32, repeat: Infinity }}
          >
            {tickerDup.map((news, index) => (
              <div key={index} className="flex shrink-0 items-center gap-8">
                <span className="text-[#111] font-bold text-sm tracking-wide whitespace-nowrap font-[family-name:var(--font-store-sans)]">
                  {news}
                </span>
                <Circle className="w-1.5 h-1.5 shrink-0 fill-[#111] text-[#111]" />
              </div>
            ))}
          </motion.div>
        </div>
      </section>
    </>
  )
}
