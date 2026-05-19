'use server'

import { Preference } from 'mercadopago'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { ensureUserProfile } from '@/lib/ensureUserProfile'
import type { PrintProductType } from '@/lib/store/catalog'
import {
  buildOrderNotesForLine,
  getCartLineLabel,
  getCartTotal,
  getUnitPrice,
  validateStoreCartLine,
  type StoreCartLineInput,
} from '@/lib/store/catalog'
import {
  getAppBaseUrl,
  getMercadoPagoClient,
  getMercadoPagoSetupStatus,
  isMercadoPagoConfigured,
  pickCheckoutInitPoint,
} from '@/lib/mercadopago/config'

export type CartLineInput = StoreCartLineInput

export async function createMercadoPagoCheckoutFromCart(input: {
  lines: CartLineInput[]
  contact_name: string
  contact_email: string
  contact_phone?: string
}): Promise<
  | { success: true; initPoint: string; checkoutId: string }
  | { error: string }
> {
  const setup = getMercadoPagoSetupStatus()
  if (!setup.ready) {
    return {
      error: `Mercado Pago no está listo. Faltan: ${setup.missing.join(', ')}. Ver .env.example y ejecutá: node scripts/check-mp-config.mjs`,
    }
  }

  if (!input.lines?.length) {
    return { error: 'El carrito está vacío' }
  }
  if (input.lines.length > 25) {
    return { error: 'Máximo 25 ítems por envío' }
  }

  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Tenés que iniciar sesión para pagar en el Store' }
  }

  const profileCheck = await ensureUserProfile(supabase, user)
  if (profileCheck.error) {
    return { error: profileCheck.error }
  }

  const name = input.contact_name.trim()
  const email = input.contact_email.trim()
  if (name.length < 2) return { error: 'Indicá un nombre de contacto válido' }
  if (email.length < 5 || !email.includes('@')) {
    return { error: 'Indicá un email de contacto válido' }
  }

  const totalArs = getCartTotal(input.lines)
  if (totalArs < 1) {
    return { error: 'El total del carrito es inválido' }
  }

  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '')
  const imagePrefix = baseUrl ? `${baseUrl}/storage/v1/object/public/store-prints/` : null

  const { data: checkoutRow, error: checkoutInsertErr } = await supabase
    .from('store_checkouts')
    .insert({
      user_id: user.id,
      total_ars: totalArs,
      contact_name: name,
      contact_email: email,
      contact_phone: input.contact_phone?.trim() || null,
      payment_status: 'pending',
    })
    .select('id')
    .single()

  if (checkoutInsertErr || !checkoutRow) {
    console.error('store_checkouts insert:', checkoutInsertErr)
    return {
      error:
        'No se pudo iniciar el pago. ¿Ejecutaste la migración store_checkouts en Supabase?',
    }
  }

  const checkoutId = checkoutRow.id as string
  const orderRows: {
    user_id: string
    checkout_id: string
    product_type: PrintProductType
    quantity: number
    notes: string | null
    contact_name: string
    contact_email: string
    contact_phone: string | null
    status: 'awaiting_payment'
    customer_image_url: string | null
  }[] = []

  for (const line of input.lines) {
    const check = validateStoreCartLine(line)
    if (!check.ok) return { error: check.error }
    const qty = Math.min(99, Math.max(1, Math.floor(Number(line.quantity)) || 1))
    const orderNotes = buildOrderNotesForLine(line)
    let customerImage: string | null = null
    if (line.product_type === 'combo') {
      const u = line.customer_image_url!.trim()
      if (!imagePrefix || !u.startsWith(imagePrefix) || u.length > 2048) {
        return { error: 'Hay una imagen adjunta inválida. Volvé a cargar desde Mi Figurita.' }
      }
      customerImage = u
    }
    orderRows.push({
      user_id: user.id,
      checkout_id: checkoutId,
      product_type: line.product_type,
      quantity: qty,
      notes: orderNotes,
      contact_name: name,
      contact_email: email,
      contact_phone: input.contact_phone?.trim() || null,
      status: 'awaiting_payment',
      customer_image_url: customerImage,
    })
  }

  const { error: ordersErr } = await supabase.from('print_orders').insert(orderRows)
  if (ordersErr) {
    console.error('print_orders insert (checkout):', ordersErr)
    await supabase.from('store_checkouts').delete().eq('id', checkoutId)
    return { error: 'No se pudieron registrar los ítems del pedido.' }
  }

  const appBase = getAppBaseUrl()
  const items = input.lines.map((line, index) => {
    const check = validateStoreCartLine(line)
    if (!check.ok) throw new Error(check.error)
    const qty = Math.min(99, Math.max(1, Math.floor(Number(line.quantity)) || 1))
    const unit = getUnitPrice(line.product_type)
    return {
      id: `${line.product_type}-${index}`,
      title: getCartLineLabel(line),
      description: buildOrderNotesForLine(line).slice(0, 256),
      quantity: qty,
      unit_price: unit,
      currency_id: 'ARS',
    }
  })

  try {
    const mp = getMercadoPagoClient()
    const preferenceApi = new Preference(mp)
    const preference = await preferenceApi.create({
      body: {
        items,
        payer: {
          name: name.split(' ')[0] || name,
          surname: name.split(' ').slice(1).join(' ') || '-',
          email,
        },
        external_reference: checkoutId,
        back_urls: {
          success: `${appBase}/store/pago/exito`,
          failure: `${appBase}/store/pago/error`,
          pending: `${appBase}/store/pago/pendiente`,
        },
        auto_return: 'approved',
        notification_url: `${appBase}/api/mercadopago/webhook`,
        statement_descriptor: 'PLOT MUNDIAL',
      },
    })

    const preferenceId = preference.id
    const initPoint = pickCheckoutInitPoint(preference)

    if (!preferenceId || !initPoint) {
      return { error: 'Mercado Pago no devolvió URL de pago.' }
    }

    await supabase
      .from('store_checkouts')
      .update({ mp_preference_id: preferenceId })
      .eq('id', checkoutId)

    revalidatePath('/store')
    revalidatePath('/admin')

    return { success: true, initPoint, checkoutId }
  } catch (e) {
    console.error('Mercado Pago preference:', e)
    await supabase.from('print_orders').delete().eq('checkout_id', checkoutId)
    await supabase.from('store_checkouts').delete().eq('id', checkoutId)
    return {
      error:
        e instanceof Error
          ? `No se pudo crear el pago: ${e.message}`
          : 'No se pudo conectar con Mercado Pago.',
    }
  }
}

export async function isStoreMercadoPagoEnabled(): Promise<boolean> {
  return isMercadoPagoConfigured()
}
