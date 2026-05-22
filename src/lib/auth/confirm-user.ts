import { createAdminClient } from '@/lib/supabase/admin'

/** Marca el email como confirmado (cuentas legacy o registro sin mail). */
export async function confirmUserEmailByAddress(email: string): Promise<boolean> {
  try {
    const admin = createAdminClient()
    const normalized = email.trim().toLowerCase()

    for (let page = 1; page <= 10; page++) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 })
      if (error) {
        console.error('confirmUserEmailByAddress listUsers:', error.message)
        return false
      }

      const match = data.users.find((u) => u.email?.toLowerCase() === normalized)
      if (match) {
        const { error: updErr } = await admin.auth.admin.updateUserById(match.id, {
          email_confirm: true,
        })
        if (updErr) {
          console.error('confirmUserEmailByAddress update:', updErr.message)
          return false
        }
        return true
      }

      if (data.users.length < 1000) break
    }
  } catch (e) {
    console.error('confirmUserEmailByAddress', e)
  }
  return false
}
