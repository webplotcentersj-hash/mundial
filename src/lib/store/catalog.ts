/** Catálogo del Store: solo combo (figurita + plancha stickers + poster). */

export type PrintProductType = 'combo' | 'poster' | 'sticker' | 'figurita'

/** Tipos que aún pueden existir en pedidos viejos; venta nueva = solo combo. */
export const PRINT_PRODUCT_TYPES: PrintProductType[] = ['combo', 'poster', 'sticker', 'figurita']

export const STORE_SELLABLE_PRODUCT_TYPE = 'combo' as const
export type SellableProductType = typeof STORE_SELLABLE_PRODUCT_TYPE

export const STORE_COMBO_PRICE_ARS = 10_000

export type ComboStickerId = 'stickers-clasico' | 'stickers-neon' | 'stickers-mundial'
export type ComboPosterId = 'poster-estadio' | 'poster-leyenda' | 'poster-bandera'

export type ComboVariantOption<T extends string> = {
  id: T
  label: string
  hint: string
  image?: string
}

export const COMBO_STICKER_OPTIONS: ComboVariantOption<ComboStickerId>[] = [
  {
    id: 'stickers-clasico',
    label: 'Plancha Clásica',
    hint: 'Vinilo troquelado · set A',
    image:
      'https://images.unsplash.com/photo-1560769629-975ec94e6a86?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'stickers-neon',
    label: 'Plancha Neon',
    hint: 'Vinilo troquelado · set B',
    image:
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'stickers-mundial',
    label: 'Plancha Mundial',
    hint: 'Vinilo troquelado · set C',
    image:
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  },
]

export const COMBO_POSTER_OPTIONS: ComboVariantOption<ComboPosterId>[] = [
  {
    id: 'poster-estadio',
    label: 'Poster Estadio',
    hint: 'A3 · papel mate',
    image:
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'poster-leyenda',
    label: 'Poster Leyenda',
    hint: 'A2 · papel premium',
    image:
      'https://images.unsplash.com/photo-1508098682720-e8620fca8142?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'poster-bandera',
    label: 'Poster Bandera',
    hint: 'A3 · full color',
    image:
      'https://images.unsplash.com/photo-1521412648747-7eef3094c9f0?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  },
]

export const DEFAULT_COMBO_STICKER_ID: ComboStickerId = COMBO_STICKER_OPTIONS[0].id
export const DEFAULT_COMBO_POSTER_ID: ComboPosterId = COMBO_POSTER_OPTIONS[0].id

export type ComboSelection = {
  stickerId: ComboStickerId
  posterId: ComboPosterId
}

export type StoreCatalogItem = {
  type: SellableProductType
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
    image:
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    includes: ['Tu figurita (Mi Figurita)', '1 plancha de stickers a elección', '1 poster a elección'],
  },
]

/** @deprecated Solo referencia histórica; no se venden por separado. */
export const STORE_PRICES_ARS: Record<PrintProductType, number> = {
  combo: STORE_COMBO_PRICE_ARS,
  poster: 0,
  sticker: 0,
  figurita: 0,
}

export function formatPriceARS(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function isComboStickerId(value: string): value is ComboStickerId {
  return COMBO_STICKER_OPTIONS.some((o) => o.id === value)
}

export function isComboPosterId(value: string): value is ComboPosterId {
  return COMBO_POSTER_OPTIONS.some((o) => o.id === value)
}

export function isSellableProductType(value: string): value is SellableProductType {
  return value === STORE_SELLABLE_PRODUCT_TYPE
}

export function isPrintProductType(value: string): value is PrintProductType {
  return PRINT_PRODUCT_TYPES.includes(value as PrintProductType)
}

export function getStickerOption(id: ComboStickerId) {
  return COMBO_STICKER_OPTIONS.find((o) => o.id === id)
}

export function getPosterOption(id: ComboPosterId) {
  return COMBO_POSTER_OPTIONS.find((o) => o.id === id)
}

export function buildComboOrderNotes(selection: ComboSelection, extraNotes?: string): string {
  const sticker = getStickerOption(selection.stickerId)
  const poster = getPosterOption(selection.posterId)
  const lines = [
    'Combo: figurita + plancha de stickers + poster',
    `Plancha stickers: ${sticker?.label ?? selection.stickerId}`,
    `Poster: ${poster?.label ?? selection.posterId}`,
  ]
  const extra = extraNotes?.trim()
  if (extra) lines.push(extra)
  return lines.join('\n')
}

export function getComboLineLabel(selection: ComboSelection): string {
  const sticker = getStickerOption(selection.stickerId)
  const poster = getPosterOption(selection.posterId)
  return `Combo · ${sticker?.label ?? 'Stickers'} + ${poster?.label ?? 'Poster'}`
}

export function getUnitPrice(type: PrintProductType): number {
  if (type === 'combo') return STORE_COMBO_PRICE_ARS
  return 0
}

export function getLineSubtotal(type: PrintProductType, quantity: number): number {
  if (type !== 'combo') return 0
  const qty = Math.max(1, Math.floor(quantity) || 1)
  return STORE_COMBO_PRICE_ARS * qty
}

export function getCartTotal(
  lines: { product_type: PrintProductType; quantity: number }[],
): number {
  return lines.reduce((sum, line) => {
    if (line.product_type !== 'combo') return sum
    return sum + getLineSubtotal('combo', line.quantity)
  }, 0)
}

export function getProductLabel(type: PrintProductType | string): string {
  if (type === 'combo') return 'Combo Plot Mundial'
  if (type === 'poster') return 'Poster'
  if (type === 'sticker') return 'Stickers en vinilo'
  if (type === 'figurita') return 'Figurita'
  return String(type)
}

export function validateComboLine(input: {
  product_type: string
  combo_sticker_id?: string
  combo_poster_id?: string
  customer_image_url?: string | null
}): { ok: true; selection: ComboSelection } | { ok: false; error: string } {
  if (!isSellableProductType(input.product_type)) {
    return { ok: false, error: 'Solo está disponible el combo (figurita + stickers + poster).' }
  }
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
  return {
    ok: true,
    selection: { stickerId: input.combo_sticker_id, posterId: input.combo_poster_id },
  }
}
