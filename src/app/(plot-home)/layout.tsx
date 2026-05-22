import { Archivo_Black, Space_Grotesk } from 'next/font/google'
import { WebsiteJsonLd } from '@/components/seo/website-json-ld'
import { buildPageMetadata } from '@/lib/seo/site'
import '../store/store.css'

export const metadata = buildPageMetadata({
  title: 'Prode Mundial 2026 en vivo',
  description:
    'Pronosticá el Mundial FIFA 2026, competí en el ranking global, jugá trivia y armá tu figurita. Prode oficial de Plot Center con fixture en vivo.',
  path: '/',
  keywords: [
    'prode mundial 2026',
    'pronósticos copa del mundo',
    'fixture FIFA',
    'ranking prode',
    'Plot Mundial',
  ],
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

export default function PlotHomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`plot-home-store plot-store ${storeSans.variable} ${storeDisplay.variable}`}>
      <WebsiteJsonLd />
      <link rel="preload" as="image" href="/figurita-hero.webp" type="image/webp" />
      {children}
    </div>
  )
}
