'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Loader2,
  Search,
  Store,
  Upload,
  CreditCard,
  Package,
  Banknote,
} from 'lucide-react'
import {
  formatPriceARS,
  getLineSubtotal,
  getProductLabel,
  getUnitPrice,
} from '@/lib/store/catalog'
import { getPrintAssetThumbs } from '@/lib/store/order-print-assets'
import type {
  AdminStoreDashboard,
  PrintOrderRow,
  PrintOrderStatus,
  StoreCheckoutSummary,
} from '@/lib/actions'

const PRINT_STATUS_OPTIONS: { value: PrintOrderStatus; label: string }[] = [
  { value: 'awaiting_payment', label: 'Esperando pago' },
  { value: 'pending', label: 'Pendiente' },
  { value: 'in_review', label: 'En revisión' },
  { value: 'printing', label: 'Producción' },
  { value: 'ready', label: 'Listo' },
  { value: 'shipped', label: 'Enviado' },
  { value: 'cancelled', label: 'Cancelado' },
]

const MP_STATUS: Record<string, { label: string; className: string }> = {
  approved: { label: 'MP pagado', className: 'admin-store-badge--ok' },
  pending: { label: 'MP pendiente', className: 'admin-store-badge--warn' },
  in_process: { label: 'MP en proceso', className: 'admin-store-badge--warn' },
  rejected: { label: 'MP rechazado', className: 'admin-store-badge--err' },
  cancelled: { label: 'MP cancelado', className: 'admin-store-badge--muted' },
}

function getCheckout(order: PrintOrderRow): StoreCheckoutSummary | null {
  const sc = order.store_checkouts
  if (!sc) return null
  return Array.isArray(sc) ? (sc[0] ?? null) : sc
}

function formatAdminDate(iso: string | null | undefined) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })
  } catch {
    return iso
  }
}

type Props = {
  loading: boolean
  data: AdminStoreDashboard | null
  printSavingId: string | null
  adminNotesDraft: Record<string, string>
  onNotesDraftChange: (id: string, value: string) => void
  onStatusChange: (orderId: string, status: PrintOrderStatus) => void
  onSaveAdminNotes: (orderId: string) => void
  onAdminFileUpload: (orderId: string, file: File | null) => void
}

