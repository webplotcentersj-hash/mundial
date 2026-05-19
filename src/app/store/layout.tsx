import { Archivo_Black, Space_Grotesk } from 'next/font/google'
import { StoreShell } from '@/components/store/store-shell'
import './store.css'

const storeSans = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-store-sans',
})

const storeDisplay = Archivo_Black({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-store-display',
})

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`plot-store ${storeSans.variable} ${storeDisplay.variable}`}>
      <StoreShell>{children}</StoreShell>
    </div>
  )
}
