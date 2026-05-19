/** Catálogo y precios del Store. */

import {
  DEFAULT_COMBO_POSTER_ID,
  DEFAULT_COMBO_STICKER_ID,
  POSTER_GALLERY,
  STICKER_SHEET_GALLERY,
  getPosterAsset,
  getStickerAsset,
  isComboPosterId,
  isComboStickerId,
  type ComboPosterId,
  type ComboStickerId,
} from '@/lib/store/gallery-assets'
import type { StoreCartLineInput } from '@/lib/store/cart-lines'

export type { ComboPosterId, ComboStickerId }
export type { StoreCartLine, StoreCartLineInput } from '@/lib/store/cart-lines'
export {
  DEFAULT_COMBO_POSTER_ID,
  DEFAULT_COMBO_STICKER_ID,
  POSTER_GALLERY,
  STICKER_SHEET_GALLERY,
  getPosterAsset,
  getStickerAsset,
  isComboPosterId,
  isComboStickerId,
}

export type PrintProductType = 'combo' | 'poster' | 'sticker' | 'figurita'

export const PRINT_PRODUCT_TYPES: PrintProductType[] = ['combo', 'poster', 'sticker', 'figurita']

export const STORE_COMBO_PRICE_ARS = 10_000
export const STORE_POSTER_PRICE_ARS = 3_500
export const STORE_STICKER_PRICE_ARS = 6_000

export const COMBO_STICKER_OPTIONS = STICKER_SHEET_GALLERY
export const COMBO_POSTER_OPTIONS = POSTER_GALLERY

export type ComboSelection = {
  stickerId: ComboStickerId
  posterId: ComboPosterId
}

export type StoreCatalogItem = {
  type: PrintProductType
  label: string
  hint: string
  badge?: 'new' | 'sale'
  image: string
  includes: string[]
}

export const STORE_CATALOG: StoreCatalogItem[] = [
  {
    type: 'combo',
    label: 'Combo Plot Mundial',
    hint: 'Figurita personalizada + plancha de stickers en vinilo + poster',
    badge: 'sale',
    image: POSTER_GALLERY[0]?.image ?? '/Poster/STORE-06.png',
    includes: ['Tu figurita (Mi Figurita)', '1 plancha de stickers a elección', '1 poster a elección'],
  },
]

export const STORE_PRICES_ARS: Record<PrintProductType, number> = {
  combo: STORE_COMBO_PRICE_ARS,
  poster: STORE_POSTER_PRICE_ARS,
  sticker: STORE_STICKER_PRICE_ARS,
  figurita: 0,
}

