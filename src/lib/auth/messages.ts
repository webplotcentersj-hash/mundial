/** Mensajes claros en español para errores de Supabase Auth. */
export function mapAuthErrorMessage(raw: string | undefined | null): string {
  const msg = (raw ?? '').trim()
  const lower = msg.toLowerCase()

  if (!msg) return 'No se pudo completar la operación. Probá de nuevo.'

  if (lower.includes('rate limit') && lower.includes('email')) {
    return 'Enviamos demasiados mails de confirmación en poco tiempo. Esperá unos minutos y revisá tu bandeja (y spam) antes de volver a intentar.'
  }

  if (lower.includes('email not confirmed') || lower.includes('email_not_confirmed')) {
    return 'Tu cuenta existe pero el email todavía no está confirmado. Abrí el enlace del mail que te enviamos o pedí uno nuevo abajo.'
  }

  if (
    lower.includes('invalid login credentials') ||
    lower.includes('invalid credentials') ||
    lower.includes('invalid email or password')
  ) {
    return 'Email o contraseña incorrectos. Si te registraste recién, confirmá el mail antes de ingresar.'
  }

  if (lower.includes('user already registered') || lower.includes('already been registered')) {
    return 'Ese email ya tiene cuenta. Iniciá sesión o confirmá el mail si recién te registraste.'
  }

  if (lower.includes('password') && lower.includes('least')) {
    return 'La contraseña es muy corta. Usá al menos 6 caracteres.'
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

export function isEmailRateLimitError(raw: string | undefined | null): boolean {
  const lower = (raw ?? '').toLowerCase()
  return lower.includes('rate limit') && lower.includes('email')
}
