import type { PrintProductType } from '@/lib/store/catalog'
import {
  getPosterAsset,
  getStickerAsset,
  isComboPosterId,
  isComboStickerId,
} from '@/lib/store/gallery-assets'
import type { StoreCartLineInput } from '@/lib/store/cart-lines'

export type PrintAssetThumb = {
  label: string
  src: string
}

export type PrintOrderImageFields = {
  variant_image_url: string | null
  combo_sticker_image_url: string | null
  combo_poster_image_url: string | null
}

/** Rutas públicas para guardar en DB al crear el pedido. */
export function getPrintImageFieldsForLine(line: StoreCartLineInput): PrintOrderImageFields {
  if (line.product_type === 'poster' && line.variant_id && isComboPosterId(line.variant_id)) {
    const img = getPosterAsset(line.variant_id)?.imageFull ?? null
    return { variant_image_url: img, combo_sticker_image_url: null, combo_poster_image_url: null }
  }
  if (line.product_type === 'sticker' && line.variant_id && isComboStickerId(line.variant_id)) {
    const img = getStickerAsset(line.variant_id)?.imageFull ?? null
    return { variant_image_url: img, combo_sticker_image_url: null, combo_poster_image_url: null }
  }
  if (line.product_type === 'combo' && line.combo_sticker_id && line.combo_poster_id) {
    return {
      variant_image_url: null,
      combo_sticker_image_url: getStickerAsset(line.combo_sticker_id)?.imageFull ?? null,
      combo_poster_image_url: getPosterAsset(line.combo_poster_id)?.imageFull ?? null,
    }
  }
  return { variant_image_url: null, combo_sticker_image_url: null, combo_poster_image_url: null }
}

/** Extrae path entre paréntesis o línea Archivo: */
function pathFromNotesLine(notes: string, pattern: RegExp): string | null {
  const m = notes.match(pattern)
  const p = m?.[1]?.trim()
  if (!p || !p.startsWith('/')) return null
  return p
}

/** Miniaturas para admin (DB + fallback en notas). */
export function getPrintAssetThumbs(order: {
  product_type: PrintProductType | string
  notes: string | null
  customer_image_url: string | null
  variant_image_url?: string | null
  combo_sticker_image_url?: string | null
  combo_poster_image_url?: string | null
}): PrintAssetThumb[] {
  const thumbs: PrintAssetThumb[] = []
  const type = order.product_type

  if (type === 'combo') {
    if (order.customer_image_url) {
      thumbs.push({ label: 'Figurita', src: order.customer_image_url })
    }
    const sticker =
      order.combo_sticker_image_url?.trim() ||
      pathFromNotesLine(order.notes ?? '', /Plancha stickers?:[^\n]*\((\/[^)]+)\)/i)
    const poster =
      order.combo_poster_image_url?.trim() ||
      pathFromNotesLine(order.notes ?? '', /Poster:\s*[^\n]*\((\/[^)]+)\)/i)
    if (sticker) thumbs.push({ label: 'Plancha stickers', src: sticker })
    if (poster) thumbs.push({ label: 'Poster', src: poster })
    return thumbs
  }

  if (order.customer_image_url && type === 'figurita') {
    thumbs.push({ label: 'Figurita', src: order.customer_image_url })
  }

  const variant =
    order.variant_image_url?.trim() ||
    pathFromNotesLine(order.notes ?? '', /Archivo:\s*(\/[^\s\n]+)/i)
  if (variant) {
    const label = type === 'poster' ? 'Poster' : type === 'sticker' ? 'Plancha stickers' : 'Diseño'
    thumbs.push({ label, src: variant })
  }

  return thumbs
}
