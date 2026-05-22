import { buildPageMetadata } from '@/lib/seo/site'

export const metadata = buildPageMetadata({
  title: 'Posters del Mundial',
  description: 'Posters coleccionables del Mundial 2026. Elegí diseño y comprá directo desde Plot Mundial Store.',
  path: '/store/posters',
  ogImage: '/Poster/thumbs/STORE-12.webp',
})

export default function StorePostersLayout({ children }: { children: React.ReactNode }) {
  return children
}
