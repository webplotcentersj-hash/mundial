/** Mensajes claros en español para errores de Supabase Auth. */
export function mapAuthErrorMessage(raw: string | undefined | null): string {
  const msg = (raw ?? '').trim()
  const lower = msg.toLowerCase()

  if (!msg) return 'No se pudo completar la operación. Probá de nuevo.'

  if (
    lower.includes('invalid login credentials') ||
    lower.includes('invalid credentials') ||
    lower.includes('invalid email or password')
  ) {
    return 'Email o contraseña incorrectos.'
  }

  if (lower.includes('user already registered') || lower.includes('already been registered')) {
    return 'Ese email ya tiene cuenta. Probá iniciar sesión.'
  }

  if (lower.includes('password')) {
    return 'Revisá la contraseña e intentá de nuevo.'
  }

  if (lower.includes('valid email') || lower.includes('invalid email')) {
    return 'Ingresá un email válido.'
  }

  if (lower.includes('signup disabled')) {
    return 'El registro está deshabilitado temporalmente. Contactá al administrador.'
  }

  return msg
}

export function isEmailNotConfirmedError(raw: string | undefined | null): boolean {
  const lower = (raw ?? '').toLowerCase()
  return lower.includes('email not confirmed') || lower.includes('email_not_confirmed')
}