export function AdminStoreOrdersPanel({
  loading,
  data,
  printSavingId,
  adminNotesDraft,
  onNotesDraftChange,
  onStatusChange,
  onSaveAdminNotes,
  onAdminFileUpload,
}: Props) {
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [mpFilter, setMpFilter] = useState<string>('all')

  const orders = data?.orders ?? []
  const checkouts = data?.checkouts ?? []

  const stats = useMemo(() => {
    let mpApproved = 0
    let mpPending = 0
    let linesSubtotal = 0
    for (const c of checkouts) {
      if (c.payment_status === 'approved') mpApproved += c.total_ars
      else if (c.payment_status === 'pending' || c.payment_status === 'in_process') mpPending += c.total_ars
    }
    for (const o of orders) {
      if (o.status !== 'cancelled') {
        linesSubtotal += getLineSubtotal(o.product_type, o.quantity)
      }
    }
    const awaiting = orders.filter((o) => o.status === 'awaiting_payment').length
    return { mpApproved, mpPending, linesSubtotal, awaiting, checkoutCount: checkouts.length }
  }, [checkouts, orders])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return orders.filter((o) => {
      if (statusFilter !== 'all' && o.status !== statusFilter) return false
      const checkout = getCheckout(o)
      if (mpFilter === 'with_mp' && !checkout) return false
      if (mpFilter === 'approved' && checkout?.payment_status !== 'approved') return false
      if (mpFilter === 'unpaid' && checkout?.payment_status === 'approved') return false
      if (!q) return true
      const hay = [
        o.contact_name,
        o.contact_email,
        o.contact_phone,
        o.notes,
        o.profiles?.username,
        o.product_type,
        getProductLabel(o.product_type),
        checkout?.mp_payment_id,
        checkout?.id,
        o.id,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return hay.includes(q)
    })
  }, [orders, query, statusFilter, mpFilter])

  return (
    <div className="admin-store">
      <header className="admin-store__hero">
        <div className="admin-store__hero-text">
          <Store className="h-8 w-8" aria-hidden />
          <div>
            <h2 className="admin-store__title">Plot Mundial Store</h2>
            <p className="admin-store__subtitle">Pedidos, arte para imprenta y pagos Mercado Pago</p>
          </div>
        </div>
        <Link href="/store/combo" className="admin-store__cta">
          Ver tienda
        </Link>
      </header>

      <div className="admin-store__stats">
        <div className="admin-store__stat">
          <Banknote className="h-5 w-5" aria-hidden />
          <div>
            <span className="admin-store__stat-label">Cobrado en MP</span>
            <strong>{formatPriceARS(stats.mpApproved)}</strong>
          </div>
        </div>
        <div className="admin-store__stat">
          <CreditCard className="h-5 w-5" aria-hidden />
          <div>
            <span className="admin-store__stat-label">MP pendiente / proceso</span>
            <strong>{formatPriceARS(stats.mpPending)}</strong>
          </div>
        </div>
        <div className="admin-store__stat">
          <Package className="h-5 w-5" aria-hidden />
          <div>
            <span className="admin-store__stat-label">Líneas pedidas (catálogo)</span>
            <strong>{formatPriceARS(stats.linesSubtotal)}</strong>
          </div>
        </div>
        <div className="admin-store__stat admin-store__stat--accent">
          <span className="admin-store__stat-label">Checkouts MP</span>
          <strong>{stats.checkoutCount}</strong>
          <span className="admin-store__stat-hint">{stats.awaiting} líneas esperando pago</span>
        </div>
      </div>

      <div className="admin-store__toolbar">
        <div className="admin-store__search-wrap">
          <Search className="admin-store__search-icon" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre, mail, usuario, producto, ID de pago MP…"
            className="admin-store__search"
            aria-label="Buscar pedidos"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="admin-store__select"
          aria-label="Filtrar por estado"
        >
          <option value="all">Todos los estados</option>
          {PRINT_STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <select
          value={mpFilter}
          onChange={(e) => setMpFilter(e.target.value)}
          className="admin-store__select"
          aria-label="Filtrar por pago"
        >
          <option value="all">Todos los pagos</option>
          <option value="with_mp">Con checkout MP</option>
          <option value="approved">MP aprobado</option>
          <option value="unpaid">Sin pago aprobado</option>
        </select>
      </div>

      {loading ? (
        <div className="admin-store__loading">
          <Loader2 className="h-10 w-10 animate-spin" aria-hidden />
          <p>Cargando pedidos…</p>
        </div>
      ) : filtered.length === 0 ? (
        <p className="admin-store__empty">No hay pedidos que coincidan con la búsqueda.</p>
      ) : (
        <ul className="admin-store__list">
          {filtered.map((o) => (
            <AdminStoreOrderCard
              key={o.id}
              order={o}
              checkout={getCheckout(o)}
              saving={printSavingId === o.id}
              adminNote={adminNotesDraft[o.id] ?? ''}
              onNoteChange={(v) => onNotesDraftChange(o.id, v)}
              onStatusChange={(s) => onStatusChange(o.id, s)}
              onSaveNote={() => onSaveAdminNotes(o.id)}
              onFileUpload={(f) => onAdminFileUpload(o.id, f)}
            />
          ))}
        </ul>
      )}
    </div>
  )
}

