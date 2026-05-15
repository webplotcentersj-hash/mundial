'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import type { PrintProductType } from '@/lib/actions'
import { InteractiveTravelCard } from '@/components/store/interactive-figurita-card'

const MARQUEE =
  'ENVÍO A COORDINAR • FIGURITAS DESDE MI FIGURITA • IMPRESIÓN PREMIUM • PLOT MUNDIAL STORE • SIN PAGO ONLINE • '

export const STORE_CATALOG: {
  type: PrintProductType
  label: string
  hint: string
  badge?: 'new' | 'sale'
  image: string
}[] = [
  {
    type: 'figurita',
    label: 'Figurita',
    hint: 'Carta coleccionable · papel premium',
    badge: 'new',
    image:
      'https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  },
  {
    type: 'sticker',
    label: 'Stickers',
    hint: 'Hoja troquelada · vinilo o mate',
    image:
      'https://images.unsplash.com/photo-1560769629-975ec94e6a86?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  },
  {
    type: 'poster',
    label: 'Poster',
    hint: 'Gran formato · para el living',
    badge: 'sale',
    image:
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
  },
]

type StoreLandingProps = {
  cartItemCount: number
  selectedProduct: PrintProductType
  onSelectProduct: (type: PrintProductType) => void
}

export function StoreLanding({ cartItemCount, selectedProduct, onSelectProduct }: StoreLandingProps) {
  const heroCardRef = useRef<HTMLDivElement>(null)

  function scrollToArmado() {
    document.getElementById('store-armado')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function handleProductClick(type: PrintProductType) {
    onSelectProduct(type)
    scrollToArmado()
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
          <div className="season-badge">MUNDIAL 2026 // IMPRESIÓN</div>
          <h1 className="hero-headline">
            TU PEDIDO,
            <br />
            CON <span className="hero-headline-highlight">ONDA DE ESTADIO.</span>
          </h1>
          <p className="hero-subtext">
            Figuritas, stickers y posters con calidad de colección. Si venís desde Mi Figurita, tu PNG en alta
            resolución viaja con el pedido. Armá el carrito y mandá todo junto.
          </p>
          <div className="cta-buttons">
            <button
              type="button"
              onClick={() => document.getElementById('productos')?.scrollIntoView({ behavior: 'smooth' })}
              className="btn-primary hover-lift"
            >
              VER PRODUCTOS
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
          <svg className="abstract-shape" width="600" height="600" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-hidden>
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
              <InteractiveTravelCard alt="Figurita coleccionable Lionel Messi" />
            </motion.div>
          </motion.div>
          <svg
            className="decorative-star"
            width="80"
            height="80"
            viewBox="0 0 24 24"
            fill="#ccff00"
            stroke="#000"
            strokeWidth="2"
            aria-hidden
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </div>
      </main>

      <section className="trending-section" id="productos">
        <div className="container">
          <div className="trending-header">
            <h3>Elegí tu producto</h3>
            <Link href="#store-armado">Ir al pedido</Link>
          </div>
          <div className="product-grid">
            {STORE_CATALOG.map((item) => {
              const selected = selectedProduct === item.type
              return (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => handleProductClick(item.type)}
                  className="product-card hover-lift"
                  style={
                    selected
                      ? { borderColor: '#5d3fd3', boxShadow: '4px 4px 0 #111', outline: '2px solid #5d3fd3' }
                      : undefined
                  }
                >
                  <div className="product-image">
                    {item.badge === 'new' && <span className="product-badge new">NUEVO</span>}
                    {item.badge === 'sale' && <span className="product-badge sale">POPULAR</span>}
                    <img src={item.image} alt={item.label} />
                  </div>
                  <h4>{item.label}</h4>
                  <p>{item.hint}</p>
                </button>
              )
            })}
          </div>
        </div>
      </section>
    </>
  )
}
