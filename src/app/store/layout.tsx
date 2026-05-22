import { Archivo_Black, Space_Grotesk } from 'next/font/google'
import { StoreShell } from '@/components/store/store-shell'
import { buildPageMetadata } from '@/lib/seo/site'
import './store.css'

export const metadata = buildPageMetadata({
  title: 'Store Plot Mundial',
  description:
    'Combos con figurita + stickers + poster, planchas de vinilo y posters del Mundial 2026. Impresión Plot Center.',
  path: '/store/combo',
  ogImage: '/Poster/thumbs/STORE-06.webp',
  keywords: ['store plot mundial', 'posters mundial', 'stickers vinilo', 'combo figurita'],
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

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`plot-store ${storeSans.variable} ${storeDisplay.variable}`}>
      <StoreShell>{children}</StoreShell>
    </div>
  )
}