function AdminStoreOrderCard({
  order: o,
  checkout,
  saving,
  adminNote,
  onNoteChange,
  onStatusChange,
  onSaveNote,
  onFileUpload,
}: {
  order: PrintOrderRow
  checkout: StoreCheckoutSummary | null
  saving: boolean
  adminNote: string
  onNoteChange: (v: string) => void
  onStatusChange: (s: PrintOrderStatus) => void
  onSaveNote: () => void
  onFileUpload: (f: File | null) => void
}) {
  const thumbs = getPrintAssetThumbs(o)
  const lineTotal = getLineSubtotal(o.product_type, o.quantity)
  const unit = getUnitPrice(o.product_type)
  const mp = checkout ? MP_STATUS[checkout.payment_status] : null

  return (
    <li className="admin-store-card">
      <div className="admin-store-card__head">
        <div>
          <p className="admin-store-card__date">{formatAdminDate(o.created_at)}</p>
          <h3 className="admin-store-card__product">{getProductLabel(o.product_type)}</h3>
          <p className="admin-store-card__user">@{o.profiles?.username ?? 'sin usuario'}</p>
        </div>
        <div className="admin-store-card__badges">
          {mp ? (
            <span className={`admin-store-badge ${mp.className}`}>{mp.label}</span>
          ) : (
            <span className="admin-store-badge admin-store-badge--muted">Sin MP</span>
          )}
          <span className="admin-store-card__price">{formatPriceARS(lineTotal)}</span>
          <span className="admin-store-card__qty">
            {o.quantity} × {formatPriceARS(unit)}
          </span>
        </div>
      </div>

      <div className="admin-store-card__prints">
        <p className="admin-store-card__prints-title">Para imprimir</p>
        {thumbs.length === 0 ? (
          <p className="admin-store-card__prints-empty">Sin vistas de arte — revisá las notas del pedido.</p>
        ) : (
          <div className="admin-store-card__thumbs">
            {thumbs.map((t) => (
              <a
                key={`${t.label}-${t.src}`}
                href={t.src}
                target="_blank"
                rel="noopener noreferrer"
                className="admin-store-thumb"
              >
                <span className="admin-store-thumb__label">{t.label}</span>
                {t.src.startsWith('http') ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={t.src}
                    alt={t.label}
                    className="admin-store-thumb__img admin-store-thumb__img--figurita"
                  />
                ) : (
                  <Image src={t.src} alt={t.label} width={120} height={120} className="admin-store-thumb__img" />
                )}
              </a>
            ))}
          </div>
        )}
      </div>

      <div className="admin-store-card__grid">
        <div>
          <p className="admin-store-card__label">Contacto</p>
          <p className="admin-store-card__value">{o.contact_name}</p>
          <p className="admin-store-card__value-muted">{o.contact_email}</p>
          {o.contact_phone && <p className="admin-store-card__value-muted">{o.contact_phone}</p>}
        </div>
        <div>
          <p className="admin-store-card__label">Mercado Pago</p>
          {checkout ? (
            <>
              <p className="admin-store-card__value">Checkout {formatPriceARS(checkout.total_ars)}</p>
              {checkout.mp_payment_id && (
                <p className="admin-store-card__mono">Pago: {checkout.mp_payment_id}</p>
              )}
            </>
          ) : (
            <p className="admin-store-card__value-muted">Pedido sin checkout (coordinar pago)</p>
          )}
        </div>
        <div>
          <p className="admin-store-card__label">Estado producción</p>
          <select
            value={o.status}
            disabled={saving}
            onChange={(e) => onStatusChange(e.target.value as PrintOrderStatus)}
            className="admin-store__select admin-store__select--full"
          >
            {PRINT_STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {o.notes && (
        <details className="admin-store-card__notes">
          <summary>Notas del pedido</summary>
          <pre>{o.notes}</pre>
        </details>
      )}

      <div className="admin-store-card__admin">
        <textarea
          rows={2}
          value={adminNote}
          onChange={(e) => onNoteChange(e.target.value)}
          className="admin-store__textarea"
          placeholder="Notas internas de imprenta…"
        />
        <div className="admin-store-card__admin-actions">
          <button type="button" disabled={saving} onClick={onSaveNote} className="admin-store__btn">
            Guardar nota
          </button>
          <input
            type="file"
            id={`admin-store-up-${o.id}`}
            className="hidden"
            accept="image/png,image/jpeg,image/webp,application/pdf"
            disabled={saving}
            onChange={(e) => {
              onFileUpload(e.target.files?.[0] ?? null)
              e.target.value = ''
            }}
          />
          <label htmlFor={`admin-store-up-${o.id}`} className="admin-store__btn admin-store__btn--ghost">
            <Upload className="h-4 w-4" aria-hidden />
            Adjunto admin
          </label>
          {o.admin_file_url && (
            <a href={o.admin_file_url} target="_blank" rel="noopener noreferrer" className="admin-store__link">
              Ver adjunto
            </a>
          )}
        </div>
        {saving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
      </div>
    </li>
  )
}
