import Link from 'next/link'
import { Clock } from 'lucide-react'
import { syncStoreCheckoutPayment } from '@/lib/mercadopago/sync-payment'
import { StorePagoCartHandler } from '@/components/store/store-pago-cart-handler'

type Props = {
  searchParams: Promise<{
    external_reference?: string
    payment_id?: string
    collection_id?: string
  }>
}

export default async function StorePagoPendientePage({ searchParams }: Props) {
  const params = await searchParams
  const checkoutId = params.external_reference
  const paymentId = params.payment_id ?? params.collection_id

  if (checkoutId && paymentId) {
    await syncStoreCheckoutPayment(checkoutId, paymentId)
  }

  return (
    <>
      <StorePagoCartHandler mode="pending" />
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <Clock className="mx-auto mb-4 h-14 w-14 text-amber-600" aria-hidden />
      <h1 className="mb-2 text-2xl font-bold">Pago pendiente</h1>
      <p className="mb-8 text-[#555]">
        Tu pago está en proceso. Cuando Mercado Pago lo confirme, actualizamos el pedido automáticamente.
        Tu carrito quedó guardado por si necesitás volver a intentar.
      </p>
      <Link href="/store#store-cart" className="btn-primary hover-lift inline-block">
        Volver al carrito
      </Link>
      </div>
    </>
  )
}
