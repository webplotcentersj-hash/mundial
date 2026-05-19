'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown, LayoutGrid, ImageIcon, Layers, Store } from 'lucide-react'
import { cn } from '@/lib/utils'

const storeLinks = [
  { href: '/store/combo', label: 'Combo', icon: LayoutGrid },
  { href: '/store/posters', label: 'Posters', icon: ImageIcon },
  { href: '/store/stickers', label: 'Stickers', icon: Layers },
] as const

type NavStoreMenuProps = {
  plotStoreChrome: boolean
  itemClass: string
  onNavigate?: () => void
}

export function NavStoreMenu({ plotStoreChrome, itemClass, onNavigate }: NavStoreMenuProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const storeActive = pathname.startsWith('/store')

  useEffect(() => {
    if (!open) return
    function onPointerDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((o) => !o)}
        className={cn(itemClass, storeActive && plotStoreChrome && 'text-[#5d3fd3] underline decoration-2 underline-offset-[5px]')}
      >
        <Store className="h-4 w-4 shrink-0 opacity-95 group-hover:scale-110 transition-transform" aria-hidden />
        <span className="whitespace-nowrap">Store</span>
        <ChevronDown
          className={cn('h-4 w-4 shrink-0 transition-transform', open && 'rotate-180')}
          aria-hidden
        />
      </button>

      {open ? (
        <div
          className={cn(
            'absolute right-0 top-[calc(100%+8px)] z-[60] min-w-[200px] overflow-hidden border-2 py-1 shadow-[4px_4px_0_#111]',
            plotStoreChrome
              ? 'border-[#111] bg-[#f8f8f8]'
              : 'border-white/15 bg-[#0c1220] shadow-[0_16px_40px_rgba(0,0,0,0.45)]',
          )}
          role="menu"
        >
          {storeLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              role="menuitem"
              onClick={() => {
                setOpen(false)
                onNavigate?.()
              }}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 text-sm font-semibold transition-colors',
                plotStoreChrome
                  ? 'text-[#111] hover:bg-[#ccff00]/40'
                  : 'text-white/90 hover:bg-white/10',
                pathname === href && (plotStoreChrome ? 'bg-[#ccff00]/50' : 'bg-white/10'),
              )}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden />
              {label}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  )
}
