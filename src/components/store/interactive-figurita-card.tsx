'use client'

import React from 'react'
import Image from 'next/image'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { cn } from '@/lib/utils'

/** Hero local (~67 KB WebP). Antes: PNG 1.2 MB desde plotcenter.com.ar */
export const FIGURITA_HERO_IMAGE = '/figurita-hero.webp'

export const InteractiveTravelCard = React.forwardRef<
  HTMLDivElement,
  { className?: string; imageUrl?: string; alt?: string; priority?: boolean }
>(({ className, imageUrl = FIGURITA_HERO_IMAGE, alt = 'Figurita Lionel Messi', priority = true }, ref) => {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const springConfig = { damping: 15, stiffness: 150 }
  const springX = useSpring(mouseX, springConfig)
  const springY = useSpring(mouseY, springConfig)

  const rotateX = useTransform(springY, [-0.5, 0.5], ['15deg', '-15deg'])
  const rotateY = useTransform(springX, [-0.5, 0.5], ['-15deg', '15deg'])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const { width, height, left, top } = rect
    const mouseXVal = e.clientX - left
    const mouseYVal = e.clientY - top
    mouseX.set(mouseXVal / width - 0.5)
    mouseY.set(mouseYVal / height - 0.5)
  }

  const handleMouseLeave = () => {
    mouseX.set(0)
    mouseY.set(0)
  }

  const isLocal = imageUrl.startsWith('/')

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 1.1, cursor: 'grabbing' }}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
      }}
      className={cn(
        'relative mx-auto h-full w-full min-h-[280px] max-h-[32rem] max-w-[22rem] cursor-grab bg-transparent',
        className,
      )}
    >
      <div
        style={{
          transform: 'translateZ(50px)',
          transformStyle: 'preserve-3d',
        }}
        className="absolute inset-0 h-full w-full"
      >
        {isLocal ? (
          <Image
            src={imageUrl}
            alt={alt}
            fill
            priority={priority}
            fetchPriority={priority ? 'high' : 'auto'}
            sizes="(max-width: 768px) 85vw, 352px"
            draggable={false}
            className="pointer-events-none select-none object-contain drop-shadow-2xl"
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={alt}
            draggable={false}
            fetchPriority={priority ? 'high' : 'auto'}
            decoding="async"
            className="pointer-events-none absolute inset-0 h-full w-full select-none object-contain drop-shadow-2xl"
          />
        )}
      </div>
    </motion.div>
  )
})

InteractiveTravelCard.displayName = 'InteractiveTravelCard'
