/** Assets del Store — thumbs WebP para galería, full WebP para lightbox */

export type GalleryAsset = {
  id: string
  label: string
  /** Miniatura optimizada (~360px) */
  image: string
  /** Vista ampliada (~1200px) */
  imageFull: string
}

function sortByStoreNumber(a: string, b: string): number {
  const na = parseInt(a.replace(/\D/g, ''), 10) || 0
  const nb = parseInt(b.replace(/\D/g, ''), 10) || 0
  return na - nb
}

function galleryEntry(folder: 'Poster' | 'stiker', id: string, label: string): GalleryAsset {
  return {
    id,
    label,
    image: `/${folder}/thumbs/${id}.webp`,
    imageFull: `/${folder}/full/${id}.webp`,
  }
}

const STICKER_FILES = ['STORE-01', 'STORE-02', 'STORE-03', 'STORE-04', 'STORE-05'] as const

const POSTER_FILES = [
  'STORE-06',
  'STORE-07',
  'STORE-08',
  'STORE-09',
  'STORE-10',
  'STORE-11',
  'STORE-12',
  'STORE-13',
  'STORE-14',
  'STORE-15',
  'STORE-16',
  'STORE-17',
  'STORE-18',
  'STORE-19',
  'STORE-20',
  'STORE-21',
] as const

export const STICKER_SHEET_GALLERY = [...STICKER_FILES]
  .sort(sortByStoreNumber)
  .map((id) => galleryEntry('stiker', id, `Plancha ${id.replace('STORE-', '')}`))

export const POSTER_GALLERY = [...POSTER_FILES]
  .sort(sortByStoreNumber)
  .map((id) => galleryEntry('Poster', id, `Poster ${id.replace('STORE-', '')}`))

export type ComboStickerId = (typeof STICKER_FILES)[number]
export type ComboPosterId = (typeof POSTER_FILES)[number]

export const DEFAULT_COMBO_STICKER_ID: ComboStickerId = STICKER_FILES[0]
export const DEFAULT_COMBO_POSTER_ID: ComboPosterId = POSTER_FILES[0]

const STICKER_ID_SET = new Set<string>(STICKER_FILES)
const POSTER_ID_SET = new Set<string>(POSTER_FILES)

export function isComboStickerId(value: string): value is ComboStickerId {
  return STICKER_ID_SET.has(value)
}

export function isComboPosterId(value: string): value is ComboPosterId {
  return POSTER_ID_SET.has(value)
}

export function getStickerAsset(id: ComboStickerId | string) {
  return STICKER_SHEET_GALLERY.find((a) => a.id === id)
}

export function getPosterAsset(id: ComboPosterId | string) {
  return POSTER_GALLERY.find((a) => a.id === id)
}
