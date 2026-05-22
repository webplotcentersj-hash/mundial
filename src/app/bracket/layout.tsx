import { buildPageMetadata } from '@/lib/seo/site'

export const metadata = buildPageMetadata({
  title: 'Llaves del Mundial',
  description:
    'Bracket interactivo del Mundial FIFA 2026. Simulá fases finales y compartí tus llaves del torneo.',
  path: '/bracket',
  keywords: ['llaves mundial', 'bracket copa del mundo', 'eliminatorias FIFA 2026'],
})

export default function BracketLayout({ children }: { children: React.ReactNode }) {
  return children
}
