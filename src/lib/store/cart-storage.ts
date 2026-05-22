import {
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

export const CART_STORAGE_KEY = 'plotmundial_store_cart_v5'
const CART_LEGACY_SESSION_KEY = 'plotmundial_store_cart_v4'
export const CONTACT_STORAGE_KEY = 'plotmundial_store_contact_v1'
export const PENDING_CHECKOUT_KEY = 'plotmundial_store_pending_checkout_v1'
const CART_BACKUP_KEY = 'plotmundial_store_cart_backup_v1'

export type StoredContact = {
  contactName: string
  contactEmail: string
  contactPhone: string
}

export type PendingCheckout = {
  checkoutId: string
  savedAt: string
}

function localStore(): Storage | null {
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage
  } catch {
    return null
  }
}

function sessionStore(): Storage | null {
  if (typeof window === 'undefined') return null
  try {
    return window.sessionStorage
  } catch {
    return null
  }
}

export function parseStoredCartLine(row: unknown): StoreCartLine | null {
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

function parseCartRaw(raw: string | null): StoreCartLine[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    const cleaned: StoreCartLine[] = []
    for (const row of parsed) {
      const line = parseStoredCartLine(row)
      if (line) cleaned.push(line)
    }
    return cleaned
  } catch {
    return []
  }
}

export function loadStoredCartLines(): StoreCartLine[] {
  const local = localStore()
  const fromLocal = parseCartRaw(local?.getItem(CART_STORAGE_KEY) ?? null)
  if (fromLocal.length > 0) return fromLocal

  const session = sessionStore()
  const legacy = parseCartRaw(session?.getItem(CART_LEGACY_SESSION_KEY) ?? null)
  if (legacy.length > 0 && local) {
    try {
      local.setItem(CART_STORAGE_KEY, JSON.stringify(legacy))
      session?.removeItem(CART_LEGACY_SESSION_KEY)
    } catch {
      /* ignore */
    }
  }
  return legacy
}

export function saveStoredCartLines(cart: StoreCartLine[]) {
  const local = localStore()
  if (!local) return
  try {
    local.setItem(CART_STORAGE_KEY, JSON.stringify(cart))
  } catch {
    /* ignore */
  }
}

export function saveCartBackup(cart: StoreCartLine[]) {
  const local = localStore()
  if (!local) return
  try {
    local.setItem(CART_BACKUP_KEY, JSON.stringify(cart))
  } catch {
    /* ignore */
  }
}

export function restoreCartFromBackupIfEmpty(): boolean {
  const local = localStore()
  if (!local) return false
  const current = parseCartRaw(local.getItem(CART_STORAGE_KEY))
  if (current.length > 0) return false
  const backup = parseCartRaw(local.getItem(CART_BACKUP_KEY))
  if (backup.length === 0) return false
  saveStoredCartLines(backup)
  return true
}

export function clearStoredCart() {
  const local = localStore()
  if (!local) return
  try {
    local.removeItem(CART_STORAGE_KEY)
    local.removeItem(CART_BACKUP_KEY)
  } catch {
    /* ignore */
  }
  const session = sessionStore()
  try {
    session?.removeItem(CART_LEGACY_SESSION_KEY)
  } catch {
    /* ignore */
  }
}

export function loadStoredContact(): StoredContact {
  const local = localStore()
  if (!local) return { contactName: '', contactEmail: '', contactPhone: '' }
  try {
    const raw = local.getItem(CONTACT_STORAGE_KEY)
    if (!raw) return { contactName: '', contactEmail: '', contactPhone: '' }
    const parsed = JSON.parse(raw) as Partial<StoredContact>
    return {
      contactName: typeof parsed.contactName === 'string' ? parsed.contactName : '',
      contactEmail: typeof parsed.contactEmail === 'string' ? parsed.contactEmail : '',
      contactPhone: typeof parsed.contactPhone === 'string' ? parsed.contactPhone : '',
    }
  } catch {
    return { contactName: '', contactEmail: '', contactPhone: '' }
  }
}

export function saveStoredContact(contact: StoredContact) {
  const local = localStore()
  if (!local) return
  try {
    local.setItem(CONTACT_STORAGE_KEY, JSON.stringify(contact))
  } catch {
    /* ignore */
  }
}

export function clearStoredContact() {
  const local = localStore()
  if (!local) return
  try {
    local.removeItem(CONTACT_STORAGE_KEY)
  } catch {
    /* ignore */
  }
}

export function savePendingCheckout(checkout: PendingCheckout) {
  const local = localStore()
  if (!local) return
  try {
    local.setItem(PENDING_CHECKOUT_KEY, JSON.stringify(checkout))
  } catch {
    /* ignore */
  }
}

export function loadPendingCheckout(): PendingCheckout | null {
  const local = localStore()
  if (!local) return null
  try {
    const raw = local.getItem(PENDING_CHECKOUT_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<PendingCheckout>
    if (!parsed.checkoutId || typeof parsed.checkoutId !== 'string') return null
    return {
      checkoutId: parsed.checkoutId,
      savedAt: typeof parsed.savedAt === 'string' ? parsed.savedAt : new Date().toISOString(),
    }
  } catch {
    return null
  }
}

export function clearPendingCheckout() {
  const local = localStore()
  if (!local) return
  try {
    local.removeItem(PENDING_CHECKOUT_KEY)
  } catch {
    /* ignore */
  }
}

/** Limpia carrito, contacto y checkout pendiente tras pago aprobado. */
export function clearAllStoreCartData() {
  clearStoredCart()
  clearStoredContact()
  clearPendingCheckout()
}

export const STORE_CART_SYNC_EVENT = 'plotmundial-store-cart-sync'

export function dispatchStoreCartSync() {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new Event(STORE_CART_SYNC_EVENT))
}
