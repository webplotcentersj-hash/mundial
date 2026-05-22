import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Cuenta confirmada | Plot Mundial',
  description: 'Tu cuenta en Plot Mundial fue confirmada correctamente.',
}

const CONFIRM_BG = encodeURI('/MAIL DE CONFIRMACIÓN-01 (2).png')

export default function ConfirmacionPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-end overflow-hidden bg-[#0a0f1c] px-4 pb-10 sm:pb-14">
      <div
        aria-hidden
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('${CONFIRM_BG}')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1c]/90 via-[#0a0f1c]/20 to-transparent" aria-hidden />

      <Link
        href="https://plotmundial.com.ar/"
        className="relative z-10 inline-flex min-w-[240px] items-center justify-center rounded-xl bg-primary px-8 py-3.5 text-center text-sm font-bold uppercase tracking-widest text-primary-foreground shadow-[0_0_24px_rgba(235,103,27,0.45)] transition-transform hover:scale-[1.02] hover:bg-primary/90"
      >
        Volver a Plot Mundial
      </Link>
    </div>
  )
}
