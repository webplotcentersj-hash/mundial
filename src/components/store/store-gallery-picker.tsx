'use client'

import { useState } from 'react'
import { Check, Maximize2, ShoppingCart } from 'lucide-react'
import type { GalleryAsset } from '@/lib/store/gallery-assets'
import { formatPriceARS } from '@/lib/store/catalog'
import { StoreGalleryLightbox } from '@/components/store/store-gallery-lightbox'
import { StoreImage } from '@/components/store/store-image'

type Props = {
  label: string
  items: readonly GalleryAsset[]
  unitPrice: number
  value?: string
  onChange?: (id: string) => void
  onBuyIndividual?: (item: GalleryAsset) => void
  onAddToCart?: () => void
  addDisabled?: boolean
  addLabel?: string
}

export function StoreGalleryPicker({
  label,
  items,
  unitPrice,
  value,
  onChange,
  onBuyIndividual,
  onAddToCart,
  addDisabled,
  addLabel = 'Agregar combo al carrito',
}: Props) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const selected = value ? items.find((i) => i.id === value) : undefined
  const selectionMode = Boolean(onChange && value !== undefined)

  function openLightbox(item: GalleryAsset) {
    const idx = items.findIndex((i) => i.id === item.id)
    if (idx >= 0) setLightboxIndex(idx)
  }

  return (
    <div className="store-gallery">
      <div className="store-gallery__header">
        <span className="size-label">{label}</span>
        {selectionMode ? (
          selected ? (
            <span className="store-gallery__selected-name">{selected.label}</span>
          ) : (
            <span className="store-gallery__selected-name store-gallery__selected-name--muted">
              Elegí una opción
            </span>
          )
        ) : (
          <span className="store-gallery__selected-name">{formatPriceARS(unitPrice)} c/u</span>
        )}
      </div>

      <div className="store-gallery__grid" role={selectionMode ? 'listbox' : undefined} aria-label={label}>
        {items.map((item, index) => {
          const isSelected = selectionMode && value === item.id
          const eager = index < 4
          return (
            <article
              key={item.id}
              className={`store-gallery__card ${isSelected ? 'store-gallery__card--selected' : ''}`}
            >
              <div className="store-gallery__thumb">
                <button
                  type="button"
                  className="store-gallery__thumb-btn"
                  onClick={() => openLightbox(item)}
                  aria-label={`Ver grande ${item.label}`}
                >
                  <StoreImage
                    src={item.image}
                    alt={item.label}
                    width={280}
                    height={280}
                    className="store-gallery__img"
                    sizes="(max-width: 640px) 45vw, 180px"
                    priority={eager}
                    fetchPriority={eager ? 'high' : 'low'}
                  />
                  <span className="store-gallery__zoom" aria-hidden>
                    <Maximize2 className="h-4 w-4" />
                  </span>
                </button>
                {isSelected ? (
                  <span className="store-gallery__check" aria-hidden>
                    <Check className="h-4 w-4" strokeWidth={3} />
                  </span>
                ) : null}
              </div>
              <div className="store-gallery__footer">
                <span className="store-gallery__caption">{item.label}</span>
                <div className="store-gallery__actions">
                  {selectionMode ? (
                    <button
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      className={`store-gallery__select-btn ${isSelected ? 'store-gallery__select-btn--on' : ''}`}
                      onClick={() => onChange!(item.id)}
                    >
                      {isSelected ? 'Elegido' : 'Elegir'}
                    </button>
                  ) : null}
                  {onBuyIndividual ? (
                    <button
                      type="button"
                      className="store-gallery__buy-btn"
                      onClick={() => onBuyIndividual(item)}
                    >
                      <ShoppingCart className="h-3.5 w-3.5" aria-hidden />
                      {formatPriceARS(unitPrice)}
                    </button>
                  ) : null}
                </div>
              </div>
            </article>
          )
        })}
      </div>

      {onAddToCart ? (
        <button
          type="button"
          onClick={onAddToCart}
          disabled={addDisabled}
          className="btn-primary hover-lift store-gallery__add-btn disabled:cursor-not-allowed disabled:opacity-50"
          style={{ border: 'none', cursor: addDisabled ? 'not-allowed' : 'pointer' }}
        >
          {addLabel}
        </button>
      ) : null}

      <StoreGalleryLightbox
        items={items}
        index={lightboxIndex}
        unitPrice={unitPrice}
        onClose={() => setLightboxIndex(null)}
        onNavigate={setLightboxIndex}
        onBuyIndividual={(item) => {
          onBuyIndividual?.(item)
          setLightboxIndex(null)
        }}
        onSelectForCombo={
          selectionMode
            ? (item) => {
                onChange!(item.id)
              }
            : undefined
        }
        selectedId={value}
      />
    </div>
  )
}
