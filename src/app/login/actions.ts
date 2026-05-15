'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ensureUserProfile } from '@/lib/ensureUserProfile'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect('/login?message=No se pudo autenticar usuario')
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const pr = await ensureUserProfile(supabase, user)
    if (pr.error) console.error('ensureUserProfile after login:', pr.error)
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const payload = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    options: {
      data: {
        username: formData.get('username') as string,
      },
    },
  }

  const { data, error } = await supabase.auth.signUp(payload)

  if (error) {
    redirect(
      `/login?message=${encodeURIComponent(error.message || 'No se pudo crear la cuenta')}`,
    )
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

export async function signout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}
