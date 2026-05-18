import { NextResponse } from 'next/server'
import { syncStoreCheckoutPayment } from '@/lib/mercadopago/sync-payment'
import { createAdminClient } from '@/lib/supabase/admin'
import { isMercadoPagoConfigured } from '@/lib/mercadopago/config'

export const runtime = 'nodejs'

type WebhookPayload = {
  type?: string
  action?: string
  data?: { id?: string }
}

async function resolveCheckoutId(paymentId: string): Promise<string | null> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('store_checkouts')
    .select('id')
    .eq('mp_payment_id', paymentId)
    .maybeSingle()
  if (data?.id) return data.id as string
  return null
}

export async function POST(request: Request) {
  if (!isMercadoPagoConfigured()) {
    return NextResponse.json({ ok: false }, { status: 503 })
  }

  let paymentId: string | null = null
  let checkoutId: string | null = null

  const url = new URL(request.url)
  const topic = url.searchParams.get('topic') ?? url.searchParams.get('type')
  const queryId = url.searchParams.get('id') ?? url.searchParams.get('data.id')

  if (topic === 'payment' && queryId) {
    paymentId = queryId
  }

  try {
    const body = (await request.json()) as WebhookPayload
    if (!paymentId && body.type === 'payment' && body.data?.id) {
      paymentId = String(body.data.id)
    }
  } catch {
    /* body vacío o no JSON — puede venir solo por query */
  }

  if (!paymentId) {
    return NextResponse.json({ ok: true, skipped: 'no payment id' })
  }

  if (!checkoutId) {
    const { Payment } = await import('mercadopago')
    const { getMercadoPagoClient } = await import('@/lib/mercadopago/config')
    try {
      const payment = await new Payment(getMercadoPagoClient()).get({ id: paymentId })
      checkoutId = payment.external_reference ?? null
    } catch (e) {
      console.error('webhook fetch payment:', e)
    }
  }

  if (!checkoutId) {
    checkoutId = await resolveCheckoutId(paymentId)
  }

  if (!checkoutId) {
    return NextResponse.json({ ok: true, skipped: 'no checkout' })
  }

  const result = await syncStoreCheckoutPayment(checkoutId, paymentId)
  if (!result.ok) {
    console.error('webhook sync:', result.error)
    return NextResponse.json({ ok: false, error: result.error }, { status: 500 })
  }

  return NextResponse.json({ ok: true, status: result.paymentStatus })
}

export async function GET(request: Request) {
  return POST(request)
}
