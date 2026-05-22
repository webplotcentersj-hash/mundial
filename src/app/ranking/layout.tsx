import { buildPageMetadata } from '@/lib/seo/site'

export const metadata = buildPageMetadata({
  title: 'Ranking Prode y Trivia',
  description:
    'Ranking global del prode y trivia del Mundial 2026. Top jugadores por pronósticos y por puntos de trivia.',
  path: '/ranking',
  keywords: ['ranking prode', 'ranking trivia', 'tabla posiciones mundial'],
})

export default function RankingLayout({ children }: { children: React.ReactNode }) {
  return children
}
