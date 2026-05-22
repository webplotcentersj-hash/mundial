import type { ReactNode } from 'react'
import { Archivo_Black, Space_Grotesk } from 'next/font/google'
import { buildPageMetadata } from '@/lib/seo/site'
import { FiguritaToastProvider } from '@/components/figurita/figurita-toast'
import '../store/store.css'

export const metadata = buildPageMetadata({
  title: 'Mi Figurita',
  description:
    'Creá tu figurita personalizada con IA para el Mundial 2026 e incluila en el combo del Store Plot Mundial.',
  path: '/figurita',
  ogImage: '/figurita-hero.webp',
  keywords: ['figurita personalizada', 'figuritas mundial', 'Mi Figurita Plot'],
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

export const maxDuration = 120

export default function FiguritaLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`plot-figurita-store plot-store ${storeSans.variable} ${storeDisplay.variable}`}>
      <FiguritaToastProvider>{children}</FiguritaToastProvider>
    </div>
  )
}
