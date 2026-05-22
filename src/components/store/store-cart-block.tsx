'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Loader2,
  CheckCircle2,
  ShoppingCart,
} from 'lucide-react'
import { useStore } from '@/components/store/store-provider'
import { StoreImage } from '@/components/store/store-image'
import {
  formatPriceARS,
  getCartLineLabel,
  getCartLinePreviewImage,
  getCartTotal,
  getLineSubtotal,
  getProductLabel,
} from '@/lib/store/catalog'

const STATUS_ES: Record<string, string> = {
  awaiting_payment: 'Esperando pago',
  pending: 'Pendiente',
  in_review: 'En revisión',
  printing: 'En producción',
  ready: 'Listo',
  shipped: 'Enviado',
  cancelled: 'Cancelado',
}

function orderStatusClass(status: string): string {
  const base = 'order-status plot-status'
  if (status === 'ready' || status === 'shipped') return `${base} status-delivered`
  if (status === 'printing' || status === 'in_review') return `${base} status-in-transit`
  if (status === 'cancelled') return `${base} store-status-muted`
  if (status === 'pending') return `${base} store-status-hot`
  return base
}

export function StoreCartBlock() {
  const {
    message,
    cart,
    cartItemCount,
    removeCartLine,
    updateCartQty,
    clearCart,
    contactName,
    setContactName,
    contactEmail,
    setContactEmail,
    contactPhone,
    setContactPhone,
    submitting,
    mercadoPagoEnabled,
    pendingCheckoutId,
    handleCheckout,
    handleMercadoPagoPay,
    orders,
    loadingOrders,
  } = useStore()

  const cartUnits = cart.reduce((s, l) => s + l.quantity, 0)
  const cartTotal = getCartTotal(cart)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.location.hash === '#store-cart') {
      document.getElementById('store-cart')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [])

  return (
    <div className="space-y-10">
      <AnimatePresence mode="wait">
        {message && (
          <motion.div
            key={message.text}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className={`store-message flex items-start gap-3 ${message.type === 'ok' ? 'ok' : 'err'}`}
          >
            {message.type === 'ok' && <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />}
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      <section id="store-cart" className="cart-section">
        <div className="cart-container">
          <h2 className="cart-title">Carrito</h2>

          {pendingCheckoutId && cart.length > 0 ? (
            <p className="mb-4 rounded-xl border border-amber-300/80 bg-amber-50 px-4 py-3 text-sm text-amber-950">
              Tenés un pago reciente en Mercado Pago. Si no se completó, podés volver a pagar desde acá con el
              mismo carrito.
            </p>
          ) : null}

          {cart.length === 0 ? (
            <div className="cart-empty">
              <ShoppingCart className="mx-auto mb-3 h-10 w-10 opacity-30" aria-hidden />
              <p>Todavía no agregaste productos.</p>
              <p className="mt-2 text-sm text-[#666]">Los productos se guardan en este dispositivo mientras estés logueado.</p>
              <Link href="/store/combo" className="btn-primary hover-lift mt-6 inline-block">
                Ir al combo
              </Link>
            </div>
          ) : (
            <div className="cart-layout">
              <div className="cart-items">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <p className="font-bold">
                    {cartUnits} unidad{cartUnits === 1 ? '' : 'es'}
                  </p>
                  <button type="button" onClick={clearCart} className="remove-btn">
                    Vaciar
                  </button>
                </div>
                {cart.map((line) => (
                  <div key={line.id} className="cart-item">
                    {getCartLinePreviewImage(line) ? (
                      <StoreImage
                        src={getCartLinePreviewImage(line)!}
                        alt=""
                        width={96}
                        height={96}
                        className={`cart-item-image ${line.product_type === 'combo' ? 'object-top' : 'object-cover'}`}
                        sizes="(max-width: 768px) 80px, 120px"
                      />
                    ) : (
                      <div
                        className="cart-item-image flex items-center justify-center text-xs font-bold uppercase"
                        style={{ background: '#f0f0f0', color: '#999' }}
                      >
                        —
                      </div>
                    )}
                    <div className="cart-item-details">
                      <h3>{getCartLineLabel(line)}</h3>
                      <p className="cart-item-price">
                        {formatPriceARS(getLineSubtotal(line.product_type, line.quantity))}
                      </p>
                    </div>
                    <div className="cart-item-controls">
                      <div className="quantity-controls">
                        <button
                          type="button"
                          className="quantity-btn"
                          aria-label="Menos"
                          onClick={() => updateCartQty(line.id, -1)}
                        >
                          −
                        </button>
                        <span className="quantity-value">{line.quantity}</span>
                        <button
                          type="button"
                          className="quantity-btn"
                          aria-label="Más"
                          onClick={() => updateCartQty(line.id, 1)}
                        >
                          +
                        </button>
                      </div>
                      <button type="button" className="remove-btn" onClick={() => removeCartLine(line.id)}>
                        Quitar
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="cart-summary">
                <h3 className="summary-title">Pagar</h3>
                <div className="summary-total">
                  <span>Total</span>
                  <span>{formatPriceARS(cartTotal)}</span>
                </div>

                <form
                  onSubmit={mercadoPagoEnabled ? handleMercadoPagoPay : handleCheckout}
                  className="space-y-3 border-t-2 border-[#111] pt-4"
                >
                  <div>
                    <label htmlFor="cname" className="store-label">
                      Nombre
                    </label>
                    <input
                      id="cname"
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="store-field"
                    />
                  </div>
                  <div>
                    <label htmlFor="cemail" className="store-label">
                      Email
                    </label>
                    <input
                      id="cemail"
                      type="email"
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="store-field"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="store-label">
                      Teléfono (opcional)
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="store-field"
                      placeholder="+54 …"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submitting || cart.length === 0}
                    className={`btn-primary hover-lift checkout-btn w-full disabled:cursor-not-allowed disabled:opacity-50${mercadoPagoEnabled ? ' checkout-btn--mp' : ''}`}
                    style={{ border: 'none' }}
                  >
                    {submitting
                      ? 'Redirigiendo…'
                      : mercadoPagoEnabled
                        ? `Pagar ${formatPriceARS(cartTotal)}`
                        : `Confirmar pedido`}
                  </button>
                  {mercadoPagoEnabled ? (
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={handleCheckout}
                      className="btn-secondary hover-lift w-full text-center text-sm disabled:opacity-50"
                      style={{ border: 'none' }}
                    >
                      Coordinar pago después
                    </button>
                  ) : null}
                </form>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="store-page-section store-orders-compact">
        <div className="container">
          <h3 className="store-page-subtitle">Mis pedidos</h3>
          {loadingOrders ? (
            <p className="text-sm text-[#666]">
              <Loader2 className="mr-2 inline h-4 w-4 animate-spin" aria-hidden />
              Cargando…
            </p>
          ) : orders.length === 0 ? (
            <p className="text-sm text-[#666]">Todavía no tenés pedidos.</p>
          ) : (
            <ul className="orders-list">
              {orders.slice(0, 5).map((o) => (
                <li key={o.id} className="order-card plot-order">
                  <div className="order-header">
                    <div>
                      <h4>{getProductLabel(o.product_type)}</h4>
                      <p className="order-date">
                        {new Date(o.created_at).toLocaleString('es-AR', {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </p>
                    </div>
                    <span className={orderStatusClass(o.status)}>{STATUS_ES[o.status] ?? o.status}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {cartItemCount > 0 && (
        <a
          href="#store-cart"
          className="btn-secondary hover-lift fixed bottom-5 right-5 z-40 md:hidden"
          style={{ padding: '12px 16px', fontSize: '12px' }}
        >
          Carrito ({cartItemCount})
        </a>
      )}
    </div>
  )
}

