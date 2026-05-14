'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { LucideIcon } from 'lucide-react'
import {
  Menu,
  X,
  GitBranch,
  CalendarDays,
  Medal,
  Sparkles,
  LayoutDashboard,
  LogIn,
  LogOut,
  UserRound,
  Printer,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { SITE_CONTENT_OUTER } from '@/lib/siteContentLayout'
import { signout } from '@/app/login/actions'
import type { User as SupabaseUser } from '@supabase/supabase-js'

const navLinks: {
  href: string
  label: string
  icon: LucideIcon
  variant?: 'primary' | 'emerald' | 'amber'
}[] = [
  { href: '/bracket', label: 'Llaves', icon: GitBranch, variant: 'primary' },
  { href: '/fixture', label: 'Fixture', icon: CalendarDays },
  { href: '/ranking', label: 'Ranking', icon: Medal },
  { href: '/figurita', label: 'Mi Figurita', icon: Sparkles, variant: 'emerald' },
  { href: '/pedidos', label: 'Imprenta', icon: Printer },
  { href: '/dashboard', label: 'Mi Prode', icon: LayoutDashboard, variant: 'amber' },
]

function linkClasses(variant?: 'primary' | 'emerald' | 'amber') {
  const base =
    'group relative flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-semibold transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#060913]'
  if (variant === 'primary') {
    return `${base} border border-primary/40 bg-gradient-to-b from-primary/25 via-primary/10 to-primary/5 text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_4px_20px_-8px_rgba(235,103,27,0.55)] hover:from-primary/35 hover:border-primary/60 hover:text-white`
  }
  if (variant === 'emerald') {
    return `${base} border border-emerald-400/35 bg-gradient-to-b from-emerald-500/20 to-emerald-500/5 text-emerald-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] hover:border-emerald-400/55 hover:text-white`
  }
  if (variant === 'amber') {
    return `${base} border border-amber-500/35 bg-gradient-to-b from-amber-500/15 to-amber-500/5 text-amber-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] hover:border-amber-400/55 hover:text-amber-100`
  }
  return `${base} text-white/75 hover:text-white hover:bg-white/10 border border-transparent`
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [authReady, setAuthReady] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user: u } }) => {
      setUser(u ?? null)
      setAuthReady(true)
    })
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setAuthReady(true)
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!mobileOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [mobileOpen])

  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  const displayName =
    user?.user_metadata?.username ||
    user?.email?.split('@')[0] ||
    'Cuenta'

  return (
    <nav className="fixed w-full z-50 border-b border-white/[0.07] bg-[#060913]/75 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
      <div className={SITE_CONTENT_OUTER}>
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center min-w-0">
            <Link href="/" className="flex items-center relative group py-2 shrink-0">
              <div className="absolute inset-0 bg-white/5 blur-2xl rounded-full opacity-70 group-hover:opacity-100 transition-opacity" />
              <Image
                src="/plot%20center%20mundial.png"
                alt="Plot Mundial Logo"
                width={160}
                height={45}
                className="relative z-10 object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]"
              />
            </Link>
          </div>

          <div className="hidden md:flex flex-1 items-center justify-end gap-4 min-w-0">
            <div className="flex flex-wrap items-center justify-end gap-1 rounded-full border border-white/12 bg-black/25 p-1 pl-1.5 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_12px_40px_-12px_rgba(0,0,0,0.5)] ring-1 ring-white/[0.05]">
              {navLinks.map(({ href, label, icon: Icon, variant }) => (
                <Link key={href} href={href} className={linkClasses(variant)}>
                  <Icon className="h-4 w-4 shrink-0 opacity-90 group-hover:scale-110 transition-transform" aria-hidden />
                  <span className="whitespace-nowrap">{label}</span>
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {!authReady ? (
                <div className="h-9 w-24 rounded-full bg-white/5 animate-pulse" aria-hidden />
              ) : user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="hidden lg:inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white/90 hover:bg-white/10 transition-colors max-w-[140px]"
                    title={user.email ?? ''}
                  >
                    <UserRound className="h-4 w-4 text-primary shrink-0" aria-hidden />
                    <span className="truncate">{displayName}</span>
                  </Link>
                  <form action={signout}>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.07] px-4 py-2 text-sm font-semibold text-white/90 hover:bg-white/15 hover:border-white/25 transition-all"
                    >
                      <LogOut className="h-4 w-4" aria-hidden />
                      Salir
                    </button>
                  </form>
                </>
              ) : (
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-amber-600 px-5 py-2.5 text-sm font-bold text-white shadow-[0_0_24px_-4px_rgba(235,103,27,0.75),inset_0_1px_0_rgba(255,255,255,0.2)] hover:brightness-110 hover:shadow-[0_0_28px_-2px_rgba(245,158,11,0.55)] transition-all"
                >
                  <LogIn className="h-4 w-4" aria-hidden />
                  Ingresar
                </Link>
              )}
            </div>
          </div>

          <div className="md:hidden flex items-center gap-2">
            <button
              type="button"
              aria-expanded={mobileOpen}
              aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
              onClick={() => setMobileOpen((o) => !o)}
              className="text-gray-300 hover:text-white p-2 rounded-full hover:bg-white/10 border border-white/10"
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden border-t border-white/10 bg-[#0a0f1c]/95 backdrop-blur-xl"
          >
            <div className="px-4 py-4 flex flex-col gap-2">
              {navLinks.map(({ href, label, icon: Icon, variant }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={`${linkClasses(variant)} justify-center py-3`}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                  {label}
                </Link>
              ))}
              {authReady && user ? (
                <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-white/10">
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold text-white"
                  >
                    <UserRound className="h-4 w-4 text-primary" />
                    {displayName}
                  </Link>
                  <form action={signout}>
                    <button
                      type="submit"
                      className="w-full flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold text-white hover:bg-white/10"
                    >
                      <LogOut className="h-4 w-4" />
                      Salir
                    </button>
                  </form>
                </div>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-amber-600 px-4 py-3 text-sm font-bold text-white shadow-lg"
                >
                  <LogIn className="h-4 w-4" />
                  Ingresar
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
