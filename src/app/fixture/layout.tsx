import type { ReactNode } from 'react'
import { Archivo_Black, Space_Grotesk } from 'next/font/google'
import { buildPageMetadata } from '@/lib/seo/site'
import '../store/store.css'

export const metadata = buildPageMetadata({
  title: 'Fixture oficial FIFA 2026',
  description:
    'Calendario completo del Mundial 2026: 104 partidos, sedes, grupos y horarios. Cargá tus pronósticos partido a partido.',
  path: '/fixture',
  keywords: ['fixture mundial 2026', 'calendario copa del mundo', 'partidos FIFA', 'prode fixture'],
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

export default function FixtureLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`plot-fixture-store plot-store ${storeSans.variable} ${storeDisplay.variable}`}>
      {children}
    </div>
  )
}
