'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Store,
  Loader2,
  CheckCircle2,
  ArrowLeft,
  Sparkles,
  Layers,
  Maximize2,
  Package,
  Truck,
  Mail,
  User,
  Phone,
  MessageSquare,
  ShieldCheck,
  ShoppingCart,
  Trash2,
  Minus,
  Plus,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import {
  createPrintOrdersFromCart,
  listMyPrintOrders,
  type PrintOrderRow,
  type PrintProductType,
} from '@/lib/actions'
import { readFiguritaStoreImageFromSession, clearFiguritaStoreImageFromSession } from '@/lib/storePrints'
import { StorePageHero } from '@/components/store/store-page-hero'

const CART_STORAGE_KEY = 'plotmundial_store_cart_v1'

type CartLine = {
  id: string
  product_type: PrintProductType
  quantity: number
  notes: string
  customer_image_url: string | null
}

const PRODUCT_OPTIONS: {
  value: PrintProductType
  label: string
  hint: string
  icon: typeof Sparkles
  accent: string
}[] = [
  {
    value: 'figurita',
    label: 'Figurita',
    hint: 'Carta coleccionable · papel premium',
    icon: Sparkles,
    accent: 'from-emerald-400/30 via-cyan-500/20 to-teal-600/10',
  },
  {
    value: 'sticker',
    label: 'Stickers',
    hint: 'Hoja troquelada · vinilo o mate',
    icon: Layers,
    accent: 'from-fuchsia-500/30 via-violet-500/20 to-purple-900/10',
  },
  {
    value: 'poster',
    label: 'Poster',
    hint: 'Gran formato · para el living',
    icon: Maximize2,
    accent: 'from-amber-400/25 via-orange-500/20 to-rose-600/10',
  },
]

const STATUS_ES: Record<string, string> = {
  pending: 'Pendiente',
  in_review: 'En revisión',
  printing: 'En producción',
  ready: 'Listo',
  shipped: 'Enviado',
  cancelled: 'Cancelado',
}

function statusStyles(status: string): string {
  switch (status) {
    case 'pending':
      return 'border-amber-500/35 bg-amber-500/15 text-amber-200'
    case 'in_review':
      return 'border-sky-500/35 bg-sky-500/15 text-sky-200'
    case 'printing':
      return 'border-violet-500/40 bg-violet-500/15 text-violet-200'
    case 'ready':
      return 'border-emerald-500/40 bg-emerald-500/15 text-emerald-200'
    case 'shipped':
      return 'border-cyan-500/35 bg-cyan-500/15 text-cyan-200'
    case 'cancelled':
      return 'border-white/15 bg-white/5 text-white/50'
    default:
      return 'border-white/15 bg-white/5 text-white/60'
  }
}

