'use client'

import Image from 'next/image'
import { Check } from 'lucide-react'
import type { GalleryAsset } from '@/lib/store/gallery-assets'

type Props = {
  label: string
  items: readonly GalleryAsset[]
  value: string
  onChange: (id: string) => void
  onAddToCart?: () => void
  addDisabled?: boolean
  addLabel?: string
}

export function StoreGalleryPicker({
  label,
  items,
  value,
  onChange,
  onAddToCart,
  addDisabled,
  addLabel = 'Agregar combo al carrito',
}: Props) {
  const selected = items.find((i) => i.id === value)

  return (
    <div className="store-gallery">
      <div className="store-gallery__header">
        <span className="size-label">{label}</span>
        {selected ? (
          <span className="store-gallery__selected-name">{selected.label}</span>
        ) : (
          <span className="store-gallery__selected-name store-gallery__selected-name--muted">
            Elegí una opción
          </span>
        )}
      </div>

      <div className="store-gallery__grid" role="listbox" aria-label={label}>
        {items.map((item) => {
          const isSelected = value === item.id
          return (
            <button
              key={item.id}
              type="button"
              role="option"
              aria-selected={isSelected}
              onClick={() => onChange(item.id)}
              className={`store-gallery__item hover-lift ${isSelected ? 'store-gallery__item--selected' : ''}`}
            >
              <div className="store-gallery__thumb">
                <Image
                  src={item.image}
                  alt={item.label}
                  width={280}
                  height={280}
                  className="store-gallery__img"
                  sizes="(max-width: 640px) 45vw, 180px"
                />
                {isSelected ? (
                  <span className="store-gallery__check" aria-hidden>
                    <Check className="h-4 w-4" strokeWidth={3} />
                  </span>
                ) : null}
              </div>
              <span className="store-gallery__caption">{item.label}</span>
            </button>
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
    </div>
  )
}
