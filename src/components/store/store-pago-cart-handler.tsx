'use client'

import { useEffect } from 'react'
import {
  clearAllStoreCartData,
  dispatchStoreCartSync,
  restoreCartFromBackupIfEmpty,
} from '@/lib/store/cart-storage'

type Mode = 'success' | 'error' | 'pending'

export function StorePagoCartHandler({ mode }: { mode: Mode }) {
  useEffect(() => {
    if (mode === 'success') {
      clearAllStoreCartData()
      dispatchStoreCartSync()
      return
    }
    if (mode === 'error') {
      const restored = restoreCartFromBackupIfEmpty()
      if (restored) dispatchStoreCartSync()
    }
  }, [mode])

  return null
}
