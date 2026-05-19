'use client'

import { useCallback, useEffect } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, ShoppingCart, X } from 'lucide-react'
import type { GalleryAsset } from '@/lib/store/gallery-assets'
import { formatPriceARS } from '@/lib/store/catalog'

type Props = {
  items: readonly GalleryAsset[]
  index: number | null
  unitPrice: number
  onClose: () => void
  onNavigate: (index: number) => void
  onBuyIndividual: (item: GalleryAsset) => void
  onSelectForCombo?: (item: GalleryAsset) => void
  selectedId?: string
}

export function StoreGalleryLightbox({
  items,
  index,
  unitPrice,
  onClose,
  onNavigate,
  onBuyIndividual,
  onSelectForCombo,
  selectedId,
}: Props) {
  const open = index !== null && items[index]
  const item = open ? items[index!] : null

  const goPrev = useCallback(() => {
    if (index === null || items.length === 0) return
    onNavigate((index - 1 + items.length) % items.length)
  }, [index, items.length, onNavigate])

  const goNext = useCallback(() => {
    if (index === null || items.length === 0) return
    onNavigate((index + 1) % items.length)
  }, [index, items.length, onNavigate])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === 'ArrowRight') goNext()
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose, goPrev, goNext])

  return (
    <AnimatePresence>
      {open && item ? (
        <motion.div
          className="store-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={item.label}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <button type="button" className="store-lightbox__close" onClick={onClose} aria-label="Cerrar">
            <X className="h-6 w-6" />
          </button>

          {items.length > 1 ? (
            <>
              <button type="button" className="store-lightbox__nav store-lightbox__nav--prev" onClick={(e) => { e.stopPropagation(); goPrev() }} aria-label="Anterior">
                <ChevronLeft className="h-8 w-8" />
              </button>
              <button type="button" className="store-lightbox__nav store-lightbox__nav--next" onClick={(e) => { e.stopPropagation(); goNext() }} aria-label="Siguiente">
                <ChevronRight className="h-8 w-8" />
              </button>
            </>
          ) : null}

          <div className="store-lightbox__panel" onClick={(e) => e.stopPropagation()}>
            <motion.div className="store-lightbox__image-wrap" key={item.id}>
              <Image
                src={item.image}
                alt={item.label}
                width={1200}
                height={1200}
                className="store-lightbox__image"
                sizes="(max-width: 900px) 90vw"
                priority
              />
            </motion.div>
            <div className="store-lightbox__meta">
              <h3 className="store-lightbox__title">{item.label}</h3>
              <p className="store-lightbox__price">{formatPriceARS(unitPrice)}</p>
              <div className="store-lightbox__actions">
                <button
                  type="button"
                  className="btn-primary hover-lift store-lightbox__btn"
                  style={{ border: 'none' }}
                  onClick={() => onBuyIndividual(item)}
                >
                  <ShoppingCart className="mr-2 h-5 w-5" aria-hidden />
                  Comprar · {formatPriceARS(unitPrice)}
                </button>
                {onSelectForCombo ? (
                  <button
                    type="button"
                    className={`btn-secondary hover-lift store-lightbox__btn ${selectedId === item.id ? 'store-lightbox__btn--selected' : ''}`}
                    style={{ border: 'none' }}
                    onClick={() => onSelectForCombo(item)}
                  >
                    {selectedId === item.id ? 'Elegido para el combo' : 'Usar en el combo'}
                  </button>
                ) : null}
              </div>
              {items.length > 1 ? (
                <p className="store-lightbox__counter">
                  {(index ?? 0) + 1} / {items.length}
                </p>
              ) : null}
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
