/**
 * Apodo tipo figurita a partir del nombre escrito (sin IA).
 * Usa la última palabra larga como “apellido” cuando hay varias.
 */
export function getPlayerApodo(rawName: string): string {
  const clean = rawName.trim()
  if (!clean || /^tu\s+nombre$/i.test(clean)) return 'EL CRACK'

  const tokens = clean
    .split(/\s+/)
    .map(t => t.replace(/[^a-zA-ZáéíóúüñÁÉÍÓÚÜÑ'-]/g, ''))
    .filter(t => t.length >= 2)

  if (!tokens.length) return 'EL CRACK'

  let core = tokens.length >= 2 ? tokens[tokens.length - 1]! : tokens[0]!
  if (core.length < 3 && tokens.length >= 2) core = tokens[tokens.length - 2]!

  const lastChar = core.slice(-1).toLowerCase()
  const article = lastChar === 'a' ? 'LA' : 'EL'
  const nick = core
    .toUpperCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .slice(0, 14)

  return `${article} ${nick}`
}
