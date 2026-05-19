'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Sparkles, Layers, Maximize2, ArrowRight } from 'lucide-react'
import { STORE_CATALOG, STORE_COMBO_PRICE_ARS, formatPriceARS } from '@/lib/store/catalog'
import type { ComboPosterId, ComboStickerId } from '@/lib/store/gallery-assets'
import { POSTER_GALLERY, STICKER_SHEET_GALLERY } from '@/lib/store/gallery-assets'
import { StoreGalleryPicker } from '@/components/store/store-gallery-picker'
import { InteractiveTravelCard } from '@/components/store/interactive-figurita-card'

const MARQUEE =
  'COMBO FIGURITA + STICKERS + POSTER • MI FIGURITA • MERCADO PAGO • PLOT MUNDIAL STORE • '

const COMBO = STORE_CATALOG[0]

type StoreLandingProps = {
  cartItemCount: number
  comboStickerId: ComboStickerId
  comboPosterId: ComboPosterId
  onStickerChange: (id: ComboStickerId) => void
  onPosterChange: (id: ComboPosterId) => void
  canAddCombo: boolean
  onAddToCart: () => void
}

export function StoreLanding({
  cartItemCount,
  comboStickerId,
  comboPosterId,
  onStickerChange,
  onPosterChange,
  canAddCombo,
  onAddToCart,
}: StoreLandingProps) {
  const heroCardRef = useRef<HTMLDivElement>(null)

  function scrollToArmado() {
    document.getElementById('store-armado')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <>
      <div className="marquee-bar">
        <div className="marquee-container">
          <div className="marquee-content">{MARQUEE.repeat(2)}</div>
        </div>
      </div>

      <main className="hero-section">
        <div className="hero-content">
          <div className="season-badge">MUNDIAL 2026 // COMBO ÚNICO</div>
          <h1 className="hero-headline">
            TU COMBO,
            <br />
            <span className="hero-headline-highlight">FIGURITA + STICKERS + POSTER.</span>
          </h1>
          <p className="hero-subtext">
            La figurita no se vende sola: viene dentro del combo con la plancha de stickers y el poster que elijas.
            Creá tu figurita en Mi Figurita y armá el pedido acá.
          </p>
          <div className="cta-buttons">
            <button type="button" onClick={scrollToArmado} className="btn-primary hover-lift">
              ARMAR MI COMBO
            </button>
            <Link href="/figurita" className="btn-secondary hover-lift">
              MI FIGURITA
            </Link>
            {cartItemCount > 0 ? (
              <Link href="#store-cart" className="btn-secondary hover-lift">
                CARRITO ({cartItemCount})
              </Link>
            ) : null}
          </div>
          <div className="social-proof">
            <div className="avatar-stack">
              <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop" alt="" />
              <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop" alt="" />
              <img src="https://images.unsplash.com/photo-1552058544-f2b08422138a?w=100&h=100&fit=crop" alt="" />
            </div>
            <div>
              <div className="social-proof-title">+2k fans en Plot Mundial</div>
              <div className="social-proof-subtitle">Coleccionables e impresión oficial</div>
            </div>
          </div>
        </div>

        <div className="hero-visuals">
          <svg
            className="abstract-shape"
            width="600"
            height="600"
            viewBox="0 0 200 200"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden
          >
            <path
              fill="#EB671B"
              d="M44.7,-76.4C58.9,-69.2,71.8,-59.1,81.6,-46.6C91.4,-34.1,98.1,-19.2,95.8,-5.3C93.5,8.6,82.2,21.5,70.6,31.6C59,41.7,47.1,49,35.3,55.1C23.5,61.2,11.8,66.1,-0.6,67.1C-12.9,68.1,-25.8,65.2,-37.9,59.2C-50,53.2,-61.3,44.1,-70.5,32.6C-79.7,21.1,-86.8,7.2,-85.1,-6.1C-83.3,-19.4,-72.7,-32.1,-61.6,-41.8C-50.5,-51.5,-38.9,-58.2,-27.1,-66.9C-15.3,-75.6,-3.3,-86.3,10.2,-83.8C23.7,-81.3,30.5,-83.6,44.7,-76.4Z"
              transform="translate(100 100)"
            />
          </svg>
          <motion.div ref={heroCardRef} className="main-image-container main-image-container--interactive">
            <motion.div
              drag
              dragConstraints={heroCardRef}
              dragElastic={0.2}
              style={{ perspective: '1000px' }}
              className="hero-figurita-drag-host"
            >
              <InteractiveTravelCard alt="Figurita coleccionable" />
            </motion.div>
          </motion.div>
        </div>
      </main>

      <section className="trending-section combo-showcase-section" id="productos">
        <div className="container">
          <div className="trending-header">
            <h3>El combo Plot Mundial</h3>
            <Link href="#store-armado">Armar pedido</Link>
          </div>

          <article className="combo-showcase hover-lift">
            <div className="combo-showcase__media">
              <span className="combo-showcase__badge">Único producto</span>
              <img src={COMBO.image} alt="" className="combo-showcase__img" />
              <div className="combo-showcase__price-tag">{formatPriceARS(STORE_COMBO_PRICE_ARS)}</div>
            </div>

            <div className="combo-showcase__body">
              <p className="combo-showcase__eyebrow">Figurita + stickers + poster</p>
              <h4 className="combo-showcase__title">{COMBO.label}</h4>
              <p className="combo-showcase__lead">{COMBO.hint}</p>

              <ul className="combo-showcase__includes">
                <li>
                  <span className="combo-showcase__icon" aria-hidden>
                    <Sparkles size={20} />
                  </span>
                  <span>
                    <strong>Tu figurita</strong>
                    <span className="combo-showcase__item-hint">Creala en Mi Figurita · PNG listo para imprenta</span>
                  </span>
                </li>
                <li>
                  <span className="combo-showcase__icon" aria-hidden>
                    <Layers size={20} />
                  </span>
                  <span>
                    <strong>Plancha de stickers</strong>
                    <span className="combo-showcase__item-hint">Elegís el diseño al armar el pedido</span>
                  </span>
                </li>
                <li>
                  <span className="combo-showcase__icon combo-showcase__icon--poster" aria-hidden>
                    <Maximize2 size={20} />
                  </span>
                  <span>
                    <strong>Poster</strong>
                    <span className="combo-showcase__item-hint">Elegís formato y variante en el checkout</span>
                  </span>
                </li>
              </ul>

              <div className="combo-showcase__footer">
                <button type="button" onClick={scrollToArmado} className="btn-primary hover-lift combo-showcase__cta">
                  ARMAR MI COMBO
                  <ArrowRight className="ml-2 inline h-5 w-5" aria-hidden />
                </button>
                <Link href="/figurita" className="combo-showcase__link">
                  Todavía no tengo mi figurita →
                </Link>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section className="trending-section store-galleries-section" id="galerias">
        <div className="container">
          <div className="trending-header">
            <h3>Galerías</h3>
            <Link href="#store-armado">Ir al armado</Link>
          </div>
          <p className="store-galleries-intro">
            Elegí la plancha de stickers y el poster para tu combo. Tu figurita personalizada se suma desde Mi
            Figurita.
          </p>

          <StoreGalleryPicker
            label="Planchas de stickers en vinilo"
            items={STICKER_SHEET_GALLERY}
            value={comboStickerId}
            onChange={(id) => onStickerChange(id as ComboStickerId)}
          />

          <StoreGalleryPicker
            label="Posters"
            items={POSTER_GALLERY}
            value={comboPosterId}
            onChange={(id) => onPosterChange(id as ComboPosterId)}
            onAddToCart={onAddToCart}
            addDisabled={!canAddCombo}
            addLabel={
              canAddCombo
                ? `Agregar combo al carrito · ${formatPriceARS(STORE_COMBO_PRICE_ARS)}`
                : 'Creá tu figurita en Mi Figurita primero'
            }
          />
        </div>
      </section>
    </>
  )
}
