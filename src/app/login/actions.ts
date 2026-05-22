'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ensureUserProfile } from '@/lib/ensureUserProfile'
import { getAppBaseUrl } from '@/lib/mercadopago/config'
import {
  isEmailNotConfirmedError,
  mapAuthErrorMessage,
} from '@/lib/auth/messages'

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

export async function login(formData: FormData) {
  const { email, password } = readCredentials(formData)

  if (!email || !password) {
    loginRedirect('Completá email y contraseña para ingresar.')
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    const friendly = mapAuthErrorMessage(error.message)
    if (isEmailNotConfirmedError(error.message)) {
      loginRedirect(friendly, { emailNotConfirmed: '1', email })
    }
    loginRedirect(friendly)
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

  const payload = {
    email,
    password,
    options: {
      emailRedirectTo: `${getAppBaseUrl()}/auth/callback?next=/confirmacion`,
      data: {
        username,
      },
    },
  }

  const { data, error } = await supabase.auth.signUp(payload)

  if (error) {
    loginRedirect(mapAuthErrorMessage(error.message), { mode: 'register' })
  }

  // Si "Confirmar email" está activo en Supabase, no hay sesión hasta confirmar.
  if (!data.session) {
    revalidatePath('/', 'layout')
    redirect('/login?pendingConfirmation=1')
  }

  const user = data.user
  if (user) {
    const pr = await ensureUserProfile(supabase, user)
    if (pr.error) console.error('ensureUserProfile after signup:', pr.error)
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function resendConfirmationEmail(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim().toLowerCase()

  if (!email) {
    loginRedirect('Ingresá tu email para reenviar la confirmación.', { emailNotConfirmed: '1' })
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
    options: {
      emailRedirectTo: `${getAppBaseUrl()}/auth/callback?next=/confirmacion`,
    },
  })

  if (error) {
    loginRedirect(mapAuthErrorMessage(error.message), {
      emailNotConfirmed: '1',
      email,
    })
  }

  redirect('/login?pendingConfirmation=1')
}

export async function signout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}
