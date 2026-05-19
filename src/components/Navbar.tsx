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
  HelpCircle,
  Medal,
  Sparkles,
  LayoutDashboard,
  LogIn,
  LogOut,
  UserRound,
} from 'lucide-react'
import { NavStoreMenu } from '@/components/nav-store-menu'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { SITE_CONTENT_OUTER } from '@/lib/siteContentLayout'
import { signout } from '@/app/login/actions'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import { cn } from '@/lib/utils'

const navLinks: { href: string; label: string; icon: LucideIcon }[] = [
  { href: '/bracket', label: 'Llaves', icon: GitBranch },
  { href: '/fixture', label: 'Fixture', icon: CalendarDays },
  { href: '/ranking', label: 'Ranking', icon: Medal },
  { href: '/trivia', label: 'Trivia', icon: HelpCircle },
  { href: '/figurita', label: 'Mi Figurita', icon: Sparkles },
  { href: '/dashboard', label: 'Mi Prode', icon: LayoutDashboard },
]

const navItemClass =
  'group relative flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3.5 py-2 text-sm font-semibold text-white/85 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition-all duration-200 outline-none hover:border-white/20 hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#060913]'

const navItemPlotStore =
  'group relative flex items-center gap-2 px-2 py-2 text-sm font-bold outline-none transition-colors duration-200 font-[family-name:var(--font-plot-store-ui)] text-[#111] hover:text-[#5d3fd3] hover:underline hover:decoration-2 hover:decoration-[#5d3fd3] hover:underline-offset-[5px] focus-visible:ring-2 focus-visible:ring-[#111] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f8f8f8]'

const navCtaPlotStore =
  'inline-flex items-center gap-2 border-2 border-[#111] bg-white px-3.5 py-2 text-xs font-[family-name:var(--font-plot-store-ui)] font-bold uppercase tracking-wide text-[#111] shadow-[3px_3px_0_#bbb] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#111] focus-visible:ring-2 focus-visible:ring-[#111] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f8f8f8]'

