'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  createPrintOrdersFromCart,
  listMyPrintOrders,
  type PrintOrderRow,
} from '@/lib/actions'
import {
  createMercadoPagoCheckoutFromCart,
  isStoreMercadoPagoEnabled,
} from '@/lib/actions/store-payment'
import {
  DEFAULT_COMBO_POSTER_ID,
  DEFAULT_COMBO_STICKER_ID,
  buildComboOrderNotes,
  buildPosterOrderNotes,
  buildStickerOrderNotes,
  isComboPosterId,
  isComboStickerId,
  isSellableProductType,
  validateStoreCartLine,
  type ComboPosterId,
  type ComboStickerId,
} from '@/lib/store/catalog'
import type { StoreCartLine } from '@/lib/store/cart-lines'
import { readFiguritaStoreImageFromSession, clearFiguritaStoreImageFromSession } from '@/lib/storePrints'

const CART_STORAGE_KEY = 'plotmundial_store_cart_v4'

function parseStoredCartLine(row: unknown): StoreCartLine | null {
  if (!row || typeof row !== 'object') return null
  const r = row as Record<string, unknown>
  if (!r.id || typeof r.id !== 'string') return null
  if (!isSellableProductType(String(r.product_type ?? ''))) return null
  const qty = Math.min(99, Math.max(1, Math.floor(Number(r.quantity)) || 1))
  const notes = typeof r.notes === 'string' ? r.notes : ''

  if (r.product_type === 'combo') {
    if (!r.combo_sticker_id || !isComboStickerId(String(r.combo_sticker_id))) return null
    if (!r.combo_poster_id || !isComboPosterId(String(r.combo_poster_id))) return null
    const img = typeof r.customer_image_url === 'string' ? r.customer_image_url : ''
    const check = validateStoreCartLine({
      product_type: 'combo',
      quantity: qty,
      combo_sticker_id: String(r.combo_sticker_id),
      combo_poster_id: String(r.combo_poster_id),
      customer_image_url: img,
    })
    if (!check.ok) return null
    return {
      id: r.id,
      product_type: 'combo',
      quantity: qty,
      combo_sticker_id: r.combo_sticker_id as ComboStickerId,
      combo_poster_id: r.combo_poster_id as ComboPosterId,
      notes,
      customer_image_url: img,
    }
  }

  if (r.product_type === 'poster') {
    if (!r.variant_id || !isComboPosterId(String(r.variant_id))) return null
    return {
      id: r.id,
      product_type: 'poster',
      quantity: qty,
      variant_id: r.variant_id as ComboPosterId,
      notes: notes || buildPosterOrderNotes(r.variant_id as ComboPosterId),
      customer_image_url: null,
    }
  }

  if (r.product_type === 'sticker') {
    if (!r.variant_id || !isComboStickerId(String(r.variant_id))) return null
    return {
      id: r.id,
      product_type: 'sticker',
      quantity: qty,
      variant_id: r.variant_id as ComboStickerId,
      notes: notes || buildStickerOrderNotes(r.variant_id as ComboStickerId),
      customer_image_url: null,
    }
  }

  return null
}

export type StoreMessage = { type: 'ok' | 'err'; text: string } | null

type StoreContextValue = {
  userReady: boolean
  loggedIn: boolean
  cart: StoreCartLine[]
  cartItemCount: number
  message: StoreMessage
  setMessage: (m: StoreMessage) => void
  submitting: boolean
  mercadoPagoEnabled: boolean
  comboStickerId: ComboStickerId
  setComboStickerId: (id: ComboStickerId) => void
  comboPosterId: ComboPosterId
  setComboPosterId: (id: ComboPosterId) => void
  quantity: number
  setQuantity: (n: number) => void
  lineNotes: string
  setLineNotes: (s: string) => void
  contactName: string
  setContactName: (s: string) => void
  contactEmail: string
  setContactEmail: (s: string) => void
  contactPhone: string
  setContactPhone: (s: string) => void
  customerImageUrl: string | null
  setCustomerImageUrl: (url: string | null) => void
  canAddCombo: boolean
  addToCart: () => void
  addPosterToCart: (id: ComboPosterId) => void
  addStickerToCart: (id: ComboStickerId) => void
  removeCartLine: (id: string) => void
  updateCartQty: (id: string, delta: number) => void
  clearCart: () => void
  scrollToCart: () => void
  handleCheckout: (e: React.FormEvent) => void
  handleMercadoPagoPay: (e: React.FormEvent) => void
  orders: PrintOrderRow[]
  loadingOrders: boolean
}

