import { MercadoPagoConfig } from 'mercadopago'

export type MercadoPagoSetupStatus = {
  ready: boolean
  missing: string[]
  isTestMode: boolean
  appBaseUrl: string
}

export function isMercadoPagoTestToken(token: string): boolean {
  return token.startsWith('TEST-')
}

export function getMercadoPagoSetupStatus(): MercadoPagoSetupStatus {
  const missing: string[] = []
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN?.trim()
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()

  if (!token) missing.push('MERCADOPAGO_ACCESS_TOKEN')
  if (!serviceRole) missing.push('SUPABASE_SERVICE_ROLE_KEY')

  const appBaseUrl = getAppBaseUrl()
  if (!process.env.NEXT_PUBLIC_APP_URL?.trim() && !process.env.VERCEL_URL?.trim()) {
    missing.push('NEXT_PUBLIC_APP_URL (recomendado en local)')
  }

  return {
    ready: missing.filter((m) => !m.includes('recomendado')).length === 0,
    missing,
    isTestMode: token ? isMercadoPagoTestToken(token) : false,
    appBaseUrl,
  }
}

export function isMercadoPagoConfigured(): boolean {
  return getMercadoPagoSetupStatus().ready
}

export function getMercadoPagoClient(): MercadoPagoConfig {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN?.trim()
  if (!accessToken) {
    throw new Error('MERCADOPAGO_ACCESS_TOKEN no está configurado')
  }
  return new MercadoPagoConfig({ accessToken })
}

export function getAppBaseUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_APP_URL?.trim()
  if (explicit) return explicit.replace(/\/$/, '')
  const vercel = process.env.VERCEL_URL?.trim()
  if (vercel) return `https://${vercel.replace(/^https?:\/\//, '')}`
  return 'http://localhost:3000'
}

export function getMercadoPagoWebhookUrl(): string {
  return `${getAppBaseUrl()}/api/mercadopago/webhook`
}

export function pickCheckoutInitPoint(preference: {
  init_point?: string | null
  sandbox_init_point?: string | null
}): string | null {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN?.trim() ?? ''
  const test = isMercadoPagoTestToken(token)
  if (test) {
    return preference.sandbox_init_point ?? preference.init_point ?? null
  }
  return preference.init_point ?? preference.sandbox_init_point ?? null
}
