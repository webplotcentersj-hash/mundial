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
  type ComboPosterId,
  type ComboStickerId,
} from '@/lib/store/catalog'
import type { StoreCartLine } from '@/lib/store/cart-lines'
import {
  STORE_CART_SYNC_EVENT,
  clearStoredCart,
  loadPendingCheckout,
  loadStoredCartLines,
  loadStoredContact,
  saveCartBackup,
  savePendingCheckout,
  saveStoredCartLines,
  saveStoredContact,
} from '@/lib/store/cart-storage'
import { readFiguritaStoreImageFromSession, clearFiguritaStoreImageFromSession } from '@/lib/storePrints'

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
  pendingCheckoutId: string | null
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
  const [pendingCheckoutId, setPendingCheckoutId] = useState<string | null>(null)

  const canAddCombo = Boolean(customerImageUrl?.trim())
  const cartItemCount = cart.reduce((s, line) => s + line.quantity, 0)

  const reloadCartFromStorage = useCallback(() => {
    setCart(loadStoredCartLines())
    setPendingCheckoutId(loadPendingCheckout()?.checkoutId ?? null)
  }, [])

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
      setPendingCheckoutId(null)
      return
    }
    reloadCartFromStorage()
    setCartReady(true)
  }, [loggedIn, reloadCartFromStorage])

  useEffect(() => {
    if (!loggedIn || !cartReady) return
    const stored = loadStoredContact()
    setContactName((prev) => (prev.trim() ? prev : stored.contactName))
    setContactEmail((prev) => (prev.trim() ? prev : stored.contactEmail))
    setContactPhone((prev) => (prev.trim() ? prev : stored.contactPhone))
  }, [loggedIn, cartReady])

  useEffect(() => {
    if (!loggedIn || !cartReady || typeof window === 'undefined') return
    saveStoredCartLines(cart)
  }, [cart, loggedIn, cartReady])

  useEffect(() => {
    if (!loggedIn || typeof window === 'undefined') return
    saveStoredContact({ contactName, contactEmail, contactPhone })
  }, [contactName, contactEmail, contactPhone, loggedIn])

  useEffect(() => {
    const onSync = () => reloadCartFromStorage()
    window.addEventListener(STORE_CART_SYNC_EVENT, onSync)
    return () => window.removeEventListener(STORE_CART_SYNC_EVENT, onSync)
  }, [reloadCartFromStorage])

  useEffect(() => {
    const onPageShow = (e: PageTransitionEvent) => {
      if (!loggedIn) return
      if (e.persisted) reloadCartFromStorage()
    }
    window.addEventListener('pageshow', onPageShow)
    return () => window.removeEventListener('pageshow', onPageShow)
  }, [loggedIn, reloadCartFromStorage])

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
    clearStoredCart()
    setPendingCheckoutId(null)
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
      saveCartBackup(cart)
      saveStoredContact({ contactName, contactEmail, contactPhone })
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
        savePendingCheckout({
          checkoutId: res.checkoutId,
          savedAt: new Date().toISOString(),
        })
        setPendingCheckoutId(res.checkoutId)
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
      clearStoredCart()
      setPendingCheckoutId(null)
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
      pendingCheckoutId,
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
      pendingCheckoutId,
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
