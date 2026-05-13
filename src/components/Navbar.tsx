'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

const navLinks = [
  { href: '/bracket', label: '🏆 Llaves', className: 'border border-primary/30 bg-primary/10 text-primary' },
  { href: '/fixture', label: 'Fixture', className: '' },
  { href: '/ranking', label: 'Ranking', className: '' },
  { href: '/figurita', label: '✨ Mi Figurita', className: 'border border-emerald-400/30 bg-emerald-400/10 text-emerald-400' },
  { href: '/dashboard', label: 'Mi Prode', className: 'font-bold text-amber-500' },
] as const

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

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

  return (
    <nav className="fixed w-full z-50 glass-card border-b-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center relative group py-2">
              <div className="absolute inset-0 bg-white/5 blur-2xl rounded-full opacity-70 group-hover:opacity-100 transition-opacity"></div>
              <Image src="/plot%20center%20mundial.png" alt="Plot Mundial Logo" width={160} height={45} className="relative z-10 object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]" />
            </Link>
          </div>

          <div className="hidden md:flex items-center justify-end flex-1">
            <div className="ml-10 flex items-baseline space-x-4 mr-6">
              {navLinks.map(({ href, label, className }) => (
                <Link
                  key={href}
                  href={href}
                  className={`hover:text-primary transition-colors px-3 py-2 rounded-md text-sm font-medium ${className}`}
                >
                  {label}
                </Link>
              ))}
            </div>

            <Link href="/login" className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md text-sm font-medium transition-all shadow-[0_0_15px_rgba(235,103,27,0.3)]">
              Ingresar
            </Link>
          </div>

          <div className="md:hidden flex items-center gap-2">
            <button
              type="button"
              aria-expanded={mobileOpen}
              aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
              onClick={() => setMobileOpen((o) => !o)}
              className="text-gray-300 hover:text-white p-2 rounded-md hover:bg-white/5"
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
            <div className="px-4 py-4 flex flex-col gap-1">
              {navLinks.map(({ href, label, className }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={`px-4 py-3 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors ${className}`}
                >
                  {label}
                </Link>
              ))}
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="mt-2 text-center bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-3 rounded-lg text-sm font-medium shadow-[0_0_15px_rgba(235,103,27,0.3)]"
              >
                Ingresar
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
