'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Store, Loader2, CheckCircle2, ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import {
  createPrintOrder,
  listMyPrintOrders,
  type PrintOrderRow,
  type PrintProductType,
} from '@/lib/actions'
import { readFiguritaStoreImageFromSession, clearFiguritaStoreImageFromSession } from '@/lib/storePrints'

const PRODUCT_OPTIONS: { value: PrintProductType; label: string; hint: string }[] = [
  { value: 'figurita', label: 'Figurita', hint: 'Carta estilo álbum' },
  { value: 'sticker', label: 'Stickers', hint: 'Hoja o troquel' },
  { value: 'poster', label: 'Poster', hint: 'Gran formato' },
]

const STATUS_ES: Record<string, string> = {
  pending: 'Pendiente',
  in_review: 'En revisión',
  printing: 'En producción',
  ready: 'Listo',
  shipped: 'Enviado',
  cancelled: 'Cancelado',
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
  const [notes, setNotes] = useState('')
  const [contactName, setContactName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [customerImageUrl, setCustomerImageUrl] = useState<string | null>(null)

  useEffect(() => {
    const fromFigurita = readFiguritaStoreImageFromSession()
    if (fromFigurita) {
      setCustomerImageUrl(fromFigurita)
      setProductType('figurita')
      setNotes((prev) =>
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMessage(null)
    setSubmitting(true)
    const res = await createPrintOrder({
      product_type: productType,
      quantity,
      notes,
      contact_name: contactName,
      contact_email: contactEmail,
      contact_phone: contactPhone || undefined,
      customer_image_url: customerImageUrl,
    })
    setSubmitting(false)
    if ('error' in res && res.error) {
      setMessage({ type: 'err', text: res.error })
      return
    }
    setMessage({ type: 'ok', text: 'Pedido registrado en el Store. Te contactamos por el email indicado.' })
    setNotes('')
    setCustomerImageUrl(null)
    clearFiguritaStoreImageFromSession()
    await refreshOrders()
  }

  return (
    <div className="relative min-h-screen w-full bg-[#060913] px-4 pb-16 pt-24 font-outfit text-white">
      <div className="pointer-events-none fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
      <div className="pointer-events-none fixed left-0 top-0 -z-10 h-[420px] w-full rounded-b-[100%] bg-violet-900/15 blur-[100px]" />

      <div className="relative z-10 mx-auto max-w-2xl">
        <Link
          href="/figurita"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-white/60 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Volver a Mi Figurita
        </Link>

        <div className="mb-8 flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-violet-500/35 bg-violet-500/10 shadow-[0_0_24px_rgba(139,92,246,0.25)]">
            <Store className="h-7 w-7 text-violet-300" aria-hidden />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl">Store</h1>
            <p className="mt-1 text-sm leading-relaxed text-white/55">
              Pedí figuritas, stickers o posters. Si venís desde Mi Figurita, la imagen en alta calidad se adjunta al
              pedido para el taller.
            </p>
          </div>
        </div>

        {!userReady ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-10 w-10 animate-spin text-violet-400" aria-hidden />
          </div>
        ) : !loggedIn ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 text-center backdrop-blur-xl">
            <p className="text-white/70">Iniciá sesión para cargar un pedido en el Store.</p>
            <Link
              href="/login?next=/store"
              className="mt-6 inline-flex rounded-xl bg-violet-600 px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-violet-500"
            >
              Iniciar sesión
            </Link>
          </div>
        ) : (
          <>
            {message && (
              <div
                className={`mb-6 flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${
                  message.type === 'ok'
                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-100'
                    : 'border-red-500/40 bg-red-500/10 text-red-100'
                }`}
              >
                {message.type === 'ok' && <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />}
                {message.text}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="mb-12 space-y-5 rounded-2xl border border-white/10 bg-[#0a0f1c]/80 p-6 shadow-xl backdrop-blur-xl md:p-8"
            >
              <h2 className="text-lg font-bold text-white">Nuevo pedido</h2>

              {customerImageUrl && (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                  <p className="mb-2 text-xs font-bold uppercase tracking-widest text-emerald-200/90">
                    Arte para imprimir (Mi Figurita)
                  </p>
                  <div className="relative mx-auto h-48 w-32 overflow-hidden rounded-lg border border-white/20 shadow-lg">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={customerImageUrl} alt="Vista previa figurita" className="h-full w-full object-cover object-top" />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setCustomerImageUrl(null)
                      clearFiguritaStoreImageFromSession()
                    }}
                    className="mt-3 text-xs font-semibold text-white/60 underline decoration-white/30 underline-offset-2 hover:text-white"
                  >
                    Quitar imagen adjunta
                  </button>
                </div>
              )}

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-white/45">
                  Producto
                </label>
                <div className="grid gap-3 sm:grid-cols-3">
                  {PRODUCT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setProductType(opt.value)}
                      className={`rounded-xl border px-3 py-3 text-left text-sm transition ${
                        productType === opt.value
                          ? 'border-violet-500/60 bg-violet-500/15 text-white shadow-[0_0_16px_rgba(139,92,246,0.2)]'
                          : 'border-white/10 bg-white/[0.03] text-white/70 hover:border-white/20'
                      }`}
                    >
                      <span className="block font-bold">{opt.label}</span>
                      <span className="mt-0.5 block text-xs text-white/45">{opt.hint}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="qty" className="mb-2 block text-xs font-bold uppercase tracking-widest text-white/45">
                    Cantidad
                  </label>
                  <input
                    id="qty"
                    type="number"
                    min={1}
                    max={99}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.min(99, Math.max(1, Number(e.target.value) || 1)))}
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-violet-500/50"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="mb-2 block text-xs font-bold uppercase tracking-widest text-white/45">
                    Teléfono (opcional)
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-violet-500/50"
                    placeholder="+54 …"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="notes" className="mb-2 block text-xs font-bold uppercase tracking-widest text-white/45">
                  Detalle del pedido
                </label>
                <textarea
                  id="notes"
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full resize-y rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-violet-500/50"
                  placeholder="Tamaño, acabado, comentarios…"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="cname" className="mb-2 block text-xs font-bold uppercase tracking-widest text-white/45">
                    Nombre
                  </label>
                  <input
                    id="cname"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-violet-500/50"
                  />
                </div>
                <div>
                  <label htmlFor="cemail" className="mb-2 block text-xs font-bold uppercase tracking-widest text-white/45">
                    Email de contacto
                  </label>
                  <input
                    id="cemail"
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-violet-500/50"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-4 text-sm font-bold text-white shadow-[0_0_24px_rgba(139,92,246,0.35)] transition hover:from-violet-500 hover:to-fuchsia-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> : <Store className="h-5 w-5" aria-hidden />}
                Enviar pedido
              </button>
            </form>

            <div className="rounded-2xl border border-white/10 bg-[#0a0f1c]/60 p-6 backdrop-blur-xl">
              <h2 className="mb-4 text-lg font-bold text-white">Mis pedidos</h2>
              {loadingOrders ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-violet-400" aria-hidden />
                </div>
              ) : orders.length === 0 ? (
                <p className="text-sm text-white/50">Todavía no tenés pedidos en el Store.</p>
              ) : (
                <ul className="space-y-3">
                  {orders.map((o) => (
                    <li
                      key={o.id}
                      className="flex flex-col gap-2 rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex items-start gap-3">
                        {o.customer_image_url ? (
                          <div className="relative h-14 w-10 shrink-0 overflow-hidden rounded border border-white/15">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={o.customer_image_url} alt="" className="h-full w-full object-cover object-top" />
                          </div>
                        ) : null}
                        <div>
                          <span className="font-bold capitalize text-white">{o.product_type}</span>
                          <span className="text-white/40"> · </span>
                          <span className="text-white/60">×{o.quantity}</span>
                          <p className="text-xs text-white/45">
                            {new Date(o.created_at).toLocaleString('es-AR')} · {STATUS_ES[o.status] ?? o.status}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-medium text-violet-300/90">{o.contact_email}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
