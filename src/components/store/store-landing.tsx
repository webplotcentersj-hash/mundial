'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { STORE_CATALOG, STORE_COMBO_PRICE_ARS, formatPriceARS } from '@/lib/store/catalog'
import { InteractiveTravelCard } from '@/components/store/interactive-figurita-card'

const MARQUEE =
  'COMBO FIGURITA + STICKERS + POSTER • MI FIGURITA • MERCADO PAGO • PLOT MUNDIAL STORE • '

const COMBO = STORE_CATALOG[0]

type StoreLandingProps = {
  cartItemCount: number
}

export function StoreLanding({ cartItemCount }: StoreLandingProps) {
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

      <section className="trending-section" id="productos">
        <div className="container">
          <div className="trending-header">
            <h3>El combo Plot Mundial</h3>
            <Link href="#store-armado">Armar pedido</Link>
          </div>
          <div className="product-grid" style={{ maxWidth: 420, margin: '0 auto' }}>
            <button
              type="button"
              onClick={scrollToArmado}
              className="product-card hover-lift"
              style={{ borderColor: '#5d3fd3', boxShadow: '4px 4px 0 #111', outline: '2px solid #5d3fd3' }}
            >
              <div className="product-image">
                <span className="product-badge sale">ÚNICO PRODUCTO</span>
                <img src={COMBO.image} alt={COMBO.label} />
              </div>
              <h4>{COMBO.label}</h4>
              <p>{COMBO.hint}</p>
              <ul className="mt-3 space-y-1 text-left text-sm text-[#555]">
                {COMBO.includes.map((line) => (
                  <li key={line}>• {line}</li>
                ))}
              </ul>
              <p className="cart-item-price" style={{ marginTop: 12 }}>
                {formatPriceARS(STORE_COMBO_PRICE_ARS)}
              </p>
            </button>
          </div>
        </div>
      </section>
    </>
  )
}
