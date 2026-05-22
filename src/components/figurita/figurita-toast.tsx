'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, X } from 'lucide-react'
import { playGoalSound } from '@/lib/sounds/playGoalSound'
import { cn } from '@/lib/utils'

export type FiguritaToastPayload = {
  title: string
  description?: string
  playSound?: boolean
}

type FiguritaToastContextValue = {
  showToast: (payload: FiguritaToastPayload) => void
}

const FiguritaToastContext = createContext<FiguritaToastContextValue | null>(null)

const TOAST_MS = 5200

export function FiguritaToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<FiguritaToastPayload | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const dismiss = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setToast(null)
  }, [])

  const showToast = useCallback((payload: FiguritaToastPayload) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setToast(payload)
    if (payload.playSound !== false) {
      playGoalSound()
    }
    timerRef.current = setTimeout(() => setToast(null), TOAST_MS)
  }, [])

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current)
  }, [])

  return (
    <FiguritaToastContext.Provider value={{ showToast }}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-20 z-[100] flex justify-center px-4 sm:bottom-6 sm:justify-end sm:px-6"
        aria-live="polite"
        aria-relevant="additions"
      >
        <AnimatePresence>
          {toast && (
            <motion.div
              key={toast.title}
              role="status"
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ type: 'spring', damping: 22, stiffness: 320 }}
              className={cn(
                'pointer-events-auto flex w-full max-w-sm items-start gap-3 border-[3px] border-[#111] bg-[#ccff00] p-4',
                'font-[family-name:var(--font-store-sans)] shadow-[6px_6px_0_#111]',
              )}
            >
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#111]" aria-hidden />
              <div className="min-w-0 flex-1 pr-1">
                <p className="text-sm font-black uppercase tracking-wide text-[#111] [font-family:var(--font-store-display),sans-serif]">
                  {toast.title}
                </p>
                {toast.description ? (
                  <p className="mt-1 text-xs font-semibold leading-snug text-[#222]">{toast.description}</p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={dismiss}
                className="shrink-0 rounded border-2 border-[#111] bg-white p-1 text-[#111] transition-colors hover:bg-[#f5f5f5]"
                aria-label="Cerrar aviso"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </FiguritaToastContext.Provider>
  )
}

export function useFiguritaToast() {
  const ctx = useContext(FiguritaToastContext)
  if (!ctx) {
    throw new Error('useFiguritaToast debe usarse dentro de FiguritaToastProvider')
  }
  return ctx
}
