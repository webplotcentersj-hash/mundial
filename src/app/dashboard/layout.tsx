import type { ReactNode } from 'react'
import { Archivo_Black, Space_Grotesk } from 'next/font/google'
import { buildPageMetadata } from '@/lib/seo/site'
import '../store/store.css'

export const metadata = buildPageMetadata({
  title: 'Mi Prode',
  description:
    'Cargá tus pronósticos del Mundial 2026, seguí tus puntos y competí en ligas privadas con amigos.',
  path: '/dashboard',
  keywords: ['mi prode', 'pronósticos', 'ligas privadas', 'puntos prode'],
})

const storeSans = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-store-sans',
})

const storeDisplay = Archivo_Black({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-store-display',
})

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`plot-dashboard-store plot-store ${storeSans.variable} ${storeDisplay.variable}`}>
      {children}
    </div>
  )
}
