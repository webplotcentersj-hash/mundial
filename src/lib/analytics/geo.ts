/** Códigos ISO 3166-2 de provincias argentinas → nombre legible */
const AR_PROVINCE_BY_SUFFIX: Record<string, string> = {
  A: 'Salta',
  B: 'Buenos Aires',
  C: 'Ciudad Autónoma de Buenos Aires',
  D: 'San Luis',
  E: 'Entre Ríos',
  F: 'La Rioja',
  G: 'Santiago del Estero',
  H: 'Chaco',
  J: 'San Juan',
  K: 'Catamarca',
  L: 'La Pampa',
  M: 'Mendoza',
  N: 'Misiones',
  P: 'Formosa',
  Q: 'Neuquén',
  R: 'Río Negro',
  S: 'Santa Fe',
  T: 'Tucumán',
  U: 'Chubut',
  V: 'Tierra del Fuego',
  W: 'Corrientes',
  X: 'Córdoba',
  Y: 'Jujuy',
  Z: 'Santa Cruz',
}

const countryDisplay = new Intl.DisplayNames(['es-AR'], { type: 'region' })

export type GeoFromRequest = {
  country_code: string | null
  country_name: string | null
  region_code: string | null
  region_name: string | null
  city: string | null
}

function clipGeo(value: string | null | undefined, max = 120): string | null {
  if (!value?.trim()) return null
  return value.trim().slice(0, max)
}

function countryNameFromCode(code: string | null): string | null {
  if (!code) return null
  try {
    return countryDisplay.of(code.toUpperCase()) ?? code
  } catch {
    return code
  }
}

function resolveArgentinaRegion(regionRaw: string | null): string | null {
  if (!regionRaw) return null
  const upper = regionRaw.toUpperCase()
  if (AR_PROVINCE_BY_SUFFIX[upper]) return AR_PROVINCE_BY_SUFFIX[upper]
  const suffix = upper.startsWith('AR-') ? upper.slice(3) : upper
  return AR_PROVINCE_BY_SUFFIX[suffix] ?? regionRaw
}

export function resolveRegionLabel(countryCode: string | null, regionCode: string | null): string | null {
  if (!regionCode) return null
  if (countryCode?.toUpperCase() === 'AR') {
    return resolveArgentinaRegion(regionCode)
  }
  return regionCode
}

export function formatVisitLocation(input: {
  country_code?: string | null
  country_name?: string | null
  region_name?: string | null
  city?: string | null
}): string {
  const parts: string[] = []
  if (input.city) parts.push(input.city)
  if (input.region_name) parts.push(input.region_name)
  const country = input.country_name ?? input.country_code
  if (country) parts.push(country)
  return parts.length > 0 ? parts.join(', ') : 'Desconocido'
}

/** Lee geolocalización desde headers del edge (Vercel / Cloudflare). */
export function getGeoFromHeaders(headers: Headers): GeoFromRequest {
  const country_code = clipGeo(
    headers.get('x-vercel-ip-country') ??
      headers.get('cf-ipcountry') ??
      headers.get('x-country-code'),
    8,
  )?.toUpperCase() ?? null

  const regionRaw = clipGeo(
    headers.get('x-vercel-ip-country-region') ??
      headers.get('cf-region-code') ??
      headers.get('x-region-code'),
    16,
  )

  const city = clipGeo(
    headers.get('x-vercel-ip-city') ?? headers.get('cf-ipcity') ?? headers.get('x-city'),
    80,
  )

  const country_name = countryNameFromCode(country_code)
  const region_name = resolveRegionLabel(country_code, regionRaw)

  return {
    country_code,
    country_name,
    region_code: regionRaw,
    region_name,
    city,
  }
}

export function labelCountryForStats(countryCode: string | null, countryName: string | null): string {
  if (countryName) return countryName
  if (countryCode) return countryNameFromCode(countryCode) ?? countryCode
  return 'Desconocido'
}

export function labelRegionForStats(
  countryCode: string | null,
  countryName: string | null,
  regionName: string | null,
  city: string | null,
): string {
  const region = regionName ?? city
  if (!region) return 'Sin provincia / región'
  const country = labelCountryForStats(countryCode, countryName)
  if (countryCode?.toUpperCase() === 'AR') {
    return region
  }
  return `${region} (${country})`
}
