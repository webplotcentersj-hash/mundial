/** YYYY-MM-DD on the user's local calendar (avoids UTC day shift from `toISOString`). */
export function toLocalDateKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function parseToLocalDateKey(isoOrTimestamp: string): string {
  return toLocalDateKey(new Date(isoOrTimestamp))
}
