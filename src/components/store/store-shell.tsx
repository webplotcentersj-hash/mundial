'use client'

import { StoreProvider } from '@/components/store/store-provider'
import { StoreSubnav } from '@/components/store/store-subnav'
import { StoreLoginGate } from '@/components/store/store-login-gate'
import { StoreCartBlock } from '@/components/store/store-cart-block'

export function StoreShell({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <StoreProvider>
      <StoreSubnav />
      <div className="store-subnav-spacer" aria-hidden />
      {children}
      <div className="store-panel">
        <StoreLoginGate>
          <StoreCartBlock />
        </StoreLoginGate>
      </div>
    </StoreProvider>
  )
}
