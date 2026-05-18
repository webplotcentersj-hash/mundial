import { Payment } from 'mercadopago'
import { createAdminClient } from '@/lib/supabase/admin'
import { getMercadoPagoClient } from '@/lib/mercadopago/config'

export type CheckoutPaymentStatus = 'pending' | 'in_process' | 'approved' | 'rejected' | 'cancelled'

function mapMpStatus(mpStatus: string | undefined): CheckoutPaymentStatus {
  if (mpStatus === 'approved') return 'approved'
  if (mpStatus === 'rejected') return 'rejected'
  if (mpStatus === 'cancelled') return 'cancelled'
  if (mpStatus === 'in_process' || mpStatus === 'authorized') return 'in_process'
  return 'pending'
}

function orderStatusForPayment(paymentStatus: CheckoutPaymentStatus): string {
  if (paymentStatus === 'approved') return 'pending'
  if (paymentStatus === 'rejected' || paymentStatus === 'cancelled') return 'cancelled'
  return 'awaiting_payment'
}

/** Sincroniza estado del checkout y pedidos según el pago en Mercado Pago. */
export async function syncStoreCheckoutPayment(
  checkoutId: string,
  paymentId: string | number,
): Promise<{ ok: true; paymentStatus: CheckoutPaymentStatus } | { ok: false; error: string }> {
  try {
    const client = getMercadoPagoClient()
    const paymentApi = new Payment(client)
    const payment = await paymentApi.get({ id: String(paymentId) })

    const body = payment
    const externalRef = body.external_reference
    if (!externalRef || externalRef !== checkoutId) {
      return { ok: false, error: 'external_reference no coincide con el checkout' }
    }

    const paymentStatus = mapMpStatus(body.status)
    const supabase = createAdminClient()

    const { error: checkoutErr } = await supabase
      .from('store_checkouts')
      .update({
        payment_status: paymentStatus,
        mp_payment_id: String(body.id ?? paymentId),
      })
      .eq('id', checkoutId)

    if (checkoutErr) {
      console.error('sync checkout update:', checkoutErr)
      return { ok: false, error: checkoutErr.message }
    }

    const nextOrderStatus = orderStatusForPayment(paymentStatus)
    const { error: ordersErr } = await supabase
      .from('print_orders')
      .update({ status: nextOrderStatus })
      .eq('checkout_id', checkoutId)

    if (ordersErr) {
      console.error('sync orders update:', ordersErr)
      return { ok: false, error: ordersErr.message }
    }

    return { ok: true, paymentStatus }
  } catch (e) {
    console.error('syncStoreCheckoutPayment:', e)
    return { ok: false, error: e instanceof Error ? e.message : 'Error al sincronizar pago' }
  }
}
