'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Trophy, Star, ArrowRight, Globe, Flame, Circle } from 'lucide-react'
import { getLiveTickerNews } from '@/lib/actions'

export default function Home() {
  const [tickerNews, setTickerNews] = useState<string[]>([
    "⚽ Cargando novedades en vivo...",
    "🏆 Conectando con los servidores..."
  ])

  /** Contador LIVE decorativo (oscila al azar para sensación de actividad) */
  const [liveFakeCount, setLiveFakeCount] = useState(() => 9000 + Math.floor(Math.random() * 6000))

  useEffect(() => {
    const tick = () => {
      setLiveFakeCount((prev) => {
        const jitter = Math.floor(Math.random() * 2400) - 1200
        return Math.min(24000, Math.max(7200, prev + jitter))
      })
    }
    const id = setInterval(tick, 650 + Math.floor(Math.random() * 400))
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    async function loadNews() {
      try {
        const data = await getLiveTickerNews()
        if (data?.news?.length) setTickerNews(data.news)
      } catch {
        /* ticker fallback ya está en estado inicial */
      }
    }
    loadNews()
    const interval = setInterval(loadNews, 60000)
    return () => clearInterval(interval)
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.3 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 40, damping: 15 } }
  }

  const [videoReady, setVideoReady] = useState(false)

  const particles = useMemo(
    () =>
      Array.from({ length: 12 }).map((_, i) => ({
        id: i,
        size: Math.random() * 5 + 1.5,
        x: Math.random() * 100,
        y: Math.random() * 100,
        duration: Math.random() * 20 + 10,
        delay: Math.random() * 5,
      })),
    []
  )

  const onVideoLoaded = useCallback(() => {
    setVideoReady(true)
  }, [])

  return (
    <div className="relative w-full min-h-[calc(100vh-4rem)] flex flex-col overflow-x-hidden overflow-y-visible -mt-16 pt-16 pb-28">
      {/* Fondo ancho completo */}
      <div className="absolute inset-0 -z-[60] bg-[#030712]" aria-hidden />

      <div className="w-full mx-auto px-3 min-[420px]:px-4 sm:px-6 md:px-8 lg:px-10 xl:px-14 2xl:px-20 relative z-10 py-10 sm:py-14 md:py-16 lg:py-20 flex flex-col items-stretch gap-10 md:gap-14 lg:gap-16">
        {/* Video solo detrás del panel hero — ahora ocupa todo el ancho útil */}
        <div className="relative w-full isolate overflow-hidden rounded-2xl border border-white/20 bg-[#060d18]/90 shadow-[0_32px_100px_-28px_rgba(0,0,0,0.75),inset_0_1px_0_rgba(255,255,255,0.08)] sm:rounded-3xl">
          <div
            className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-[inherit]"
            aria-hidden
          >
            <div
              className="absolute inset-0 bg-gradient-to-br from-[#0c1829] via-[#060d18] to-[#120805]"
              aria-hidden
            />
            <div
              className="absolute inset-0 bg-[radial-gradient(ellipse_100%_70%_at_50%_0%,rgba(235,103,27,0.14),transparent_50%),radial-gradient(ellipse_80%_55%_at_80%_100%,rgba(245,158,11,0.1),transparent_50%)]"
              aria-hidden
            />

            <video
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
              disablePictureInPicture
              onLoadedData={onVideoLoaded}
              onCanPlay={onVideoLoaded}
              onError={() => setVideoReady(false)}
              className={`absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto object-cover -translate-x-1/2 -translate-y-1/2 mix-blend-screen scale-[1.08] transition-opacity duration-[1200ms] ease-out will-change-[opacity] ${
                videoReady ? 'opacity-[0.48]' : 'opacity-0'
              }`}
            >
              <source src="/This is FIFA World Cup 26™.mp4" type="video/mp4" />
            </video>

            <div
              className="absolute inset-0 bg-gradient-to-b from-[#030712]/55 via-[#030712]/18 to-[#030712]/60 pointer-events-none"
              aria-hidden
            />
            <div
              className="absolute inset-0 bg-gradient-to-r from-[#030712]/35 via-transparent to-[#030712]/35 pointer-events-none"
              aria-hidden
            />

            <div
              className="absolute inset-0 backdrop-blur-[1px] bg-gradient-to-b from-white/[0.04] via-transparent to-black/20 pointer-events-none"
              aria-hidden
            />
            <div
              className="hero-noise-static absolute inset-0 opacity-[0.16] mix-blend-overlay pointer-events-none"
              aria-hidden
            />
            <div className="hero-shimmer-sweep" aria-hidden />

            <div className="absolute inset-0 overflow-hidden">
              {particles.map((p) => (
                <motion.div
                  key={p.id}
                  className="absolute rounded-full bg-amber-400/25 blur-[1.5px]"
                  style={{
                    width: p.size,
                    height: p.size,
                    left: `${p.x}%`,
                    top: `${p.y}%`,
                  }}
                  animate={{
                    opacity: [0.15, 0.5, 0.15],
                    scale: [1, 1.25, 1],
                  }}
                  transition={{
                    duration: p.duration * 0.35,
                    repeat: Infinity,
                    delay: p.delay,
                    ease: 'easeInOut',
                  }}
                />
              ))}
            </div>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="relative z-10 flex flex-col items-center text-center w-full min-w-0 px-4 py-8 sm:px-6 sm:py-10 md:px-10 md:py-12 lg:px-14 lg:py-14 xl:px-20 xl:py-16 backdrop-blur-lg bg-gradient-to-b from-white/[0.12] via-white/[0.04] to-black/25 ring-1 ring-inset ring-white/10"
          >
          {/* Live Status Pill */}
          <motion.div variants={itemVariants} className="mb-8 flex items-center justify-center">
             <div className="bg-red-500/10 border border-red-500/30 px-4 py-1.5 rounded-full flex items-center gap-2 backdrop-blur-md shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                <div className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </div>
                <span className="text-red-400 font-bold text-xs uppercase tracking-widest tabular-nums">
                  Live: {liveFakeCount.toLocaleString('es-AR')} jugadores
                </span>
             </div>
          </motion.div>

          <motion.h1 variants={itemVariants} className="text-4xl min-[400px]:text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold font-outfit tracking-tighter leading-[1.05] mb-5 sm:mb-6 drop-shadow-2xl relative w-full max-w-full px-1 sm:px-0">
            <span className="absolute -inset-10 bg-gradient-to-r from-primary/0 via-amber-500/10 to-primary/0 blur-3xl rounded-full pointer-events-none" />
            <span className="text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.3)] relative z-10">PLOT</span><br/>
            <span className="relative inline-block mt-2 z-10">
              <span className="absolute -inset-4 bg-gradient-to-r from-primary via-amber-500 to-primary blur-3xl opacity-40 animate-pulse" />
              <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-primary via-amber-400 to-yellow-200 drop-shadow-[0_0_10px_rgba(235,103,27,0.8)]">
                MUNDIAL
              </span>
            </span>
          </motion.h1>
          
          <motion.p variants={itemVariants} className="text-base min-[400px]:text-lg sm:text-xl md:text-2xl lg:text-3xl text-white/80 mb-10 sm:mb-12 md:mb-14 w-full max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto font-light leading-relaxed drop-shadow-lg text-balance px-1">
            Predice los <strong className="text-white font-bold">104 partidos</strong> oficiales de FIFA. Suma puntos por resultados exactos, compite en el ranking global y gana gloria eterna.
          </motion.p>
          
          <motion.div variants={itemVariants} className="flex w-full max-w-4xl lg:max-w-5xl mx-auto flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4 sm:gap-5 relative z-20 min-w-0">
            <Link href="/login" className="relative group w-full sm:flex-1 sm:min-w-0">
              <div className="absolute -inset-1.5 bg-gradient-to-r from-primary via-amber-500 to-primary rounded-2xl blur-lg opacity-80 group-hover:opacity-100 transition duration-500 animate-pulse" />
              <div className="relative bg-[#0a0f1c] border border-primary/50 group-hover:border-primary px-6 py-5 sm:px-8 sm:py-6 rounded-xl flex items-center justify-center gap-3 sm:gap-4 transition-all overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="text-lg sm:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-amber-100 uppercase tracking-wider">Jugar Ahora</span>
                <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 text-primary shrink-0 group-hover:translate-x-2 transition-transform drop-shadow-[0_0_8px_rgba(235,103,27,0.8)]" />
              </div>
            </Link>
            
            <Link href="/fixture" className="group w-full sm:flex-1 sm:min-w-0 px-6 py-5 sm:px-8 sm:py-6 rounded-xl border border-white/20 bg-black/40 hover:bg-white/10 backdrop-blur-xl flex items-center justify-center gap-3 sm:gap-4 transition-all shadow-2xl hover:shadow-[0_0_30px_rgba(255,255,255,0.1)]">
              <Globe className="w-5 h-5 sm:w-6 sm:h-6 text-white/50 group-hover:text-white transition-colors shrink-0" />
              <span className="text-lg sm:text-xl font-bold text-white/80 group-hover:text-white uppercase tracking-wider">Ver Fixture</span>
            </Link>
          </motion.div>
          </motion.div>
        </div>

        {/* --- Premium Feature Cards --- */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="grid w-full min-w-0 grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 md:gap-6 lg:gap-8 rounded-2xl border border-white/10 bg-[#060913]/85 p-4 sm:p-6 md:p-7 lg:p-8 xl:p-10 backdrop-blur-md shadow-[0_20px_60px_-24px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.05)] sm:rounded-3xl"
        >
          <div className="group glass-card p-6 sm:p-8 rounded-xl sm:rounded-[2rem] border border-white/10 hover:border-primary/50 transition-all hover:-translate-y-1 sm:hover:-translate-y-2 hover:shadow-[0_30px_60px_-15px_rgba(235,103,27,0.4)] bg-[#0a0f1c]/60 backdrop-blur-xl relative overflow-hidden min-w-0">
             <div className="absolute top-0 right-0 w-40 h-40 bg-primary/20 rounded-full blur-[50px] pointer-events-none group-hover:bg-primary/40 transition-colors" />
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/5 flex items-center justify-center mb-6 border border-primary/30 group-hover:scale-110 transition-transform relative z-10">
              <Flame className="w-8 h-8 text-primary drop-shadow-[0_0_15px_rgba(235,103,27,1)]" />
            </div>
            <h3 className="text-2xl font-black mb-3 font-outfit text-white relative z-10">Acierta y Gana</h3>
            <p className="text-white/60 leading-relaxed font-light relative z-10">Suma 3 puntos por predecir el resultado exacto y 1 punto por acertar la tendencia del ganador o el empate.</p>
          </div>

          <div className="group glass-card p-6 sm:p-8 rounded-xl sm:rounded-[2rem] border border-white/10 hover:border-amber-500/50 transition-all hover:-translate-y-1 sm:hover:-translate-y-2 hover:shadow-[0_30px_60px_-15px_rgba(245,158,11,0.4)] bg-[#0a0f1c]/60 backdrop-blur-xl relative overflow-hidden min-w-0">
            <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/20 rounded-full blur-[50px] pointer-events-none group-hover:bg-amber-500/40 transition-colors" />
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/30 to-amber-500/5 flex items-center justify-center mb-6 border border-amber-500/30 group-hover:scale-110 transition-transform relative z-10">
              <Trophy className="w-8 h-8 text-amber-500 drop-shadow-[0_0_15px_rgba(245,158,11,1)]" />
            </div>
            <h3 className="text-2xl font-black mb-3 font-outfit text-white relative z-10">Ligas Privadas</h3>
            <p className="text-white/60 leading-relaxed font-light relative z-10">Crea grupos privados con tus amigos de la oficina, compara llaves y demuestra quién sabe más de fútbol.</p>
          </div>

          <div className="group glass-card p-6 sm:p-8 rounded-xl sm:rounded-[2rem] border border-white/10 hover:border-purple-500/50 transition-all hover:-translate-y-1 sm:hover:-translate-y-2 hover:shadow-[0_30px_60px_-15px_rgba(168,85,247,0.4)] bg-[#0a0f1c]/60 backdrop-blur-xl relative overflow-hidden min-w-0">
             <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/20 rounded-full blur-[50px] pointer-events-none group-hover:bg-purple-500/40 transition-colors" />
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/30 to-purple-500/5 flex items-center justify-center mb-6 border border-purple-500/30 group-hover:scale-110 transition-transform relative z-10">
              <Star className="w-8 h-8 text-purple-400 drop-shadow-[0_0_15px_rgba(168,85,247,1)]" />
            </div>
            <h3 className="text-2xl font-black mb-3 font-outfit text-white relative z-10">Logros Épicos</h3>
            <p className="text-white/60 leading-relaxed font-light relative z-10">Desbloquea medallas como 'Cazagigantes' o 'Nostradamus' a medida que completas hazañas estadísticas.</p>
          </div>
        </motion.div>
      </div>

      {/* --- Live Ticker Marquee --- */}
      <div className="absolute bottom-0 left-0 w-full bg-white/5 border-t border-white/10 backdrop-blur-md overflow-hidden z-20">
        <div className="flex whitespace-nowrap py-3 items-center">
          <motion.div 
            className="flex gap-8 px-4 items-center"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ ease: "linear", duration: 30, repeat: Infinity }}
          >
            {/* Duplicamos para efecto infinito */}
            {[...tickerNews, ...tickerNews].map((news, index) => (
              <div key={index} className="flex items-center gap-8">
                <span className="text-white/70 font-bold text-sm tracking-wide">{news}</span>
                <Circle className="w-1.5 h-1.5 text-primary/50 fill-primary/50" />
              </div>
            ))}
          </motion.div>
        </div>
      </div>

    </div>
  )
}
