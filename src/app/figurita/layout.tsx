import type { ReactNode } from 'react'
import { Archivo_Black, Space_Grotesk } from 'next/font/google'
import '../store/store.css'

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
      {children}
    </div>
  )
}
