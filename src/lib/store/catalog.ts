/** Tipos y precios del Store (ARS, sin pago online en la web). */

export type PrintProductType = 'combo' | 'poster' | 'sticker' | 'figurita'

export const PRINT_PRODUCT_TYPES: PrintProductType[] = ['combo', 'poster', 'sticker', 'figurita']

export const STORE_PRICES_ARS: Record<PrintProductType, number> = {
  combo: 10_000,
  poster: 3_500,
  sticker: 6_000,
  figurita: 2_500,
}

export type StoreCatalogItem = {
  type: PrintProductType
  label: string
  hint: string
  badge?: 'new' | 'sale'
  image: string
}

export const STORE_CATALOG: StoreCatalogItem[] = [
  {
    type: 'combo',
    label: 'Combo',
    hint: 'Poster + stickers en vinilo + figuritas',
    badge: 'sale',
    image:
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  },
  {
    type: 'poster',
    label: 'Poster',
    hint: 'Gran formato · para el living',
    image:
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  },
  {
    type: 'sticker',
    label: 'Stickers en vinilo',
    hint: 'Hoja troquelada · acabado vinilo',
    image:
      'https://images.unsplash.com/photo-1560769629-975ec94e6a86?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  },
  {
    type: 'figurita',
    label: 'Figurita',
    hint: 'Carta coleccionable · papel premium',
    badge: 'new',
    image:
      'https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  },
]

/** Suma si comprás por separado (referencia para el combo). */
export const STORE_COMBO_SEPARATE_TOTAL_ARS =
  STORE_PRICES_ARS.poster + STORE_PRICES_ARS.sticker + STORE_PRICES_ARS.figurita

export function formatPriceARS(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function getUnitPrice(type: PrintProductType): number {
  return STORE_PRICES_ARS[type]
}

export function getLineSubtotal(type: PrintProductType, quantity: number): number {
  const qty = Math.max(1, Math.floor(quantity) || 1)
  return getUnitPrice(type) * qty
}

export function getCartTotal(
  lines: { product_type: PrintProductType; quantity: number }[],
): number {
  return lines.reduce((sum, line) => sum + getLineSubtotal(line.product_type, line.quantity), 0)
}

export function getProductLabel(type: PrintProductType | string): string {
  if (type === 'combo') return 'Combo'
  if (type === 'poster') return 'Poster'
  if (type === 'sticker') return 'Stickers en vinilo'
  if (type === 'figurita') return 'Figurita'
  return String(type)
}

export function isPrintProductType(value: string): value is PrintProductType {
  return PRINT_PRODUCT_TYPES.includes(value as PrintProductType)
}