export default function Navbar() {
  const pathname = usePathname()
  const plotStoreChrome =
    pathname === '/' ||
    pathname.startsWith('/store') ||
    pathname.startsWith('/figurita') ||
    pathname.startsWith('/fixture') ||
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/trivia')
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
    <nav
      className={cn(
        'fixed w-full z-50',
        plotStoreChrome
          ? 'border-b-2 border-[#111] bg-[#f8f8f8]/95 backdrop-blur-sm shadow-[0_4px_24px_-8px_rgba(0,0,0,0.12)]'
          : 'border-b border-white/[0.07] bg-[#060913]/75 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.35)]',
      )}
    >
      <div className={SITE_CONTENT_OUTER}>
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center min-w-0">
            <Link
              href="/"
              className={cn(
                'relative flex items-center group shrink-0',
                plotStoreChrome
                  ? 'rounded-lg border border-[#b8b8b8] bg-[#d4d4d4] px-2.5 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]'
                  : 'py-2',
              )}
            >
              {!plotStoreChrome ? (
                <div className="pointer-events-none absolute inset-0 rounded-full bg-white/5 blur-2xl opacity-70 transition-opacity group-hover:opacity-100" />
              ) : (
                <div className="pointer-events-none absolute inset-0 rounded-lg bg-[#ccff00]/20 opacity-0 blur-xl transition-opacity group-hover:opacity-100" />
              )}
              <Image
                src="/plot%20center%20mundial.png"
                alt="Plot Mundial Logo"
                width={160}
                height={45}
                className={cn(
                  'relative z-10 object-contain',
                  plotStoreChrome
                    ? 'drop-shadow-[0_2px_6px_rgba(0,0,0,0.12)]'
                    : 'drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]',
                )}
              />
            </Link>
          </div>

          <div className="hidden md:flex flex-1 items-center justify-end gap-5 min-w-0 font-[family-name:var(--font-plot-store-ui)]">
            <div
              className={cn(
                'flex flex-wrap items-center justify-end gap-x-1 gap-y-1',
                !plotStoreChrome &&
                  'rounded-full border border-white/12 bg-black/25 p-1 pl-1.5 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_12px_40px_-12px_rgba(0,0,0,0.5)] ring-1 ring-white/[0.05]',
              )}
            >
              {navLinks.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={plotStoreChrome ? navItemPlotStore : navItemClass}
                >
                  <Icon
                    className={cn(
                      'h-4 w-4 shrink-0 transition-transform',
                      plotStoreChrome ? 'opacity-95 group-hover:scale-110' : 'opacity-90 group-hover:scale-110',
                    )}
                    aria-hidden
                  />
                  <span className="whitespace-nowrap">{label}</span>
                </Link>
              ))}
              <NavStoreMenu
                plotStoreChrome={plotStoreChrome}
                itemClass={plotStoreChrome ? navItemPlotStore : navItemClass}
              />
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {!authReady ? (
                <div
                  className={cn(
                    'h-9 w-24 animate-pulse rounded-full',
                    plotStoreChrome ? 'bg-[#111]/10' : 'bg-white/5',
                  )}
                  aria-hidden
                />
              ) : user ? (
                <>
                  <Link
                    href="/dashboard"
                    className={cn(
                      plotStoreChrome
                        ? cn(navItemPlotStore, 'hidden max-w-[140px] lg:inline-flex')
                        : cn(navItemClass, 'hidden max-w-[140px] lg:inline-flex'),
                    )}
                    title={user.email ?? ''}
                  >
                    <UserRound className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
                    <span className="truncate">{displayName}</span>
                  </Link>
                  <form action={signout}>
                    <button
                      type="submit"
                      className={plotStoreChrome ? navCtaPlotStore : navItemClass}
                    >
                      <LogOut className="h-4 w-4" aria-hidden />
                      Salir
                    </button>
                  </form>
                </>
              ) : (
                <Link href="/login" className={plotStoreChrome ? navCtaPlotStore : navItemClass}>
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
              className={cn(
                'p-2 rounded-md transition-colors',
                plotStoreChrome
                  ? 'border-2 border-[#111] bg-white text-[#111] shadow-[2px_2px_0_#bbb] hover:shadow-[4px_4px_0_#111] hover:-translate-x-px hover:-translate-y-px'
                  : 'text-gray-300 hover:text-white rounded-full hover:bg-white/10 border border-white/10',
              )}
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
            className={cn(
              'md:hidden overflow-hidden border-t',
              plotStoreChrome
                ? 'border-[#111] bg-[#f8f8f8]'
                : 'border-white/10 bg-[#0a0f1c]/95 backdrop-blur-xl',
            )}
          >
            <div className="px-4 py-4 flex flex-col gap-2 font-[family-name:var(--font-plot-store-ui)]">
              {navLinks.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    plotStoreChrome ? navItemPlotStore : navItemClass,
                    'justify-center py-3',
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                  {label}
                </Link>
              ))}
              <div className="flex flex-col gap-1 border-t border-[#111]/15 pt-2 mt-1">
                <p
                  className={cn(
                    'px-2 text-xs font-bold uppercase tracking-wide',
                    plotStoreChrome ? 'text-[#666]' : 'text-white/50',
                  )}
                >
                  Store
                </p>
                <Link
                  href="/store/combo"
                  onClick={() => setMobileOpen(false)}
                  className={cn(plotStoreChrome ? navItemPlotStore : navItemClass, 'justify-center py-3')}
                >
                  Combo
                </Link>
                <Link
                  href="/store/posters"
                  onClick={() => setMobileOpen(false)}
                  className={cn(plotStoreChrome ? navItemPlotStore : navItemClass, 'justify-center py-3')}
                >
                  Posters
                </Link>
                <Link
                  href="/store/stickers"
                  onClick={() => setMobileOpen(false)}
                  className={cn(plotStoreChrome ? navItemPlotStore : navItemClass, 'justify-center py-3')}
                >
                  Stickers
                </Link>
              </div>
              {authReady && user ? (
                <div
                  className={cn(
                    'flex flex-col gap-2 mt-2 pt-2 border-t',
                    plotStoreChrome ? 'border-[#111]/20' : 'border-white/10',
                  )}
                >
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      plotStoreChrome ? navItemPlotStore : navItemClass,
                      'justify-center py-3',
                    )}
                  >
                    <UserRound className="h-4 w-4 opacity-90" aria-hidden />
                    {displayName}
                  </Link>
                  <form action={signout}>
                    <button
                      type="submit"
                      className={cn(
                        plotStoreChrome ? navCtaPlotStore : navItemClass,
                        'w-full justify-center py-3',
                      )}
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
                  className={cn(
                    plotStoreChrome ? navCtaPlotStore : navItemClass,
                    'mt-2 justify-center py-3',
                  )}
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
