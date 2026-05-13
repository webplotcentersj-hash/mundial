"use client"

import { useEffect, useState } from "react"
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"

/**
 * Fondo full-bleed. Usamos copia con nombre simple en `public/argentina-mundial-hero.jpg`
 * (evita el nombre largo con `.com` antes de `.jpg`, que a veces rompe el optimizador de Next/Image).
 * Si actualizás la foto, reemplazá ese archivo o volvé a copiar desde
 * `seleccion-argentina-con-trofeo-copa-mundial-fifa_3840x2160_xtrafondos.com.jpg`.
 */
const PARALLAX_IMAGE = "/argentina-mundial-hero.jpg"

export default function SiteParallaxBackground() {
  const mx = useMotionValue(0.5)
  const my = useMotionValue(0.5)
  const springCfg = { stiffness: 68, damping: 24, mass: 0.85 }
  const rotateX = useSpring(useTransform(my, [0, 1], [8, -8]), springCfg)
  const rotateY = useSpring(useTransform(mx, [0, 1], [-9, 9]), springCfg)
  const layerZ = useSpring(useTransform(mx, [0, 0.5, 1], [-14, 0, 14]), { stiffness: 52, damping: 26 })
  const backSpring = { stiffness: 40, damping: 28, mass: 0.9 }
  const rotateXBack = useSpring(useTransform(my, [0, 1], [4.5, -4.5]), backSpring)
  const rotateYBack = useSpring(useTransform(mx, [0, 1], [-4.5, 4.5]), backSpring)

  const [reduceMotion, setReduceMotion] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    const sync = () => setReduceMotion(mq.matches)
    sync()
    mq.addEventListener("change", sync)
    return () => mq.removeEventListener("change", sync)
  }, [])

  useEffect(() => {
    if (reduceMotion) return
    const onMove = (e: PointerEvent) => {
      const w = window.innerWidth || 1
      const h = window.innerHeight || 1
      mx.set(Math.min(1, Math.max(0, e.clientX / w)))
      my.set(Math.min(1, Math.max(0, e.clientY / h)))
    }
    const reset = () => {
      mx.set(0.5)
      my.set(0.5)
    }
    window.addEventListener("pointermove", onMove, { passive: true })
    window.addEventListener("blur", reset)
    return () => {
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("blur", reset)
    }
  }, [mx, my, reduceMotion])

  const backLayer = "-inset-[18%] absolute [transform-style:preserve-3d]"
  const frontLayer = "-inset-[14%] absolute [transform-style:preserve-3d]"

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0"
      style={{ perspective: "1600px" }}
      aria-hidden
    >
      <div className="absolute inset-0 bg-[#030712]" />
      <div className="absolute inset-0 bg-gradient-to-br from-[#0c1829]/65 via-[#050a12]/45 to-[#120805]/70" />

      {reduceMotion ? (
        <>
          <div className={backLayer}>
            <img
              src={PARALLAX_IMAGE}
              alt=""
              width={3840}
              height={2160}
              decoding="async"
              fetchPriority="high"
              className="h-full w-full object-cover object-[center_34%] brightness-[0.52] saturate-[1.05] blur-[2px] scale-105"
            />
          </div>
          <div className={frontLayer}>
            <img
              src={PARALLAX_IMAGE}
              alt=""
              width={3840}
              height={2160}
              decoding="async"
              fetchPriority="high"
              className="h-full w-full object-cover object-[center_32%] brightness-[0.85] contrast-[1.02]"
            />
          </div>
        </>
      ) : (
        <>
          <motion.div
            className={`${backLayer} will-change-transform`}
            style={{ rotateX: rotateXBack, rotateY: rotateYBack, translateZ: -48 }}
          >
            <img
              src={PARALLAX_IMAGE}
              alt=""
              width={3840}
              height={2160}
              decoding="async"
              className="h-full w-full object-cover object-[center_34%] brightness-[0.52] saturate-[1.05] blur-[2px] scale-105"
            />
          </motion.div>
          <motion.div
            className={`${frontLayer} will-change-transform`}
            style={{ rotateX, rotateY, translateZ: layerZ }}
          >
            <img
              src={PARALLAX_IMAGE}
              alt=""
              width={3840}
              height={2160}
              decoding="async"
              fetchPriority="high"
              className="h-full w-full object-cover object-[center_32%] brightness-[0.85] contrast-[1.02] scale-[1.02]"
            />
          </motion.div>
        </>
      )}

      <div className="absolute inset-0 bg-gradient-to-b from-[#030712]/50 via-[#030712]/12 to-[#030712]/58" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#030712]/38 via-transparent to-[#030712]/38" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_55%_at_50%_-10%,rgba(235,103,27,0.12),transparent_50%),radial-gradient(ellipse_70%_50%_at_100%_80%,rgba(245,158,11,0.08),transparent_45%)]" />
    </div>
  )
}
