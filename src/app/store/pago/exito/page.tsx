import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import { syncStoreCheckoutPayment } from '@/lib/mercadopago/sync-payment'
import { StorePagoCartHandler } from '@/components/store/store-pago-cart-handler'

type Props = {
  searchParams: Promise<{
    external_reference?: string
    payment_id?: string
    collection_id?: string
    status?: string
  }>
}

export default async function StorePagoExitoPage({ searchParams }: Props) {
  const params = await searchParams
  const checkoutId = params.external_reference
  const paymentId = params.payment_id ?? params.collection_id

  if (checkoutId && paymentId) {
    await syncStoreCheckoutPayment(checkoutId, paymentId)
  }

  return (
    <>
      <StorePagoCartHandler mode="success" />
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <CheckCircle2 className="mx-auto mb-4 h-14 w-14 text-emerald-600" aria-hidden />
      <h1 className="mb-2 text-2xl font-bold">¡Pago recibido!</h1>
      <p className="mb-8 text-[#555]">
        Registramos tu pago en Mercado Pago. Te vamos a escribir al mail del pedido cuando esté en producción.
      </p>
      <Link href="/store" className="btn-primary hover-lift inline-block">
        Volver al Store
      </Link>
      </div>
    </>
  )
}
