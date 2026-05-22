import type { ReactNode } from 'react'
import { Archivo_Black, Space_Grotesk } from 'next/font/google'
import { buildPageMetadata } from '@/lib/seo/site'
import '../store/store.css'

export const metadata = buildPageMetadata({
  title: 'Trivia mundialista',
  description:
    'Trivia de fútbol y Copa del Mundo: preguntas de fácil a difícil, puntos por acierto y ranking separado del prode.',
  path: '/trivia',
  keywords: ['trivia futbol', 'trivia mundial', 'preguntas copa del mundo'],
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

export default function TriviaLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`plot-trivia-store plot-store ${storeSans.variable} ${storeDisplay.variable}`}>
      {children}
    </div>
  )
}