function productTypeShort(t: PrintProductType) {
  if (t === 'figurita') return 'Figurita'
  if (t === 'sticker') return 'Stickers'
  if (t === 'poster') return 'Poster'
  return t
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
    <div className="relative min-h-screen w-full overflow-x-hidden bg-[#030712] font-outfit text-white">
      {/* Capas de ambiente */}
      <div className="pointer-events-none fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.18] mix-blend-overlay" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_90%_55%_at_50%_-8%,rgba(167,139,250,0.28),transparent_55%)]" />
      <div className="pointer-events-none fixed -right-32 top-24 h-[520px] w-[520px] rounded-full bg-fuchsia-600/[0.18] blur-[130px]" />
      <div className="pointer-events-none fixed -left-24 bottom-0 h-[420px] w-[480px] rounded-full bg-violet-600/[0.16] blur-[110px]" />
      <div className="pointer-events-none fixed left-1/2 top-1/3 h-[300px] w-[90%] max-w-3xl -translate-x-1/2 rounded-full bg-rose-500/[0.08] blur-[90px]" />
      {/* Grilla sutil */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }}
      />

      <div className="relative z-10 mx-auto max-w-6xl px-4 pb-24 pt-28 md:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <Link
            href="/figurita"
            className="group mb-10 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-white/65 backdrop-blur-md transition hover:border-violet-400/35 hover:bg-white/[0.08] hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-0.5" aria-hidden />
            Mi Figurita
          </Link>
        </motion.div>

        <StorePageHero cartItemCount={cart.reduce((s, line) => s + line.quantity, 0)} />

        {!userReady ? (
          <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-violet-400" aria-hidden />
            <p className="text-sm font-medium text-white/45">Cargando Store…</p>
          </div>
        ) : !loggedIn ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative mx-auto max-w-lg overflow-hidden rounded-[2rem] border border-white/12 bg-gradient-to-b from-white/[0.08] to-white/[0.02] p-10 text-center shadow-[0_0_0_1px_rgba(255,255,255,0.06)_inset,0_24px_80px_-20px_rgba(0,0,0,0.65)] backdrop-blur-xl"
          >
            <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-violet-500/25 blur-3xl" />
            <div className="absolute -bottom-12 -left-12 h-36 w-36 rounded-full bg-fuchsia-500/20 blur-3xl" />
            <div className="relative">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-violet-400/35 bg-violet-500/15 shadow-[0_0_40px_rgba(139,92,246,0.35)]">
                <Store className="h-8 w-8 text-violet-200" aria-hidden />
              </div>
              <h2 className="text-2xl font-black tracking-tight text-white">Entrá al Store</h2>
              <p className="mt-3 text-sm leading-relaxed text-white/55">
                Necesitamos tu cuenta para asociar el pedido y poder contactarte cuando esté listo.
              </p>
              <Link
                href="/login?next=/store"
                className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-violet-600 py-4 text-sm font-black uppercase tracking-widest text-white shadow-[0_0_40px_rgba(168,85,247,0.35)] transition hover:brightness-110 sm:w-auto sm:min-w-[240px] sm:px-10"
              >
                Iniciar sesión
              </Link>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-16">
            <AnimatePresence mode="wait">
              {message && (
                <motion.div
                  key={message.text}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className={`flex items-start gap-3 rounded-2xl border px-5 py-4 text-sm shadow-lg backdrop-blur-md ${
                    message.type === 'ok'
                      ? 'border-emerald-500/40 bg-emerald-500/[0.12] text-emerald-100'
                      : 'border-red-500/45 bg-red-500/[0.12] text-red-100'
                  }`}
                >
                  {message.type === 'ok' && <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" aria-hidden />}
                  {message.text}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid items-start gap-10 lg:grid-cols-12 lg:gap-12">
              {/* Columna lateral: arte + beneficios */}
              <div className="space-y-6 lg:col-span-5">
                {customerImageUrl && (
                  <motion.div
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="relative overflow-hidden rounded-3xl border border-emerald-400/25 bg-gradient-to-b from-emerald-500/15 to-emerald-950/20 p-6 shadow-[0_0_60px_-12px_rgba(16,185,129,0.35)]"
                  >
                    <div className="absolute right-4 top-4 rounded-full bg-emerald-500/90 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-950">
                      Alta calidad
                    </div>
                    <p className="mb-4 text-xs font-black uppercase tracking-[0.18em] text-emerald-200/90">
                      Desde Mi Figurita
                    </p>
                    <div className="relative mx-auto w-fit rotate-[-1.5deg]">
                      <div className="absolute -inset-3 rounded-2xl bg-gradient-to-br from-white/20 to-transparent opacity-50 blur-sm" />
                      <div className="relative overflow-hidden rounded-xl border-[6px] border-white/90 shadow-2xl ring-1 ring-black/40">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={customerImageUrl}
                          alt="Arte para imprimir"
                          className="mx-auto block h-56 w-40 object-cover object-top md:h-64 md:w-44"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setCustomerImageUrl(null)
                        clearFiguritaStoreImageFromSession()
                      }}
                      className="mt-6 w-full rounded-xl border border-white/15 bg-black/30 py-2.5 text-xs font-bold text-white/70 transition hover:border-red-400/30 hover:bg-red-500/10 hover:text-red-200"
                    >
                      Quitar imagen adjunta
                    </button>
                  </motion.div>
                )}

                <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-md">
                  <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-white/50">
                    <ShieldCheck className="h-4 w-4 text-violet-400" aria-hidden />
                    Por qué acá
                  </h3>
                  <ul className="mt-5 space-y-4 text-sm leading-snug text-white/65">
                    <li className="flex gap-3">
                      <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-violet-500/20 text-xs font-bold text-violet-300">
                        1
                      </span>
                      <span>
                        <strong className="text-white/90">Arte nítido</strong> — las figuritas desde el editor van en
                        PNG listo para imprenta.
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-fuchsia-500/20 text-xs font-bold text-fuchsia-300">
                        2
                      </span>
                      <span>
                        <strong className="text-white/90">Carrito</strong> — sumá varios productos y mandá todo junto
                        con un solo contacto.
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-cyan-500/20 text-xs font-bold text-cyan-300">
                        3
                      </span>
                      <span>
                        <strong className="text-white/90">Equipo Plot</strong> — producción y envío desde el panel;
                        el historial de cada ítem lo ves más abajo.
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Panel principal: armado + carrito + checkout */}
              <motion.div
                id="store-armado"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="relative scroll-mt-28 overflow-hidden rounded-[2rem] border border-white/12 bg-gradient-to-b from-white/[0.09] via-[#0c1222]/90 to-[#060913] p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset,0_32px_100px_-24px_rgba(0,0,0,0.75)] backdrop-blur-2xl md:p-9 lg:col-span-7"
              >
                <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-fuchsia-500/10 blur-3xl" />
                <div className="absolute -bottom-16 -left-10 h-48 w-48 rounded-full bg-violet-600/10 blur-3xl" />

                <div className="relative">
                  <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-6">
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.22em] text-violet-300/90">Store</p>
                      <h2 className="mt-1 text-2xl font-black tracking-tight text-white md:text-3xl">Carrito & pedido</h2>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/15 px-3 py-1.5 text-xs font-bold text-violet-200">
                        <ShoppingCart className="h-3.5 w-3.5" aria-hidden />
                        {cart.reduce((s, l) => s + l.quantity, 0)} ítems
                      </div>
                      <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-1.5 text-xs font-semibold text-white/50">
                        <Package className="h-3.5 w-3.5 text-violet-400" aria-hidden />
                        Sin pago online
                      </div>
                    </div>
                  </div>

                  <section className="mb-10">
                    <label className="mb-4 block text-[11px] font-black uppercase tracking-[0.2em] text-white/40">
                      Producto
                    </label>
                    <div className="grid gap-4 sm:grid-cols-3">
                      {PRODUCT_OPTIONS.map((opt) => {
                        const Icon = opt.icon
                        const selected = productType === opt.value
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setProductType(opt.value)}
                            className={`group relative overflow-hidden rounded-2xl border p-4 text-left transition-all duration-300 ${
                              selected
                                ? 'border-violet-400/55 bg-gradient-to-b from-violet-500/25 to-fuchsia-900/10 shadow-[0_0_32px_-4px_rgba(139,92,246,0.45)] ring-1 ring-violet-400/30'
                                : 'border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]'
                            }`}
                          >
                            <div
                              className={`mb-3 flex h-12 w-12 items-center justify-center rounded-xl border bg-gradient-to-br ${opt.accent} ${
                                selected ? 'border-violet-400/40' : 'border-white/10'
                              }`}
                            >
                              <Icon className={`h-6 w-6 ${selected ? 'text-white' : 'text-white/70'}`} aria-hidden />
                            </div>
                            <span className={`block text-sm font-black ${selected ? 'text-white' : 'text-white/85'}`}>
                              {opt.label}
                            </span>
                            <span className="mt-1 block text-[11px] leading-snug text-white/45">{opt.hint}</span>
                            {selected && (
                              <span className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-emerald-950 shadow-lg">
                                <CheckCircle2 className="h-4 w-4" aria-hidden />
                              </span>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </section>

                  <section className="mb-8 grid gap-6 sm:max-w-xs">
                    <div>
                      <label
                        htmlFor="qty"
                        className="mb-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-white/40"
                      >
                        <Package className="h-3.5 w-3.5" aria-hidden />
                        Cantidad (esta línea)
                      </label>
                      <input
                        id="qty"
                        type="number"
                        min={1}
                        max={99}
                        value={quantity}
                        onChange={(e) => setQuantity(Math.min(99, Math.max(1, Number(e.target.value) || 1)))}
                        className="w-full rounded-xl border border-white/12 bg-black/50 px-4 py-3.5 text-lg font-bold text-white shadow-inner outline-none ring-0 transition focus:border-violet-400/50 focus:ring-2 focus:ring-violet-500/30"
                      />
                    </div>
                  </section>

                  <section className="mb-8">
                    <label
                      htmlFor="line-notes"
                      className="mb-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-white/40"
                    >
                      <MessageSquare className="h-3.5 w-3.5" aria-hidden />
                      Notas para esta línea
                    </label>
                    <textarea
                      id="line-notes"
                      rows={3}
                      value={lineNotes}
                      onChange={(e) => setLineNotes(e.target.value)}
                      className="w-full resize-y rounded-xl border border-white/12 bg-black/50 px-4 py-3.5 text-sm leading-relaxed text-white outline-none transition focus:border-violet-400/50 focus:ring-2 focus:ring-violet-500/30"
                      placeholder="Tamaño, acabado, variante… (opcional)"
                    />
                  </section>

                  <button
                    type="button"
                    onClick={addToCart}
                    className="mb-10 flex w-full items-center justify-center gap-2 rounded-2xl border border-emerald-500/35 bg-gradient-to-r from-emerald-600/25 to-cyan-600/20 py-4 text-sm font-black uppercase tracking-widest text-emerald-100 shadow-[0_0_28px_-6px_rgba(16,185,129,0.35)] transition hover:border-emerald-400/50 hover:from-emerald-500/35 hover:to-cyan-500/25"
                  >
                    <Plus className="h-5 w-5" aria-hidden />
                    Agregar al carrito
                  </button>

                  <section id="store-cart" className="mb-10 scroll-mt-28">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.18em] text-white/50">
                        <ShoppingCart className="h-4 w-4 text-fuchsia-400" aria-hidden />
                        Tu carrito
                      </h3>
                      {cart.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            setCart([])
                            clearCartStorage()
                          }}
                          className="text-xs font-bold uppercase tracking-wider text-red-300/80 transition hover:text-red-200"
                        >
                          Vaciar
                        </button>
                      )}
                    </div>
                    {cart.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-white/12 bg-black/25 px-6 py-12 text-center">
                        <ShoppingCart className="mx-auto mb-3 h-10 w-10 text-white/15" aria-hidden />
                        <p className="text-sm font-semibold text-white/55">Todavía no agregaste productos.</p>
                        <p className="mt-1 text-xs text-white/40">Elegí arriba, tocá &quot;Agregar al carrito&quot; y repetí las veces que quieras.</p>
                      </div>
                    ) : (
                      <ul className="space-y-3">
                        {cart.map((line) => (
                          <li
                            key={line.id}
                            className="flex gap-3 rounded-2xl border border-white/10 bg-black/35 p-3 backdrop-blur-sm"
                          >
                            {line.customer_image_url ? (
                              <div className="relative h-16 w-11 shrink-0 overflow-hidden rounded-lg border border-white/15">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={line.customer_image_url}
                                  alt=""
                                  className="h-full w-full object-cover object-top"
                                />
                              </div>
                            ) : (
                              <div className="flex h-16 w-11 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-[9px] font-bold uppercase text-white/35">
                                —
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="font-black capitalize text-white">{productTypeShort(line.product_type)}</p>
                              {line.notes ? (
                                <p className="mt-0.5 line-clamp-2 text-xs text-white/45">{line.notes}</p>
                              ) : null}
                              <div className="mt-2 flex flex-wrap items-center gap-2">
                                <div className="flex items-center rounded-lg border border-white/15 bg-black/40 p-0.5">
                                  <button
                                    type="button"
                                    aria-label="Menos"
                                    onClick={() => updateCartQty(line.id, -1)}
                                    className="rounded-md p-1.5 text-white/70 transition hover:bg-white/10 hover:text-white"
                                  >
                                    <Minus className="h-4 w-4" />
                                  </button>
                                  <span className="min-w-[2rem] px-1 text-center font-mono text-sm font-bold">{line.quantity}</span>
                                  <button
                                    type="button"
                                    aria-label="Más"
                                    onClick={() => updateCartQty(line.id, 1)}
                                    className="rounded-md p-1.5 text-white/70 transition hover:bg-white/10 hover:text-white"
                                  >
                                    <Plus className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                            <button
                              type="button"
                              aria-label="Quitar"
                              onClick={() => removeCartLine(line.id)}
                              className="self-start rounded-lg border border-white/10 p-2 text-white/45 transition hover:border-red-400/40 hover:bg-red-500/15 hover:text-red-200"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>

                  <form onSubmit={handleCheckout} className="space-y-6 border-t border-white/10 pt-8">
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-violet-300/90">Checkout</p>
                    <div className="grid gap-6 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="cname"
                          className="mb-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-white/40"
                        >
                          <User className="h-3.5 w-3.5" aria-hidden />
                          Nombre
                        </label>
                        <input
                          id="cname"
                          required
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                          className="w-full rounded-xl border border-white/12 bg-black/50 px-4 py-3.5 text-white outline-none transition focus:border-violet-400/50 focus:ring-2 focus:ring-violet-500/30"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="cemail"
                          className="mb-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-white/40"
                        >
                          <Mail className="h-3.5 w-3.5" aria-hidden />
                          Email
                        </label>
                        <input
                          id="cemail"
                          type="email"
                          required
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          className="w-full rounded-xl border border-white/12 bg-black/50 px-4 py-3.5 text-white outline-none transition focus:border-violet-400/50 focus:ring-2 focus:ring-violet-500/30"
                        />
                      </div>
                    </div>
                    <div>
                      <label
                        htmlFor="phone"
                        className="mb-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-white/40"
                      >
                        <Phone className="h-3.5 w-3.5" aria-hidden />
                        Teléfono <span className="font-medium normal-case tracking-normal text-white/30">(opcional)</span>
                      </label>
                      <input
                        id="phone"
                        type="tel"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        className="w-full rounded-xl border border-white/12 bg-black/50 px-4 py-3.5 text-white outline-none transition focus:border-violet-400/50 focus:ring-2 focus:ring-violet-500/30 sm:max-w-md"
                        placeholder="+54 …"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting || cart.length === 0}
                      className="relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-violet-600 py-[1.15rem] text-sm font-black uppercase tracking-[0.15em] text-white shadow-[0_0_48px_-8px_rgba(168,85,247,0.55)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent opacity-0 transition hover:opacity-100" />
                      {submitting ? (
                        <Loader2 className="relative h-5 w-5 animate-spin" aria-hidden />
                      ) : (
                        <ShoppingCart className="relative h-5 w-5" aria-hidden />
                      )}
                      <span className="relative">
                        {submitting
                          ? 'Enviando…'
                          : cart.length === 0
                            ? 'Agregá productos al carrito'
                            : `Confirmar ${cart.length} pedido${cart.length === 1 ? '' : 's'}`}
                      </span>
                    </button>
                  </form>
                </div>
              </motion.div>
            </div>

            {/* Mis pedidos */}
            <section className="relative">
              <div className="mb-8 flex flex-col gap-2 border-b border-white/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.22em] text-white/40">Historial</p>
                  <h2 className="text-2xl font-black tracking-tight text-white md:text-3xl">Mis pedidos</h2>
                </div>
                <p className="text-sm text-white/45">Estados actualizados por el equipo.</p>
              </div>

              {loadingOrders ? (
                <div className="flex flex-col items-center justify-center gap-3 py-20">
                  <Loader2 className="h-10 w-10 animate-spin text-violet-400" aria-hidden />
                  <span className="text-sm text-white/45">Cargando pedidos…</span>
                </div>
              ) : orders.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-white/15 bg-white/[0.02] px-8 py-16 text-center">
                  <Truck className="mx-auto mb-4 h-12 w-12 text-white/20" aria-hidden />
                  <p className="text-lg font-bold text-white/70">Todavía no tenés pedidos</p>
                  <p className="mx-auto mt-2 max-w-md text-sm text-white/45">
                    Cuando envíes tu primera solicitud, va a aparecer acá con el estado en vivo.
                  </p>
                </div>
              ) : (
                <ul className="grid gap-5 sm:grid-cols-2">
                  {orders.map((o, i) => (
                    <motion.li
                      key={o.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(i * 0.05, 0.35) }}
                      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-transparent p-5 shadow-lg transition hover:border-violet-400/25 hover:shadow-[0_0_40px_-12px_rgba(139,92,246,0.25)]"
                    >
                      <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-violet-400 to-fuchsia-500 opacity-70" />
                      <div className="flex gap-4 pl-2">
                        {o.customer_image_url ? (
                          <div className="relative h-20 w-14 shrink-0 overflow-hidden rounded-lg border border-white/15 shadow-md">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={o.customer_image_url} alt="" className="h-full w-full object-cover object-top" />
                          </div>
                        ) : (
                          <div className="flex h-20 w-14 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-[10px] font-bold uppercase tracking-wider text-white/35">
                            Sin arte
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-base font-black capitalize text-white">{o.product_type}</span>
                            <span className="rounded-md bg-white/10 px-2 py-0.5 font-mono text-xs text-white/70">
                              ×{o.quantity}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-white/45">
                            {new Date(o.created_at).toLocaleString('es-AR', {
                              dateStyle: 'short',
                              timeStyle: 'short',
                            })}
                          </p>
                          <span
                            className={`mt-3 inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-wider ${statusStyles(o.status)}`}
                          >
                            {STATUS_ES[o.status] ?? o.status}
                          </span>
                          <p className="mt-3 truncate text-xs font-medium text-violet-300/90">{o.contact_email}</p>
                        </div>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              )}
            </section>

            {cart.length > 0 && (
              <a
                href="#store-cart"
                className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-2xl border border-violet-500/40 bg-[#0a0f1c]/95 px-4 py-3 text-xs font-black uppercase tracking-wider text-white shadow-[0_8px_32px_rgba(0,0,0,0.55)] backdrop-blur-xl transition hover:border-fuchsia-400/50 md:hidden"
              >
                <ShoppingCart className="h-4 w-4 shrink-0 text-fuchsia-400" aria-hidden />
                Carrito ({cart.reduce((s, l) => s + l.quantity, 0)})
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
