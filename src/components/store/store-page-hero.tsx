'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Package, ShoppingCart, Sparkles } from 'lucide-react'

type StorePageHeroProps = {
  cartItemCount: number
}

export function StorePageHero({ cartItemCount }: StorePageHeroProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mb-12 text-center md:mb-16 md:text-left"
    >
      <div className="mb-5 flex flex-col items-center gap-3 md:flex-row md:flex-wrap md:items-center md:gap-4">
        <span className="inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-gradient-to-r from-violet-500/20 to-fuchsia-500/15 px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.2em] text-violet-200/95 shadow-[0_0_24px_rgba(139,92,246,0.2)]">
          <Package className="h-3.5 w-3.5 text-fuchsia-300" aria-hidden />
          Plot Mundial · Store
        </span>
        <span className="hidden h-px w-12 bg-gradient-to-r from-transparent to-white/20 md:block" />
        <span className="text-xs font-medium text-white/45">Impresión y merchandising</span>
      </div>

      <h1 className="mx-auto max-w-4xl text-4xl font-black leading-[1.02] tracking-tighter text-transparent sm:text-5xl md:mx-0 md:text-6xl md:leading-[0.95] lg:text-7xl">
        <span className="bg-gradient-to-br from-white via-violet-100 to-fuchsia-300 bg-clip-text">Tu pedido,</span>{' '}
        <span className="bg-gradient-to-r from-fuchsia-400 via-violet-300 to-cyan-300 bg-clip-text">con onda de estadio.</span>
      </h1>

      <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-white/55 md:mx-0 md:text-lg">
        Elegí figuritas, stickers o posters. Si ya tenés el PNG desde{' '}
        <Link
          href="/figurita"
          className="font-semibold text-emerald-300/90 underline decoration-emerald-500/40 underline-offset-2 hover:text-emerald-200"
        >
          Mi Figurita
        </Link>
        , lo adjuntamos al pedido. Después completá datos y enviamos todo junto.
      </p>

      <ol className="mx-auto mt-8 grid max-w-2xl gap-3 text-left text-sm text-white/60 md:mx-0 md:max-w-none md:grid-cols-3 md:gap-4">
        <li className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-sm">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-500/25 text-sm font-black text-violet-200">
            1
          </span>
          <span>
            <strong className="block text-white/90">Elegí producto y cantidad</strong>
            Abajo marcá figurita, sticker o poster.
          </span>
        </li>
        <li className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-sm">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-fuchsia-500/25 text-sm font-black text-fuchsia-200">
            2
          </span>
          <span>
            <strong className="block text-white/90">Opcional: arte Mi Figurita</strong>
            Si venís del editor, el PNG ya puede estar listo para imprenta.
          </span>
        </li>
        <li className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-sm">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-500/20 text-sm font-black text-cyan-200">
            3
          </span>
          <span>
            <strong className="block text-white/90">Carrito y datos de envío</strong>
            Revisá líneas, completá contacto y mandá el pedido.
          </span>
        </li>
      </ol>

      <div className="mx-auto mt-8 flex max-w-2xl flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center md:mx-0 md:max-w-none md:justify-start">
        <Link
          href="#store-armado"
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-violet-600 px-6 py-3.5 text-sm font-black uppercase tracking-widest text-white shadow-[0_0_32px_rgba(168,85,247,0.35)] transition hover:brightness-110"
        >
          Ir a productos
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
        <Link
          href="/figurita"
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/[0.06] px-6 py-3.5 text-sm font-bold text-white/90 transition hover:border-violet-400/40 hover:bg-white/[0.1]"
        >
          <Sparkles className="h-4 w-4 text-emerald-300" aria-hidden />
          Abrir Mi Figurita
        </Link>
        <Link
          href="#store-cart"
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-black/25 px-6 py-3.5 text-sm font-semibold text-white/75 transition hover:border-fuchsia-400/35 hover:text-white"
        >
          <ShoppingCart className="h-4 w-4 text-fuchsia-300" aria-hidden />
          Ver carrito
          {cartItemCount > 0 ? (
            <span className="rounded-full bg-fuchsia-500/25 px-2 py-0.5 text-xs font-black text-fuchsia-200">{cartItemCount}</span>
          ) : null}
        </Link>
      </div>
    </motion.header>
  )
}
