'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Menu, Bell, AlertCircle, Clock, Trophy } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

export default function Navbar() {
  const [isNotifOpen, setIsNotifOpen] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)

  // Cierra el dropdown si se hace click fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <nav className="fixed w-full z-50 glass-card border-b-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center relative group py-2">
              {/* Soft glow background instead of a harsh box */}
              <div className="absolute inset-0 bg-white/5 blur-2xl rounded-full opacity-70 group-hover:opacity-100 transition-opacity"></div>
              <Image src="/plot%20center%20mundial.png" alt="Plot Mundial Logo" width={160} height={45} className="relative z-10 object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]" />
            </Link>
          </div>
          
          <div className="hidden md:flex items-center justify-end flex-1">
            <div className="ml-10 flex items-baseline space-x-4 mr-6">
              <Link href="/bracket" className="hover:text-primary transition-colors px-3 py-2 rounded-md text-sm font-medium border border-primary/30 bg-primary/10 text-primary">🏆 Llaves</Link>
              <Link href="/fixture" className="hover:text-primary transition-colors px-3 py-2 rounded-md text-sm font-medium">Fixture</Link>
              <Link href="/ranking" className="hover:text-primary transition-colors px-3 py-2 rounded-md text-sm font-medium">Ranking</Link>
              <Link href="/figurita" className="hover:text-emerald-400 transition-colors px-3 py-2 rounded-md text-sm font-medium border border-emerald-400/30 bg-emerald-400/10 text-emerald-400">✨ Mi Figurita</Link>
              <Link href="/dashboard" className="hover:text-amber-500 transition-colors px-3 py-2 rounded-md text-sm font-bold text-amber-500">Mi Prode</Link>
            </div>
            
            {/* Notifications removed */}

            <Link href="/login" className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md text-sm font-medium transition-all shadow-[0_0_15px_rgba(235,103,27,0.3)]">
              Ingresar
            </Link>
          </div>

          <div className="md:hidden flex items-center gap-4">
            {/* Notifications mobile removed */}
            <button className="text-gray-300 hover:text-white">
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
