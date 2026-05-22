'use client'

import Link from 'next/link'
import { Plus, Sparkles } from 'lucide-react'
import { useStore } from '@/components/store/store-provider'
import {
  STORE_COMBO_PRICE_ARS,
  STORE_POSTER_PRICE_ARS,
  STORE_STICKER_PRICE_ARS,
  formatPriceARS,
  getLineSubtotal,
  getPosterOption,
  getStickerOption,
} from '@/lib/store/catalog'
import { POSTER_GALLERY, STICKER_SHEET_GALLERY } from '@/lib/store/gallery-assets'
import type { ComboPosterId, ComboStickerId } from '@/lib/store/gallery-assets'
import { StoreGalleryPicker } from '@/components/store/store-gallery-picker'
import { StoreImage } from '@/components/store/store-image'
import { StoreLazySection } from '@/components/store/store-lazy-section'
import { clearFiguritaStoreImageFromSession } from '@/lib/storePrints'

export function StoreComboBuilder() {
  const {
    customerImageUrl,
    setCustomerImageUrl,
    comboStickerId,
    setComboStickerId,
    comboPosterId,
    setComboPosterId,
    quantity,
    setQuantity,
    lineNotes,
    setLineNotes,
    canAddCombo,
    addToCart,
  } = useStore()

  const linePreviewTotal = getLineSubtotal('combo', quantity)

  return (
    <section className="store-page-section">
      <div className="container">
        <header className="store-page-header">
          <span className="product-badge new">Combo</span>
          <h1 className="store-page-title">Armá tu combo</h1>
          <p className="store-page-lead">
            Figurita (Mi Figurita) + plancha de stickers + poster. Todo en esta página: elegís diseños y
            agregás al carrito.
          </p>
          <p className="store-page-price">{formatPriceARS(STORE_COMBO_PRICE_ARS)}</p>
        </header>

        {!customerImageUrl ? (
          <div className="store-message err" style={{ display: 'block', padding: '12px 14px', marginBottom: 24 }}>
            Paso 1: creá tu figurita en{' '}
            <Link href="/figurita" className="font-bold underline">
              Mi Figurita
            </Link>{' '}
            y volvé acá para armar el combo.
          </div>
        ) : (
          <div className="store-figurita-card" style={{ marginBottom: 24, maxWidth: 280 }}>
            <span className="product-badge new" style={{ display: 'inline-block', marginBottom: 12 }}>
              <Sparkles className="mr-1 inline h-4 w-4" aria-hidden />
              Tu figurita
            </span>
            <StoreImage
              src={customerImageUrl}
              alt="Tu figurita"
              width={160}
              height={224}
              className="mx-auto block h-56 w-40 object-cover object-top"
              sizes="160px"
              priority
            />
            <button
              type="button"
              onClick={() => {
                setCustomerImageUrl(null)
                clearFiguritaStoreImageFromSession()
              }}
              className="remove-btn mt-3 w-full text-left text-sm"
            >
              Quitar imagen
            </button>
          </div>
        )}

        {customerImageUrl ? (
          <div className="combo-preview-strip" aria-label="Vista previa del combo">
            <div className="combo-preview-strip__item">
              <span className="combo-preview-strip__label">Figurita</span>
              <StoreImage
                src={customerImageUrl}
                alt=""
                width={120}
                height={120}
                className="combo-preview-strip__img object-top"
                sizes="120px"
              />
            </div>
            <div className="combo-preview-strip__item">
              <span className="combo-preview-strip__label">Stickers</span>
              {getStickerOption(comboStickerId) ? (
                <StoreImage
                  src={getStickerOption(comboStickerId)!.image}
                  alt=""
                  width={120}
                  height={120}
                  className="combo-preview-strip__img"
                  sizes="120px"
                />
              ) : null}
            </div>
            <div className="combo-preview-strip__item">
              <span className="combo-preview-strip__label">Poster</span>
              {getPosterOption(comboPosterId) ? (
                <StoreImage
                  src={getPosterOption(comboPosterId)!.image}
                  alt=""
                  width={120}
                  height={120}
                  className="combo-preview-strip__img"
                  sizes="120px"
                />
              ) : null}
            </div>
          </div>
        ) : null}

        <StoreGalleryPicker
          label="Elegí plancha de stickers"
          items={STICKER_SHEET_GALLERY}
          unitPrice={STORE_STICKER_PRICE_ARS}
          value={comboStickerId}
          onChange={(id) => setComboStickerId(id as ComboStickerId)}
        />

        <StoreLazySection>
          <StoreGalleryPicker
            label="Elegí poster"
            items={POSTER_GALLERY}
            unitPrice={STORE_POSTER_PRICE_ARS}
            value={comboPosterId}
            onChange={(id) => setComboPosterId(id as ComboPosterId)}
          />
        </StoreLazySection>

        <div className="store-combo-actions">
          <div className="quantity-selection">
            <label htmlFor="combo-qty" className="quantity-label">
              Cantidad
            </label>
            <div className="quantity-controls">
              <button
                type="button"
                className="quantity-btn"
                aria-label="Menos"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                −
              </button>
              <span className="quantity-value">{quantity}</span>
              <button
                type="button"
                className="quantity-btn"
                aria-label="Más"
                onClick={() => setQuantity(Math.min(99, quantity + 1))}
              >
                +
              </button>
            </div>
          </div>

          <div className="quantity-selection">
            <label htmlFor="combo-notes" className="quantity-label">
              Notas (opcional)
            </label>
            <textarea
              id="combo-notes"
              rows={2}
              value={lineNotes}
              onChange={(e) => setLineNotes(e.target.value)}
              className="store-textarea"
              placeholder="Tamaño, acabado…"
            />
          </div>

          <p className="summary-line" style={{ marginBottom: 12 }}>
            <span>Total esta línea</span>
            <span>
              {formatPriceARS(STORE_COMBO_PRICE_ARS)} × {quantity} = {formatPriceARS(linePreviewTotal)}
            </span>
          </p>

          <button
            type="button"
            onClick={addToCart}
            disabled={!canAddCombo}
            className="btn-primary hover-lift w-full disabled:cursor-not-allowed disabled:opacity-50"
            style={{ border: 'none', cursor: canAddCombo ? 'pointer' : 'not-allowed' }}
          >
            <Plus className="mr-2 inline h-5 w-5" aria-hidden />
            {canAddCombo ? 'Agregar combo al carrito' : 'Falta tu figurita'}
          </button>
        </div>
      </div>
    </section>
  )
}
