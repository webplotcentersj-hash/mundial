'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Store, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import {
  createPrintOrdersFromCart,
  listMyPrintOrders,
  type PrintOrderRow,
  type PrintProductType,
} from '@/lib/actions'
import { readFiguritaStoreImageFromSession, clearFiguritaStoreImageFromSession } from '@/lib/storePrints'
import { StoreLanding } from '@/components/store/store-landing'
import { StoreCheckoutPanel } from '@/components/store/store-checkout-panel'

const CART_STORAGE_KEY = 'plotmundial_store_cart_v1'

type CartLine = {
  id: string
  product_type: PrintProductType
  quantity: number
  notes: string
  customer_image_url: string | null
}

export default function StorePage() {
  const [userReady, setUserReady] = useState(false)
  const [loggedIn, setLoggedIn] = useState(false)
  const [orders, setOrders] = useState<PrintOrderRow[]>([])
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  const [productType, setProductType] = useState<PrintProductType>('figurita')
  const [quantity, setQuantity] = useState(1)
  const [lineNotes, setLineNotes] = useState('')
  const [contactName, setContactName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [customerImageUrl, setCustomerImageUrl] = useState<string | null>(null)
  const [cart, setCart] = useState<CartLine[]>([])
  const [cartReady, setCartReady] = useState(false)

  useEffect(() => {
    const fromFigurita = readFiguritaStoreImageFromSession()
    if (fromFigurita) {
      setCustomerImageUrl(fromFigurita)
      setProductType('figurita')
      setLineNotes((prev) =>
        prev.trim()
          ? prev
          : 'Pedido desde Mi Figurita · PNG en alta resolución listo para impresión.',
      )
    }
  }, [])

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      setLoggedIn(!!user)
      if (user?.email) setContactEmail((prev) => (prev.trim() ? prev : user.email ?? ''))
      setUserReady(true)
    })
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user
      setLoggedIn(!!u)
      if (u?.email) setContactEmail((prev) => (prev.trim() ? prev : u.email ?? ''))
    })
    return () => subscription.unsubscribe()
  }, [])

  async function refreshOrders() {
    setLoadingOrders(true)
    const list = await listMyPrintOrders()
    setOrders(list)
    setLoadingOrders(false)
  }

  useEffect(() => {
    if (!loggedIn) {
      setOrders([])
      setLoadingOrders(false)
      return
    }
    refreshOrders()
  }, [loggedIn])

  useEffect(() => {
    if (!loggedIn) {
      setCartReady(false)
      setCart([])
      return
    }
    if (typeof window === 'undefined') return
    try {
      const raw = sessionStorage.getItem(CART_STORAGE_KEY)
      if (!raw) {
        setCart([])
        setCartReady(true)
        return
      }
      const parsed = JSON.parse(raw) as unknown
      if (!Array.isArray(parsed)) {
        setCart([])
        setCartReady(true)
        return
      }
      const cleaned: CartLine[] = []
      for (const row of parsed) {
        if (!row || typeof row !== 'object') continue
        const r = row as Partial<CartLine>
        if (!r.id || !r.product_type) continue
        if (!['figurita', 'sticker', 'poster'].includes(r.product_type)) continue
        cleaned.push({
          id: String(r.id),
          product_type: r.product_type as PrintProductType,
          quantity: Math.min(99, Math.max(1, Math.floor(Number(r.quantity)) || 1)),
          notes: typeof r.notes === 'string' ? r.notes : '',
          customer_image_url: typeof r.customer_image_url === 'string' ? r.customer_image_url : null,
        })
      }
      setCart(cleaned)
    } catch {
      setCart([])
    } finally {
      setCartReady(true)
    }
  }, [loggedIn])

  useEffect(() => {
    if (!loggedIn || !cartReady || typeof window === 'undefined') return
    try {
      sessionStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart))
    } catch {
      /* ignore */
    }
  }, [cart, loggedIn, cartReady])

  function addToCart() {
    const img = productType === 'figurita' && customerImageUrl ? customerImageUrl : null
    const noteCombined = lineNotes.trim()
    setCart((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        product_type: productType,
        quantity,
        notes: noteCombined,
        customer_image_url: img,
      },
    ])
    if (img) {
      setCustomerImageUrl(null)
      clearFiguritaStoreImageFromSession()
    }
    setLineNotes('')
    setQuantity(1)
  }

  function removeCartLine(id: string) {
    setCart((prev) => prev.filter((l) => l.id !== id))
  }

  function updateCartQty(id: string, delta: number) {
    setCart((prev) =>
      prev.map((l) => {
        if (l.id !== id) return l
        const next = Math.min(99, Math.max(1, l.quantity + delta))
        return { ...l, quantity: next }
      }),
    )
  }

  function clearCartStorage() {
    try {
      sessionStorage.removeItem(CART_STORAGE_KEY)
    } catch {
      /* ignore */
    }
  }

  function clearCart() {
    setCart([])
    clearCartStorage()
  }

  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault()
    setMessage(null)
    if (cart.length === 0) {
      setMessage({ type: 'err', text: 'Agregá al menos un producto al carrito.' })
      return
    }
    setSubmitting(true)
    const res = await createPrintOrdersFromCart({
      lines: cart.map((c) => ({
        product_type: c.product_type,
        quantity: c.quantity,
        notes: c.notes || undefined,
        customer_image_url: c.customer_image_url,
      })),
      contact_name: contactName,
      contact_email: contactEmail,
      contact_phone: contactPhone || undefined,
    })
    setSubmitting(false)
    if ('error' in res && res.error) {
      setMessage({ type: 'err', text: res.error })
      return
    }
    const n = 'count' in res ? res.count : cart.length
    setMessage({
      type: 'ok',
      text: `Listo: se registraron ${n} pedido${n === 1 ? '' : 's'}. Te escribimos al mail que dejaste.`,
    })
    setCart([])
    clearCartStorage()
    await refreshOrders()
  }

  return (
    <>
      <StoreLanding
        cartItemCount={cart.reduce((s, line) => s + line.quantity, 0)}
        selectedProduct={productType}
        onSelectProduct={setProductType}
      />

      <div className="store-panel">
        {!userReady ? (
          <div className="cart-empty">
            <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin" aria-hidden />
            <p>Cargando Store…</p>
          </div>
        ) : !loggedIn ? (
          <div className="store-login-box">
            <Store className="mx-auto mb-4 h-10 w-10" aria-hidden />
            <h2 className="cart-title" style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>
              Entrá al Store
            </h2>
            <p style={{ marginBottom: '1.5rem', color: '#444' }}>
              Necesitamos tu cuenta para asociar el pedido y poder contactarte cuando esté listo.
            </p>
            <Link href="/login?next=/store" className="btn-primary hover-lift">
              INICIAR SESIÓN
            </Link>
          </div>
        ) : (
          <StoreCheckoutPanel
            message={message}
            customerImageUrl={customerImageUrl}
            setCustomerImageUrl={setCustomerImageUrl}
            productType={productType}
            setProductType={setProductType}
            quantity={quantity}
            setQuantity={setQuantity}
            lineNotes={lineNotes}
            setLineNotes={setLineNotes}
            cart={cart}
            addToCart={addToCart}
            removeCartLine={removeCartLine}
            updateCartQty={updateCartQty}
            clearCart={clearCart}
            contactName={contactName}
            setContactName={setContactName}
            contactEmail={contactEmail}
            setContactEmail={setContactEmail}
            contactPhone={contactPhone}
            setContactPhone={setContactPhone}
            submitting={submitting}
            onCheckout={handleCheckout}
            orders={orders}
            loadingOrders={loadingOrders}
          />
        )}
      </div>

      <footer className="footer">
        <div className="footer-content">
          <Link href="/" className="footer-logo">
            PLOT MUNDIAL
          </Link>
          <div className="footer-copyright">© {new Date().getFullYear()} Plot Mundial · Store de impresión</div>
          <div className="footer-links">
            <Link href="/figurita">Mi Figurita</Link>
            <Link href="/pedidos">Mis pedidos</Link>
            <Link href="/terminos">Términos</Link>
          </div>
        </div>
      </footer>
    </>
  )
}