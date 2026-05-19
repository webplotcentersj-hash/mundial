import type { ComboPosterId, ComboStickerId } from '@/lib/store/gallery-assets'
import type { PrintProductType } from '@/lib/store/catalog'

export type StoreCartLine =
  | {
      id: string
      product_type: 'combo'
      quantity: number
      combo_sticker_id: ComboStickerId
      combo_poster_id: ComboPosterId
      notes: string
      customer_image_url: string
    }
  | {
      id: string
      product_type: 'poster'
      quantity: number
      variant_id: ComboPosterId
      notes: string
      customer_image_url: null
    }
  | {
      id: string
      product_type: 'sticker'
      quantity: number
      variant_id: ComboStickerId
      notes: string
      customer_image_url: null
    }

export type StoreCartLineInput = {
  product_type: PrintProductType
  quantity: number
  combo_sticker_id?: string
  combo_poster_id?: string
  variant_id?: string
  notes?: string
  customer_image_url?: string | null
}
