'use client'

import Link from 'next/link'
import { Store, Loader2 } from 'lucide-react'
import { useStore } from '@/components/store/store-provider'

export function StoreLoginGate({ children }: { children: React.ReactNode }) {
  const { userReady, loggedIn } = useStore()

  if (!userReady) {
    return (
      <div className="store-panel">
        <div className="cart-empty">
          <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin" aria-hidden />
          <p>Cargando Store…</p>
        </div>
      </div>
    )
  }

  if (!loggedIn) {
    return (
      <div className="store-panel">
        <div className="store-login-box">
          <Store className="mx-auto mb-4 h-10 w-10" aria-hidden />
          <h2 className="cart-title" style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>
            Entrá al Store
          </h2>
          <p style={{ marginBottom: '1.5rem', color: '#444' }}>
            Necesitamos tu cuenta para asociar el pedido y poder contactarte cuando esté listo.
          </p>
          <Link href="/login?next=/store/combo" className="btn-primary hover-lift">
            INICIAR SESIÓN
          </Link>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
