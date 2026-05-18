'use client'

import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Loader2,
  CheckCircle2,
  Layers,
  Maximize2,
  Truck,
  ShieldCheck,
  ShoppingCart,
  Plus,
} from 'lucide-react'
import { clearFiguritaStoreImageFromSession } from '@/lib/storePrints'
import type { PrintOrderRow } from '@/lib/actions'
import type { ComboPosterId, ComboStickerId } from '@/lib/store/catalog'
import {
  COMBO_POSTER_OPTIONS,
  COMBO_STICKER_OPTIONS,
  STORE_COMBO_PRICE_ARS,
  formatPriceARS,
  getCartTotal,
  getComboLineLabel,
  getLineSubtotal,
  getProductLabel,
} from '@/lib/store/catalog'

export type StoreCartLine = {
  id: string
  product_type: 'combo'
  quantity: number
  combo_sticker_id: ComboStickerId
  combo_poster_id: ComboPosterId
  notes: string
  customer_image_url: string | null
}

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

export type StoreCheckoutPanelProps = {
  message: { type: 'ok' | 'err'; text: string } | null
  customerImageUrl: string | null
  setCustomerImageUrl: (url: string | null) => void
  comboStickerId: ComboStickerId
  setComboStickerId: (id: ComboStickerId) => void
  comboPosterId: ComboPosterId
  setComboPosterId: (id: ComboPosterId) => void
  quantity: number
  setQuantity: (n: number) => void
  lineNotes: string
  setLineNotes: (s: string) => void
  canAddCombo: boolean
  cart: StoreCartLine[]
  addToCart: () => void
  removeCartLine: (id: string) => void
  updateCartQty: (id: string, delta: number) => void
  clearCart: () => void
  contactName: string
  setContactName: (s: string) => void
  contactEmail: string
  setContactEmail: (s: string) => void
  contactPhone: string
  setContactPhone: (s: string) => void
  submitting: boolean
  mercadoPagoEnabled: boolean
  onCheckout: (e: React.FormEvent) => void
  onMercadoPagoPay: (e: React.FormEvent) => void
  orders: PrintOrderRow[]
  loadingOrders: boolean
}

