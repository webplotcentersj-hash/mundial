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
  Store,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { SITE_CONTENT_OUTER } from '@/lib/siteContentLayout'
import { signout } from '@/app/login/actions'
import type { User as SupabaseUser } from '@supabase/supabase-js'

const navLinks: { href: string; label: string; icon: LucideIcon }[] = [
  { href: '/bracket', label: 'Llaves', icon: GitBranch },
  { href: '/fixture', label: 'Fixture', icon: CalendarDays },
  { href: '/ranking', label: 'Ranking', icon: Medal },
  { href: '/figurita', label: 'Mi Figurita', icon: Sparkles },
  { href: '/store', label: 'Store', icon: Store },
  { href: '/dashboard', label: 'Mi Prode', icon: LayoutDashboard },
]

const navItemClass =
  'group relative flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3.5 py-2 text-sm font-semibold text-white/85 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition-all duration-200 outline-none hover:border-white/20 hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#060913]'

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
              {navLinks.map(({ href, label, icon: Icon }) => (
                <Link key={href} href={href} className={navItemClass}>
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
                    className={`${navItemClass} hidden max-w-[140px] lg:inline-flex`}
                    title={user.email ?? ''}
                  >
                    <UserRound className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
                    <span className="truncate">{displayName}</span>
                  </Link>
                  <form action={signout}>
                    <button type="submit" className={navItemClass}>
                      <LogOut className="h-4 w-4" aria-hidden />
                      Salir
                    </button>
                  </form>
                </>
              ) : (
                <Link href="/login" className={navItemClass}>
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
              {navLinks.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={`${navItemClass} justify-center py-3`}
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
                    className={`${navItemClass} justify-center py-3`}
                  >
                    <UserRound className="h-4 w-4 opacity-90" aria-hidden />
                    {displayName}
                  </Link>
                  <form action={signout}>
                    <button type="submit" className={`${navItemClass} w-full justify-center py-3`}>
                      <LogOut className="h-4 w-4" />
                      Salir
                    </button>
                  </form>
                </div>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className={`${navItemClass} mt-2 justify-center py-3`}
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
