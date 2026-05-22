import Link from 'next/link'
import { XCircle } from 'lucide-react'
import { syncStoreCheckoutPayment } from '@/lib/mercadopago/sync-payment'
import { StorePagoCartHandler } from '@/components/store/store-pago-cart-handler'

type Props = {
  searchParams: Promise<{
    external_reference?: string
    payment_id?: string
    collection_id?: string
  }>
}

export default async function StorePagoErrorPage({ searchParams }: Props) {
  const params = await searchParams
  const checkoutId = params.external_reference
  const paymentId = params.payment_id ?? params.collection_id

  if (checkoutId && paymentId) {
    await syncStoreCheckoutPayment(checkoutId, paymentId)
  }

  return (
    <>
      <StorePagoCartHandler mode="error" />
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <XCircle className="mx-auto mb-4 h-14 w-14 text-red-600" aria-hidden />
      <h1 className="mb-2 text-2xl font-bold">No se completó el pago</h1>
      <p className="mb-8 text-[#555]">
        El pago fue rechazado o cancelado. Tu carrito se guardó: podés volver e intentar de nuevo.
      </p>
      <Link href="/store#store-cart" className="btn-primary hover-lift inline-block">
        Volver al carrito
      </Link>
      </div>
    </>
  )
}
