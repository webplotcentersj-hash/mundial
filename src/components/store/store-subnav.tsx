'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Layers, LayoutGrid, ImageIcon, ShoppingCart } from 'lucide-react'
import { useStore } from '@/components/store/store-provider'
import { cn } from '@/lib/utils'

const links = [
  { href: '/store/combo', label: 'Combo', icon: LayoutGrid },
  { href: '/store/posters', label: 'Posters', icon: ImageIcon },
  { href: '/store/stickers', label: 'Stickers', icon: Layers },
] as const

export function StoreSubnav() {
  const pathname = usePathname()
  const { cartItemCount } = useStore()

  return (
    <div className="store-subnav" aria-label="Secciones del store">
      <div className="store-subnav__inner">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`)
          return (
            <Link
              key={href}
              href={href}
              className={cn('store-subnav__link', active && 'store-subnav__link--active')}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden />
              {label}
            </Link>
          )
        })}
        <a
          href="#store-cart"
          className={cn(
            'store-subnav__link store-subnav__link--cart',
            cartItemCount > 0 && 'store-subnav__link--active',
          )}
        >
          <ShoppingCart className="h-4 w-4 shrink-0" aria-hidden />
          Carrito{cartItemCount > 0 ? ` (${cartItemCount})` : ''}
        </a>
      </div>
    </div>
  )
}
