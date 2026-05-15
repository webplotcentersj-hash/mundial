'use client'

import React from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { cn } from '@/lib/utils'

export const FIGURITA_HERO_IMAGE =
  'https://plotcenter.com.ar/wp-content/uploads/2026/05/figurita-lionel-messi.png'

export const InteractiveTravelCard = React.forwardRef<
  HTMLDivElement,
  { className?: string; imageUrl?: string; alt?: string }
>(({ className, imageUrl = FIGURITA_HERO_IMAGE, alt = 'Figurita Lionel Messi' }, ref) => {
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
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={alt}
          draggable={false}
          className="pointer-events-none absolute inset-0 h-full w-full select-none object-contain drop-shadow-2xl"
        />
      </div>
    </motion.div>
  )
})

InteractiveTravelCard.displayName = 'InteractiveTravelCard'
