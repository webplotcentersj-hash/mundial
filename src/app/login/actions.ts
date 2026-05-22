'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { ensureUserProfile } from '@/lib/ensureUserProfile'
import { confirmUserEmailByAddress } from '@/lib/auth/confirm-user'
import { isEmailNotConfirmedError, mapAuthErrorMessage } from '@/lib/auth/messages'

function readCredentials(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const password = String(formData.get('password') ?? '')
  return { email, password }
}

function loginRedirect(message: string, extra?: Record<string, string>) {
  const params = new URLSearchParams({ message })
  if (extra) {
    for (const [key, value] of Object.entries(extra)) {
      if (value) params.set(key, value)
    }
  }
  redirect(`/login?${params.toString()}`)
}

async function finishAuthSession(
  supabase: Awaited<ReturnType<typeof createClient>>,
  email: string,
  password: string,
) {
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    loginRedirect(mapAuthErrorMessage(error.message))
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (user) {
    const pr = await ensureUserProfile(supabase, user)
    if (pr.error) console.error('ensureUserProfile:', pr.error)
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function login(formData: FormData) {
  const { email, password } = readCredentials(formData)

  if (!email || !password) {
    loginRedirect('Completá email y contraseña para ingresar.')
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error && isEmailNotConfirmedError(error.message)) {
    const confirmed = await confirmUserEmailByAddress(email)
    if (confirmed) {
      await finishAuthSession(supabase, email, password)
    }
  }

  if (error) {
    loginRedirect(mapAuthErrorMessage(error.message))
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (user) {
    const pr = await ensureUserProfile(supabase, user)
    if (pr.error) console.error('ensureUserProfile after login:', pr.error)
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const { email, password } = readCredentials(formData)
  const username = String(formData.get('username') ?? '').trim()

  if (!email || !password) {
    loginRedirect('Completá email y contraseña para registrarte.', { mode: 'register' })
  }

  if (!username) {
    loginRedirect('Elegí un nombre de usuario.', { mode: 'register' })
  }

  const supabase = await createClient()

  try {
    const admin = createAdminClient()
    const { error: createErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { username },
    })

    if (createErr) {
      const lower = createErr.message.toLowerCase()
      if (lower.includes('already') || lower.includes('registered')) {
        await confirmUserEmailByAddress(email)
        await finishAuthSession(supabase, email, password)
      }
      loginRedirect(mapAuthErrorMessage(createErr.message), { mode: 'register' })
    }
  } catch (e) {
    console.error('signup createUser:', e)
    loginRedirect('No se pudo crear la cuenta. Probá de nuevo.', { mode: 'register' })
  }

  await finishAuthSession(supabase, email, password)
}

export async function signout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}
