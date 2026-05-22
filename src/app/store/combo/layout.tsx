import { buildPageMetadata } from '@/lib/seo/site'

export const metadata = buildPageMetadata({
  title: 'Combo figurita + stickers + poster',
  description:
    'Armá tu combo Plot Mundial: figurita personalizada, plancha de stickers en vinilo y poster a elección.',
  path: '/store/combo',
  ogImage: '/Poster/thumbs/STORE-06.webp',
})

export default function StoreComboLayout({ children }: { children: React.ReactNode }) {
  return children
}
