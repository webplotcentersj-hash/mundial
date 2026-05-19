'use client'

import { StoreGalleryPicker } from '@/components/store/store-gallery-picker'
import { useStore } from '@/components/store/store-provider'
import {
  STORE_POSTER_PRICE_ARS,
  STORE_STICKER_PRICE_ARS,
  formatPriceARS,
} from '@/lib/store/catalog'
import { POSTER_GALLERY, STICKER_SHEET_GALLERY } from '@/lib/store/gallery-assets'
import type { ComboPosterId, ComboStickerId } from '@/lib/store/gallery-assets'

type ProductKind = 'poster' | 'sticker'

const copy: Record<
  ProductKind,
  { title: string; lead: string; price: number; items: typeof POSTER_GALLERY | typeof STICKER_SHEET_GALLERY; label: string }
> = {
  poster: {
    title: 'Posters',
    lead: 'Elegí un diseño y agregalo al carrito. Tocá la imagen para verla en grande.',
    price: STORE_POSTER_PRICE_ARS,
    items: POSTER_GALLERY,
    label: 'Posters',
  },
  sticker: {
    title: 'Stickers',
    lead: 'Planchas en vinilo. Elegí diseño y comprá directo desde la galería.',
    price: STORE_STICKER_PRICE_ARS,
    items: STICKER_SHEET_GALLERY,
    label: 'Planchas de stickers',
  },
}

export function StoreProductGallery({ kind }: { kind: ProductKind }) {
  const { addPosterToCart, addStickerToCart } = useStore()
  const meta = copy[kind]

  return (
    <section className="store-page-section">
      <div className="container">
        <header className="store-page-header">
          <h1 className="store-page-title">{meta.title}</h1>
          <p className="store-page-lead">{meta.lead}</p>
          <p className="store-page-price">{formatPriceARS(meta.price)} c/u</p>
        </header>

        <StoreGalleryPicker
          label={meta.label}
          items={meta.items}
          unitPrice={meta.price}
          onBuyIndividual={(item) =>
            kind === 'poster'
              ? addPosterToCart(item.id as ComboPosterId)
              : addStickerToCart(item.id as ComboStickerId)
          }
        />
      </div>
    </section>
  )
}
