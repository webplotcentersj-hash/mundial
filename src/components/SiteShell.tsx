'use client'

import { usePathname } from 'next/navigation'
import Navbar from '@/components/Navbar'
import SiteFooter from '@/components/SiteFooter'

/** Rutas a pantalla completa sin navbar ni footer. */
const BARE_ROUTES = new Set(['/confirmacion'])

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const bare = pathname ? BARE_ROUTES.has(pathname) : false

  if (bare) {
    return <main className="relative z-10 flex-grow">{children}</main>
  }

  return (
    <>
      <Navbar />
      <main className="relative z-10 flex-grow pt-16">{children}</main>
      <SiteFooter />
    </>
  )
}