const StoreContext = createContext<StoreContextValue | null>(null)

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore debe usarse dentro de StoreProvider')
  return ctx
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [userReady, setUserReady] = useState(false)
  const [loggedIn, setLoggedIn] = useState(false)
  const [orders, setOrders] = useState<PrintOrderRow[]>([])
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<StoreMessage>(null)

  const [comboStickerId, setComboStickerId] = useState<ComboStickerId>(DEFAULT_COMBO_STICKER_ID)
  const [comboPosterId, setComboPosterId] = useState<ComboPosterId>(DEFAULT_COMBO_POSTER_ID)
  const [quantity, setQuantity] = useState(1)
  const [lineNotes, setLineNotes] = useState('')
  const [contactName, setContactName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [customerImageUrl, setCustomerImageUrl] = useState<string | null>(null)
  const [cart, setCart] = useState<StoreCartLine[]>([])
  const [cartReady, setCartReady] = useState(false)
  const [mercadoPagoEnabled, setMercadoPagoEnabled] = useState(false)

  const canAddCombo = Boolean(customerImageUrl?.trim())
  const cartItemCount = cart.reduce((s, line) => s + line.quantity, 0)

  useEffect(() => {
    isStoreMercadoPagoEnabled().then(setMercadoPagoEnabled)
  }, [])

  useEffect(() => {
    const fromFigurita = readFiguritaStoreImageFromSession()
    if (fromFigurita) {
      setCustomerImageUrl(fromFigurita)
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

  const refreshOrders = useCallback(async () => {
    setLoadingOrders(true)
    const list = await listMyPrintOrders()
    setOrders(list)
    setLoadingOrders(false)
  }, [])

  useEffect(() => {
    if (!loggedIn) {
      setOrders([])
      setLoadingOrders(false)
      return
    }
    refreshOrders()
  }, [loggedIn, refreshOrders])

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
      const cleaned: StoreCartLine[] = []
      for (const row of parsed) {
        const line = parseStoredCartLine(row)
        if (line) cleaned.push(line)
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

  function clearCartStorage() {
    try {
      sessionStorage.removeItem(CART_STORAGE_KEY)
    } catch {
      /* ignore */
    }
  }

  function scrollToCart() {
    document.getElementById('store-cart')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function requireLoginForCart(): boolean {
    if (loggedIn) return true
    setMessage({ type: 'err', text: 'Iniciá sesión para agregar productos al carrito.' })
    scrollToCart()
    return false
  }

  function cartPayload() {
    return cart.map((c) => {
      if (c.product_type === 'combo') {
        return {
          product_type: 'combo' as const,
          quantity: c.quantity,
          combo_sticker_id: c.combo_sticker_id,
          combo_poster_id: c.combo_poster_id,
          notes: c.notes || undefined,
          customer_image_url: c.customer_image_url,
        }
      }
      if (c.product_type === 'poster') {
        return {
          product_type: 'poster' as const,
          quantity: c.quantity,
          variant_id: c.variant_id,
          notes: c.notes || undefined,
        }
      }
      return {
        product_type: 'sticker' as const,
        quantity: c.quantity,
        variant_id: c.variant_id,
        notes: c.notes || undefined,
      }
    })
  }

  const addToCart = useCallback(() => {
    if (!requireLoginForCart()) return
    if (!canAddCombo) {
      setMessage({
        type: 'err',
        text: 'El combo incluye tu figurita: creala en Mi Figurita y volvé al Store.',
      })
      return
    }
    const notes = buildComboOrderNotes(
      { stickerId: comboStickerId, posterId: comboPosterId },
      lineNotes,
    )
    setCart((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        product_type: 'combo',
        quantity,
        combo_sticker_id: comboStickerId,
        combo_poster_id: comboPosterId,
        notes,
        customer_image_url: customerImageUrl!,
      },
    ])
    setCustomerImageUrl(null)
    clearFiguritaStoreImageFromSession()
    setLineNotes('')
    setQuantity(1)
    setMessage({ type: 'ok', text: 'Combo agregado al carrito.' })
    scrollToCart()
  }, [
    canAddCombo,
    comboPosterId,
    comboStickerId,
    customerImageUrl,
    lineNotes,
    loggedIn,
    quantity,
  ])

  const addPosterToCart = useCallback(
    (posterId: ComboPosterId) => {
      if (!requireLoginForCart()) return
      setCart((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          product_type: 'poster',
          quantity: 1,
          variant_id: posterId,
          notes: buildPosterOrderNotes(posterId),
          customer_image_url: null,
        },
      ])
      setMessage({ type: 'ok', text: 'Poster agregado al carrito.' })
      scrollToCart()
    },
    [loggedIn],
  )

  const addStickerToCart = useCallback(
    (stickerId: ComboStickerId) => {
      if (!requireLoginForCart()) return
      setCart((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          product_type: 'sticker',
          quantity: 1,
          variant_id: stickerId,
          notes: buildStickerOrderNotes(stickerId),
          customer_image_url: null,
        },
      ])
      setMessage({ type: 'ok', text: 'Plancha de stickers agregada al carrito.' })
      scrollToCart()
    },
    [loggedIn],
  )

  const removeCartLine = useCallback((id: string) => {
    setCart((prev) => prev.filter((l) => l.id !== id))
  }, [])

  const updateCartQty = useCallback((id: string, delta: number) => {
    setCart((prev) =>
      prev.map((l) => {
        if (l.id !== id) return l
        const next = Math.min(99, Math.max(1, l.quantity + delta))
        return { ...l, quantity: next }
      }),
    )
  }, [])

  const clearCart = useCallback(() => {
    setCart([])
    clearCartStorage()
  }, [])

  const handleMercadoPagoPay = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setMessage(null)
      if (cart.length === 0) {
        setMessage({ type: 'err', text: 'Agregá al menos un producto al carrito.' })
        return
      }
      setSubmitting(true)
      const res = await createMercadoPagoCheckoutFromCart({
        lines: cartPayload(),
        contact_name: contactName,
        contact_email: contactEmail,
        contact_phone: contactPhone || undefined,
      })
      setSubmitting(false)
      if ('error' in res && res.error) {
        setMessage({ type: 'err', text: res.error })
        return
      }
      if ('initPoint' in res && res.initPoint) {
        setCart([])
        clearCartStorage()
        window.location.href = res.initPoint
      }
    },
    [cart, contactEmail, contactName, contactPhone],
  )

  const handleCheckout = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setMessage(null)
      if (cart.length === 0) {
        setMessage({ type: 'err', text: 'Agregá al menos un producto al carrito.' })
        return
      }
      setSubmitting(true)
      const res = await createPrintOrdersFromCart({
        lines: cartPayload(),
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
    },
    [cart, contactEmail, contactName, contactPhone, refreshOrders],
  )

  const value = useMemo<StoreContextValue>(
    () => ({
      userReady,
      loggedIn,
      cart,
      cartItemCount,
      message,
      setMessage,
      submitting,
      mercadoPagoEnabled,
      comboStickerId,
      setComboStickerId,
      comboPosterId,
      setComboPosterId,
      quantity,
      setQuantity,
      lineNotes,
      setLineNotes,
      contactName,
      setContactName,
      contactEmail,
      setContactEmail,
      contactPhone,
      setContactPhone,
      customerImageUrl,
      setCustomerImageUrl,
      canAddCombo,
      addToCart,
      addPosterToCart,
      addStickerToCart,
      removeCartLine,
      updateCartQty,
      clearCart,
      scrollToCart,
      handleCheckout,
      handleMercadoPagoPay,
      orders,
      loadingOrders,
    }),
    [
      userReady,
      loggedIn,
      cart,
      cartItemCount,
      message,
      submitting,
      mercadoPagoEnabled,
      comboStickerId,
      comboPosterId,
      quantity,
      lineNotes,
      contactName,
      contactEmail,
      contactPhone,
      customerImageUrl,
      canAddCombo,
      addToCart,
      addPosterToCart,
      addStickerToCart,
      removeCartLine,
      updateCartQty,
      clearCart,
      handleCheckout,
      handleMercadoPagoPay,
      orders,
      loadingOrders,
    ],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}
