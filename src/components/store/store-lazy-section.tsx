'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

/** Monta hijos cuando la sección entra (cerca) del viewport — evita cargar 16+ thumbs de golpe. */
export function StoreLazySection({
  children,
  minHeight = 420,
  rootMargin = '240px',
}: {
  children: ReactNode
  minHeight?: number
  rootMargin?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!visible && typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return
    }
    if (!el || visible) return

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true)
          io.disconnect()
        }
      },
      { rootMargin },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [visible, rootMargin])

  return (
    <div ref={ref} style={visible ? undefined : { minHeight }}>
      {visible ? children : null}
    </div>
  )
}