export function StoreCheckoutPanel({
  message,
  customerImageUrl,
  setCustomerImageUrl,
  comboStickerId,
  setComboStickerId,
  comboPosterId,
  setComboPosterId,
  quantity,
  setQuantity,
  lineNotes,
  setLineNotes,
  canAddCombo,
  cart,
  addToCart,
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
  onCheckout,
  onMercadoPagoPay,
  orders,
  loadingOrders,
}: StoreCheckoutPanelProps) {
  const cartUnits = cart.reduce((s, l) => s + l.quantity, 0)
  const cartTotal = getCartTotal(cart)
  const linePreviewTotal = getLineSubtotal('combo', quantity)

  return (
    <div className="space-y-12">
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

      <section id="store-armado" className="trending-section scroll-mt-28" style={{ borderTop: '2px solid #111' }}>
        <div className="container">
          <div className="trending-header">
            <h3>Armá tu pedido</h3>
            <Link href="#store-cart">Ir al carrito</Link>
          </div>

          <div className="grid items-start gap-8 lg:grid-cols-12 lg:gap-10">
            <aside className="space-y-6 lg:col-span-4">
              {customerImageUrl && (
                <motion.div
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="store-figurita-card"
                >
                  <span
                    className="product-badge new"
                    style={{ position: 'static', display: 'inline-block', marginBottom: 12 }}
                  >
                    Desde Mi Figurita
                  </span>
                  <div className="mx-auto w-fit rotate-[-1.5deg]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={customerImageUrl}
                      alt="Arte para imprimir"
                      className="mx-auto block h-56 w-40 object-cover object-top md:h-64 md:w-44"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setCustomerImageUrl(null)
                      clearFiguritaStoreImageFromSession()
                    }}
                    className="remove-btn mt-4 w-full text-left"
                  >
                    Quitar imagen adjunta
                  </button>
                </motion.div>
              )}

              <div className="store-benefits-card">
                <h3 className="section-title" style={{ fontSize: '1.25rem', marginBottom: 16 }}>
                  <ShieldCheck className="mr-2 inline h-5 w-5" aria-hidden />
                  Por qué acá
                </h3>
                <ul className="space-y-4 text-sm leading-snug" style={{ color: '#444' }}>
                  <li>
                    <strong>Arte nítido</strong> — figuritas desde el editor en PNG listo para imprenta.
                  </li>
                  <li>
                    <strong>Combo único</strong> — figurita + plancha de stickers + poster en un solo pedido.
                  </li>
                  <li>
                    <strong>Equipo Plot</strong> — estados actualizados; el historial está más abajo.
                  </li>
                </ul>
              </div>
            </aside>

            <div className="lg:col-span-8">
              <div className="product-detail-info" style={{ paddingTop: 0 }}>
                <span className="product-badge new">Paso 1</span>
                <h2 className="product-detail-title" style={{ fontSize: '2rem' }}>
                  Armá tu combo
                </h2>
                <p className="product-detail-description">
                  Incluye tu figurita (desde Mi Figurita), una plancha de stickers en vinilo y un poster a elección.
                </p>

                {!customerImageUrl ? (
                  <p
                    className="store-message err mt-4"
                    style={{ display: 'block', padding: '12px 14px', fontSize: '14px' }}
                  >
                    Primero creá tu figurita en{' '}
                    <Link href="/figurita" className="font-bold underline">
                      Mi Figurita
                    </Link>{' '}
                    para poder agregar el combo al carrito.
                  </p>
                ) : null}

                <div className="size-selection" style={{ marginTop: 24 }}>
                  <span className="size-label">Plancha de stickers</span>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {COMBO_STICKER_OPTIONS.map((opt) => {
                      const selected = comboStickerId === opt.id
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setComboStickerId(opt.id)}
                          className={`product-type-btn ${selected ? 'selected' : ''}`}
                        >
                          <Layers className="mb-2 h-6 w-6" aria-hidden />
                          <h4>{opt.label}</h4>
                          <p>{opt.hint}</p>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="size-selection" style={{ marginTop: 20 }}>
                  <span className="size-label">Poster</span>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {COMBO_POSTER_OPTIONS.map((opt) => {
                      const selected = comboPosterId === opt.id
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setComboPosterId(opt.id)}
                          className={`product-type-btn ${selected ? 'selected' : ''}`}
                        >
                          <Maximize2 className="mb-2 h-6 w-6" aria-hidden />
                          <h4>{opt.label}</h4>
                          <p>{opt.hint}</p>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="summary-line" style={{ marginTop: 16 }}>
                  <span>Combo (figurita + stickers + poster)</span>
                  <span>
                    {formatPriceARS(STORE_COMBO_PRICE_ARS)} × {quantity} = {formatPriceARS(linePreviewTotal)}
                  </span>
                </div>

                <div className="quantity-selection">
                  <label htmlFor="qty" className="quantity-label">
                    Cantidad (esta línea)
                  </label>
                  <div className="quantity-controls">
                    <button
                      type="button"
                      className="quantity-btn"
                      aria-label="Menos cantidad"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      −
                    </button>
                    <span className="quantity-value">{quantity}</span>
                    <button
                      type="button"
                      className="quantity-btn"
                      aria-label="Más cantidad"
                      onClick={() => setQuantity(Math.min(99, quantity + 1))}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="quantity-selection">
                  <label htmlFor="line-notes" className="quantity-label">
                    Notas para esta línea (opcional)
                  </label>
                  <textarea
                    id="line-notes"
                    rows={3}
                    value={lineNotes}
                    onChange={(e) => setLineNotes(e.target.value)}
                    className="store-textarea"
                    placeholder="Tamaño, acabado, variante…"
                  />
                </div>

                <button
                  type="button"
                  onClick={addToCart}
                  disabled={!canAddCombo}
                  className="btn-primary hover-lift disabled:cursor-not-allowed disabled:opacity-50"
                  style={{ display: 'block', width: '100%', textAlign: 'center', border: 'none', cursor: canAddCombo ? 'pointer' : 'not-allowed' }}
                >
                  <Plus className="mr-2 inline h-5 w-5" aria-hidden />
                  {canAddCombo ? 'Agregar combo al carrito' : 'Falta tu figurita (Mi Figurita)'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="store-cart" className="cart-section scroll-mt-28">
        <div className="cart-container">
          <h1 className="cart-title">Tu carrito</h1>

          {cart.length === 0 ? (
            <div className="cart-empty">
              <ShoppingCart className="mx-auto mb-3 h-10 w-10 opacity-30" aria-hidden />
              <p>Todavía no agregaste productos.</p>
              <Link href="#store-armado" className="btn-primary hover-lift mt-6 inline-block">
                Volver a productos
              </Link>
            </div>
          ) : (
            <div className="cart-layout">
              <div className="cart-items">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <p className="font-bold">
                    {cartUnits} unidad{cartUnits === 1 ? '' : 'es'} · {cart.length} línea
                    {cart.length === 1 ? '' : 's'}
                  </p>
                  <button type="button" onClick={clearCart} className="remove-btn">
                    Vaciar carrito
                  </button>
                </div>
                {cart.map((line) => (
                  <div key={line.id} className="cart-item">
                    {line.customer_image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={line.customer_image_url} alt="" className="cart-item-image object-top" />
                    ) : (
                      <div
                        className="cart-item-image flex items-center justify-center text-xs font-bold uppercase"
                        style={{ background: '#f0f0f0', color: '#999' }}
                      >
                        Sin img
                      </div>
                    )}
                    <div className="cart-item-details">
                      <h3>
                        {getComboLineLabel({
                          stickerId: line.combo_sticker_id,
                          posterId: line.combo_poster_id,
                        })}
                      </h3>
                      {line.notes ? (
                        <p className="mt-1 whitespace-pre-line text-sm">{line.notes}</p>
                      ) : null}
                      <p className="cart-item-price">
                        {formatPriceARS(getLineSubtotal('combo', line.quantity))}
                        <span className="text-sm font-normal text-[#666]">
                          {' '}
                          ({line.quantity} × {formatPriceARS(STORE_COMBO_PRICE_ARS)})
                        </span>
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
                <h2 className="summary-title">Resumen</h2>
                <div className="summary-line">
                  <span>Líneas</span>
                  <span>{cart.length}</span>
                </div>
                <div className="summary-line">
                  <span>Unidades</span>
                  <span>{cartUnits}</span>
                </div>
                <div className="summary-line">
                  <span>Pago</span>
                  <span>{mercadoPagoEnabled ? 'Mercado Pago' : 'A coordinar'}</span>
                </div>
                <p className="shipping-note">Te contactamos por mail cuando el pedido esté en producción o listo.</p>
                <div className="summary-total">
                  <span>Total</span>
                  <span>{formatPriceARS(cartTotal)}</span>
                </div>
                <p className="shipping-note text-sm" style={{ marginTop: 8 }}>
                  {mercadoPagoEnabled
                    ? 'Pagá con Mercado Pago (tarjeta, dinero en cuenta o cuotas según tu medio).'
                    : 'Precios en pesos argentinos. El pago se coordina por mail o al retirar.'}
                </p>

                <form
                  onSubmit={mercadoPagoEnabled ? onMercadoPagoPay : onCheckout}
                  className="space-y-4 border-t-2 border-[#111] pt-6"
                >
                  <p className="size-label">Datos de contacto</p>
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
                    className="btn-primary hover-lift checkout-btn flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
                    style={{ border: 'none', cursor: submitting ? 'wait' : 'pointer' }}
                  >
                    {submitting ? (
                      <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                    ) : mercadoPagoEnabled ? (
                      <span className="text-lg font-bold" aria-hidden>
                        MP
                      </span>
                    ) : (
                      <ShoppingCart className="h-5 w-5" aria-hidden />
                    )}
                    {submitting
                      ? 'Redirigiendo…'
                      : cart.length === 0
                        ? 'Agregá productos'
                        : mercadoPagoEnabled
                          ? `Pagar ${formatPriceARS(cartTotal)}`
                          : `Confirmar ${cart.length} pedido${cart.length === 1 ? '' : 's'}`}
                  </button>
                  {mercadoPagoEnabled ? (
                    <button
                      type="button"
                      disabled={submitting || cart.length === 0}
                      onClick={onCheckout}
                      className="btn-secondary hover-lift w-full text-center text-sm disabled:opacity-50"
                      style={{ border: 'none', cursor: submitting ? 'wait' : 'pointer' }}
                    >
                      Pedir sin pago online (coordinar después)
                    </button>
                  ) : null}
                </form>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="trending-section" style={{ borderTop: '2px solid #111' }}>
        <div className="container">
          <div className="trending-header">
            <h3>Mis pedidos</h3>
            <span className="text-sm font-semibold" style={{ color: '#666' }}>
              Estados del equipo Plot
            </span>
          </div>

          {loadingOrders ? (
            <div className="cart-empty">
              <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin" aria-hidden />
              <p>Cargando pedidos…</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="cart-empty">
              <Truck className="mx-auto mb-4 h-12 w-12 opacity-25" aria-hidden />
              <p className="font-bold">Todavía no tenés pedidos</p>
              <p className="mt-2 text-sm" style={{ color: '#666' }}>
                Cuando envíes tu primera solicitud, aparece acá con el estado en vivo.
              </p>
            </div>
          ) : (
            <ul className="orders-list">
              {orders.map((o, i) => (
                <motion.li
                  key={o.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.05, 0.35) }}
                  className="order-card plot-order"
                >
                  <div className="order-header">
                    <div>
                      <h3>{getProductLabel(o.product_type)}</h3>
                      <p className="order-date">
                        {new Date(o.created_at).toLocaleString('es-AR', {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </p>
                    </div>
                    <span className={orderStatusClass(o.status)}>{STATUS_ES[o.status] ?? o.status}</span>
                  </div>
                  <div className="order-details flex flex-wrap gap-4">
                    <span>×{o.quantity}</span>
                    <span className="truncate">{o.contact_email}</span>
                  </div>
                  {o.customer_image_url && (
                    <div className="mt-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={o.customer_image_url}
                        alt=""
                        className="h-24 w-16 border-2 border-[#111] object-cover object-top"
                      />
                    </div>
                  )}
                </motion.li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {cart.length > 0 && (
        <a
          href="#store-cart"
          className="btn-secondary hover-lift fixed bottom-5 right-5 z-40 md:hidden"
          style={{ padding: '12px 16px', fontSize: '12px' }}
        >
          Carrito ({cartUnits})
        </a>
      )}
    </div>
  )
}
