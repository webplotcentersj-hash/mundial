import { NextResponse } from 'next/server'
import { getMercadoPagoSetupStatus, getMercadoPagoWebhookUrl } from '@/lib/mercadopago/config'

export const runtime = 'nodejs'

/** Estado de configuración MP (sin exponer secretos). */
export async function GET() {
  const status = getMercadoPagoSetupStatus()
  return NextResponse.json({
    ready: status.ready,
    missing: status.missing,
    testMode: status.isTestMode,
    appBaseUrl: status.appBaseUrl,
    webhookUrl: getMercadoPagoWebhookUrl(),
  })
}
