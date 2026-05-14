import type { FiguritaAiTheme } from '@/lib/figuritaTheme'

/** Patrón de camiseta solo con colores validados por el servidor (hex). */
export function jerseyShirtBackground(theme: FiguritaAiTheme): string {
  const { jerseyPrimary, jerseySecondary, stripeStyle } = theme
  switch (stripeStyle) {
    case 'none':
      return `linear-gradient(180deg, ${jerseyPrimary} 0%, ${jerseyPrimary} 100%)`
    case 'horizontal':
      return `repeating-linear-gradient(0deg, ${jerseyPrimary} 0px, ${jerseyPrimary} 14px, ${jerseySecondary} 14px, ${jerseySecondary} 28px)`
    case 'hoops':
      return `repeating-linear-gradient(0deg, ${jerseyPrimary} 0px, ${jerseyPrimary} 22px, ${jerseySecondary} 22px, ${jerseySecondary} 44px)`
    case 'sash':
      return `linear-gradient(128deg, ${jerseySecondary} 0%, ${jerseySecondary} 32%, ${jerseyPrimary} 45%, ${jerseyPrimary} 55%, ${jerseySecondary} 68%, ${jerseySecondary} 100%)`
    case 'vertical':
    default:
      return `repeating-linear-gradient(90deg, ${jerseyPrimary} 0px, ${jerseyPrimary} 12px, ${jerseySecondary} 12px, ${jerseySecondary} 24px)`
  }
}
