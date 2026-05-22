import { buildPageMetadata } from '@/lib/seo/site'

export const metadata = buildPageMetadata({
  title: 'Iniciar sesión',
  description: 'Accedé a Plot Mundial para guardar pronósticos, sumar puntos y participar del prode FIFA 2026.',
  path: '/login',
  noIndex: true,
})

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children
}
