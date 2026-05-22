'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Mail, X } from 'lucide-react'

type Variant = 'before-signup' | 'after-signup'

type Props = {
  open: boolean
  variant: Variant
  onClose: () => void
}

export function EmailConfirmNoticeModal({ open, variant, onClose }: Props) {
  const isAfter = variant === 'after-signup'

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md rounded-2xl border border-sky-400/35 bg-[#0a0f1c] p-6 shadow-2xl shadow-sky-900/30"
            role="dialog"
            aria-modal="true"
            aria-labelledby="email-confirm-title"
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute right-3 top-3 rounded-lg p-2 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Cerrar"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-5 flex justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-sky-400/40 bg-sky-500/15">
                <Mail className="h-7 w-7 text-sky-300" aria-hidden />
              </div>
            </div>

            <h2 id="email-confirm-title" className="mb-3 text-center text-xl font-bold text-white">
              {isAfter ? 'Revisá tu correo' : 'Confirmación por email'}
            </h2>

            <p className="mb-2 text-center text-sm leading-relaxed text-white/75">
              {isAfter
                ? 'Te enviamos un mail para confirmar tu cuenta. Abrí el enlace del correo y después volvé acá para iniciar sesión.'
                : 'Al registrarte te vamos a mandar un mail de confirmación. Tenés que confirmar la cuenta antes de poder entrar a Plot Mundial.'}
            </p>
            <p className="mb-6 text-center text-xs leading-relaxed text-white/50">
              Si no lo ves en unos minutos, revisá spam o promociones.
            </p>

            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-xl bg-primary py-3 font-semibold text-primary-foreground shadow-[0_0_15px_rgba(235,103,27,0.3)] transition-colors hover:bg-primary/90"
            >
              {isAfter ? 'Entendido' : 'Continuar con el registro'}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
