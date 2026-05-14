export type FiguritaStripeStyle = 'vertical' | 'horizontal' | 'sash' | 'none' | 'hoops'

/** Tema visual generado por IA para fondo + camiseta (solo CSS seguro en cliente). */
export type FiguritaAiTheme = {
  backgroundCss: string
  jerseyPrimary: string
  jerseySecondary: string
  jerseyAccent: string
  stripeStyle: FiguritaStripeStyle
}
