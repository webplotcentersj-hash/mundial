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

export default function PlotHomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`plot-home-store plot-store ${storeSans.variable} ${storeDisplay.variable}`}>
      {children}
    </div>
  )
}
