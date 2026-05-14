/** Bucket de Storage para arte de pedidos del Store (figuritas, adjuntos admin). */
export const STORE_PRINTS_BUCKET = 'store-prints' as const

const SESSION_FIGURITA_IMAGE_KEY = 'plotmundial_store_figurita_public_url'

export function readFiguritaStoreImageFromSession(): string | null {
  if (typeof window === 'undefined') return null
  try {
    return sessionStorage.getItem(SESSION_FIGURITA_IMAGE_KEY) || null
  } catch {
    return null
  }
}

export function clearFiguritaStoreImageFromSession() {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.removeItem(SESSION_FIGURITA_IMAGE_KEY)
  } catch {
    /* ignore */
  }
}

export function writeFiguritaStoreImageToSession(publicUrl: string) {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(SESSION_FIGURITA_IMAGE_KEY, publicUrl)
  } catch {
    /* ignore */
  }
}
