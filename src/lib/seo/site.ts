import type { Metadata } from 'next'
import { getAppBaseUrl } from '@/lib/mercadopago/config'

export const SITE_NAME = 'Plot Mundial'
export const SITE_TAGLINE = 'Prode Copa del Mundo FIFA 2026'
export const SITE_DESCRIPTION =
  'Pronosticá los 104 partidos del Mundial FIFA 2026 USA · México · Canadá. Ranking global, ligas privadas, trivia mundialista y store con figuritas, posters y stickers. By Plot Center.'
export const SITE_KEYWORDS = [
  'prode',
  'mundial 2026',
  'copa del mundo',
  'FIFA',
  'pronósticos',
  'fixture',
  'ranking',
  'trivia futbol',
  'Plot Center',
  'Plot Mundial',
  'Argentina',
  'figuritas',
]
export const DEFAULT_OG_IMAGE = '/argentina-mundial-hero.jpg'
export const SITE_LOCALE = 'es_AR'

export function getSiteUrl(): string {
  return getAppBaseUrl()
}

export function absoluteUrl(path: string): string {
  const base = getSiteUrl().replace(/\/$/, '')
  if (path.startsWith('http')) return path
  return `${base}${path.startsWith('/') ? path : `/${path}`}`
}

type PageMetaInput = {
  title: string
  description: string
  path?: string
  ogImage?: string
  noIndex?: boolean
  keywords?: string[]
  type?: 'website' | 'article'
}

export function buildPageMetadata({
  title,
  description,
  path = '',
  ogImage = DEFAULT_OG_IMAGE,
  noIndex = false,
  keywords,
  type = 'website',
}: PageMetaInput): Metadata {
  const url = path ? absoluteUrl(path) : getSiteUrl()
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`
  const imagePath = ogImage.startsWith('http') ? ogImage : absoluteUrl(encodeURI(ogImage))

  return {
    title,
    description,
    keywords: keywords ?? SITE_KEYWORDS,
    alternates: { canonical: url },
    robots: noIndex
      ? { index: false, follow: false, googleBot: { index: false, follow: false } }
      : {
          index: true,
          follow: true,
          googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
        },
    openGraph: {
      type,
      locale: SITE_LOCALE,
      url,
      siteName: SITE_NAME,
      title: fullTitle,
      description,
      images: [
        {
          url: imagePath,
          width: 1200,
          height: 630,
          alt: `${SITE_NAME} — ${SITE_TAGLINE}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [imagePath],
    },
  }
}

export const rootMetadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: `${SITE_NAME} | ${SITE_TAGLINE}`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: SITE_KEYWORDS,
  applicationName: SITE_NAME,
  creator: 'Plot Center',
  publisher: 'Plot Center',
  category: 'sports',
  formatDetection: { email: false, address: false, telephone: false },
  icons: {
    icon: [{ url: '/FAVICON-03-03.png', type: 'image/png' }],
    apple: '/FAVICON-03-03.png',
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: SITE_LOCALE,
    url: '/',
    siteName: SITE_NAME,
    title: `${SITE_NAME} | ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} — Prode Mundial 2026`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} | ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
}

export function buildWebsiteJsonLd() {
  const url = getSiteUrl()
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${url}/#website`,
        url,
        name: SITE_NAME,
        description: SITE_DESCRIPTION,
        inLanguage: 'es-AR',
        publisher: { '@id': `${url}/#organization` },
      },
      {
        '@type': 'Organization',
        '@id': `${url}/#organization`,
        name: 'Plot Center',
        url: 'https://plotcenter.com.ar',
        logo: absoluteUrl('/FAVICON-03-03.png'),
        sameAs: ['https://plotcenter.com.ar'],
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'customer support',
          email: 'contacto@plotcenter.com.ar',
          telephone: '+54-264-6212163',
          availableLanguage: 'Spanish',
        },
      },
      {
        '@type': 'WebApplication',
        name: SITE_NAME,
        url,
        applicationCategory: 'SportsApplication',
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'ARS' },
        description: SITE_DESCRIPTION,
      },
    ],
  }
}