export function formatPriceARS(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function isPrintProductType(value: string): value is PrintProductType {
  return PRINT_PRODUCT_TYPES.includes(value as PrintProductType)
}

export function isSellableProductType(value: string): value is 'combo' | 'poster' | 'sticker' {
  return value === 'combo' || value === 'poster' || value === 'sticker'
}

export function getStickerOption(id: ComboStickerId | string) {
  return getStickerAsset(id)
}

export function getPosterOption(id: ComboPosterId | string) {
  return getPosterAsset(id)
}

export function buildOrderNotesForLine(input: StoreCartLineInput): string {
  if (input.product_type === 'combo' && input.combo_sticker_id && input.combo_poster_id) {
    return buildComboOrderNotes(
      {
        stickerId: input.combo_sticker_id as ComboStickerId,
        posterId: input.combo_poster_id as ComboPosterId,
      },
      input.notes,
    )
  }
  if (input.product_type === 'poster' && input.variant_id && isComboPosterId(input.variant_id)) {
    return input.notes?.trim() || buildPosterOrderNotes(input.variant_id, input.notes)
  }
  if (input.product_type === 'sticker' && input.variant_id && isComboStickerId(input.variant_id)) {
    return input.notes?.trim() || buildStickerOrderNotes(input.variant_id, input.notes)
  }
  return input.notes?.trim() || ''
}

export function getUnitPrice(type: PrintProductType): number {
  return STORE_PRICES_ARS[type] ?? 0
}

export function getLineSubtotal(type: PrintProductType, quantity: number): number {
  const qty = Math.max(1, Math.floor(quantity) || 1)
  const unit = getUnitPrice(type)
  if (unit < 1) return 0
  return unit * qty
}

export function getCartTotal(lines: { product_type: PrintProductType; quantity: number }[]): number {
  return lines.reduce((sum, line) => sum + getLineSubtotal(line.product_type, line.quantity), 0)
}

export function getProductLabel(type: PrintProductType | string): string {
  if (type === 'combo') return 'Combo Plot Mundial'
  if (type === 'poster') return 'Poster'
  if (type === 'sticker') return 'Plancha de stickers'
  if (type === 'figurita') return 'Figurita'
  return String(type)
}

export function buildPosterOrderNotes(variantId: ComboPosterId, extra?: string): string {
  const asset = getPosterAsset(variantId)
  const lines = [
    'Poster individual',
    `Diseño: ${asset?.label ?? variantId}`,
    `Archivo: ${asset?.image ?? '—'}`,
  ]
  if (extra?.trim()) lines.push(extra.trim())
  return lines.join('\n')
}

export function buildStickerOrderNotes(variantId: ComboStickerId, extra?: string): string {
  const asset = getStickerAsset(variantId)
  const lines = [
    'Plancha de stickers individual',
    `Diseño: ${asset?.label ?? variantId}`,
    `Archivo: ${asset?.image ?? '—'}`,
  ]
  if (extra?.trim()) lines.push(extra.trim())
  return lines.join('\n')
}

export function buildComboOrderNotes(selection: ComboSelection, extraNotes?: string): string {
  const sticker = getStickerAsset(selection.stickerId)
  const poster = getPosterAsset(selection.posterId)
  const lines = [
    'Combo: figurita + plancha de stickers + poster',
    `Plancha stickers: ${sticker?.label ?? selection.stickerId} (${sticker?.image ?? '—'})`,
    `Poster: ${poster?.label ?? selection.posterId} (${poster?.image ?? '—'})`,
  ]
  const extra = extraNotes?.trim()
  if (extra) lines.push(extra)
  return lines.join('\n')
}

export function getCartLineLabel(line: StoreCartLineInput): string {
  if (line.product_type === 'combo' && line.combo_sticker_id && line.combo_poster_id) {
    return getComboLineLabel({
      stickerId: line.combo_sticker_id as ComboStickerId,
      posterId: line.combo_poster_id as ComboPosterId,
    })
  }
  if (line.product_type === 'poster' && line.variant_id) {
    const p = getPosterAsset(line.variant_id)
    return p ? `Poster · ${p.label}` : `Poster · ${line.variant_id}`
  }
  if (line.product_type === 'sticker' && line.variant_id) {
    const s = getStickerAsset(line.variant_id)
    return s ? `Plancha stickers · ${s.label}` : `Plancha · ${line.variant_id}`
  }
  return getProductLabel(line.product_type)
}

export function getComboLineLabel(selection: ComboSelection): string {
  const sticker = getStickerAsset(selection.stickerId)
  const poster = getPosterAsset(selection.posterId)
  return `Combo · ${sticker?.label ?? 'Stickers'} + ${poster?.label ?? 'Poster'}`
}

export function getCartLinePreviewImage(line: StoreCartLineInput): string | null {
  if (line.product_type === 'poster' && line.variant_id) {
    return getPosterAsset(line.variant_id)?.image ?? null
  }
  if (line.product_type === 'sticker' && line.variant_id) {
    return getStickerAsset(line.variant_id)?.image ?? null
  }
  if (line.product_type === 'combo' && line.customer_image_url) {
    return line.customer_image_url
  }
  return null
}

export function validateStoreCartLine(
  input: StoreCartLineInput,
): { ok: true } | { ok: false; error: string } {
  const qty = Math.min(99, Math.max(1, Math.floor(Number(input.quantity)) || 1))
  if (qty < 1) return { ok: false, error: 'Cantidad inválida' }

  if (input.product_type === 'figurita') {
    return { ok: false, error: 'La figurita solo está disponible dentro del combo.' }
  }

  if (input.product_type === 'poster') {
    if (!input.variant_id || !isComboPosterId(input.variant_id)) {
      return { ok: false, error: 'Elegí un poster válido.' }
    }
    return { ok: true }
  }

  if (input.product_type === 'sticker') {
    if (!input.variant_id || !isComboStickerId(input.variant_id)) {
      return { ok: false, error: 'Elegí una plancha de stickers válida.' }
    }
    return { ok: true }
  }

  if (input.product_type === 'combo') {
    if (!input.combo_sticker_id || !isComboStickerId(input.combo_sticker_id)) {
      return { ok: false, error: 'Elegí una plancha de stickers para el combo.' }
    }
    if (!input.combo_poster_id || !isComboPosterId(input.combo_poster_id)) {
      return { ok: false, error: 'Elegí un poster para el combo.' }
    }
    if (!input.customer_image_url?.trim()) {
      return {
        ok: false,
        error: 'El combo incluye tu figurita: creala en Mi Figurita y volvé al Store con tu PNG.',
      }
    }
    return { ok: true }
  }

  return { ok: false, error: 'Tipo de producto inválido.' }
}

/** @deprecated Use validateStoreCartLine */
export function validateComboLine(input: StoreCartLineInput) {
  if (input.product_type !== 'combo') {
    return { ok: false as const, error: 'No es un combo.' }
  }
  const v = validateStoreCartLine(input)
  if (!v.ok) return v
  return {
    ok: true as const,
    selection: {
      stickerId: input.combo_sticker_id!,
      posterId: input.combo_poster_id!,
    },
  }
}
