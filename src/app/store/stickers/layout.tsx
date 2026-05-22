import { buildPageMetadata } from '@/lib/seo/site'

export const metadata = buildPageMetadata({
  title: 'Stickers en vinilo',
  description:
    'Planchas de stickers del Mundial 2026 en vinilo. Diseños exclusivos Plot Center para pegar donde quieras.',
  path: '/store/stickers',
  ogImage: '/stiker/thumbs/STORE-01.webp',
})

export default function StoreStickersLayout({ children }: { children: React.ReactNode }) {
  return children
}
