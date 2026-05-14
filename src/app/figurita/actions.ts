'use server'

import { GoogleGenAI } from '@google/genai'
import type { FiguritaAiTheme, FiguritaStripeStyle } from '@/lib/figuritaTheme'

const STRIPES: FiguritaStripeStyle[] = ['vertical', 'horizontal', 'sash', 'none', 'hoops']

/** Limpia pegados desde Vercel / .env (comillas, saltos de línea, BOM). */
function sanitizeApiKey(raw: string): string {
  let s = raw.trim().replace(/^\uFEFF/, '')
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    s = s.slice(1, -1).trim()
  }
  return s.replace(/\s+/g, '')
}

/** Clave de Google AI Studio: varios nombres usados en la doc y en Vercel. */
function resolveGenaiApiKey(): string | undefined {
  const keys = [
    process.env.GEMINI_API_KEY,
    process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    process.env.GOOGLE_GENAI_API_KEY,
    process.env.GOOGLE_AI_API_KEY,
    process.env.GOOGLE_API_KEY,
  ]
  for (const k of keys) {
    const v = k?.trim()
    if (v) return sanitizeApiKey(v)
  }
  return undefined
}

function formatGenaiError(e: unknown): string {
  if (e instanceof Error) {
    const m = e.message
    if (/API key not valid|invalid api key|API_KEY_INVALID|401|UNAUTHENTICATED/i.test(m)) {
      return [
        'La API key no es válida o está revocada.',
        'Creá una nueva en Google AI Studio (Get API key) y guardala como GEMINI_API_KEY en Vercel → sin comillas ni espacios.',
        'https://aistudio.google.com/apikey',
      ].join(' ')
    }
    if (/403|PERMISSION_DENIED|permission|billing|enabled|consumer/i.test(m) && !/API key not valid/i.test(m)) {
      return [
        'Google rechazó la petición (permisos, facturación o API no habilitada para este proyecto).',
        'En Google AI Studio verificá que la Generative Language API esté habilitada y que la key sea de la misma cuenta.',
        `Detalle: ${m.slice(0, 200)}`,
      ].join(' ')
    }
    if (/not found|404|NOT_FOUND|does not exist|unsupported/i.test(m)) {
      return `Modelo o endpoint: ${m.slice(0, 220)}`
    }
    return m.slice(0, 280)
  }
  return String(e).slice(0, 280)
}

function stripModelId(id: string): string {
  const t = id.trim()
  return t.startsWith('models/') ? t.slice('models/'.length) : t
}

function isInvalidApiKeyError(e: unknown): boolean {
  const m = e instanceof Error ? e.message : String(e)
  return /API key not valid|invalid api key|API_KEY_INVALID|401|UNAUTHENTICATED/i.test(m)
}

function isLikelyWrongModelError(e: unknown): boolean {
  const m = e instanceof Error ? e.message : String(e)
  return /404|NOT_FOUND|not found|is not found|Unsupported|unsupported|model/i.test(m)
}

export type GenerateFiguritaThemeResult =
  | { ok: true; theme: FiguritaAiTheme }
  | { ok: false; error: string }

function isHexColor(s: string): boolean {
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(s.trim())
}

/** Evita inyección en style.background: solo gradientes y colores seguros. */
function isSafeBackgroundCss(css: string): boolean {
  const t = css.trim()
  if (t.length > 900) return false
  const lower = t.toLowerCase()
  if (/url\s*\(|expression\s*\(|@import|javascript:|behavior:|moz-binding/i.test(lower)) return false
  return /^(linear-gradient|radial-gradient)\(/i.test(t)
}

function parseJsonObject(raw: string): unknown {
  let s = raw.trim()
  const fence = /^```(?:json)?\s*([\s\S]*?)```$/im.exec(s)
  if (fence) s = fence[1].trim()
  const start = s.indexOf('{')
  const end = s.lastIndexOf('}')
  if (start === -1 || end === -1 || end <= start) throw new Error('JSON no encontrado')
  return JSON.parse(s.slice(start, end + 1)) as unknown
}

function normalizeTheme(o: Record<string, unknown>): FiguritaAiTheme | null {
  const backgroundCss = String(o.backgroundCss ?? '').trim()
  const jerseyPrimary = String(o.jerseyPrimary ?? '').trim()
  const jerseySecondary = String(o.jerseySecondary ?? '').trim()
  const jerseyAccent = String(o.jerseyAccent ?? '').trim()
  const stripeRaw = String(o.stripeStyle ?? 'vertical').trim().toLowerCase()
  const stripeStyle = STRIPES.includes(stripeRaw as FiguritaStripeStyle)
    ? (stripeRaw as FiguritaStripeStyle)
    : 'vertical'

  if (!isSafeBackgroundCss(backgroundCss)) return null
  if (!isHexColor(jerseyPrimary) || !isHexColor(jerseySecondary) || !isHexColor(jerseyAccent)) return null

  return {
    backgroundCss,
    jerseyPrimary,
    jerseySecondary,
    jerseyAccent,
    stripeStyle,
  }
}

/**
 * Llama a Gemini (solo servidor). SDK: @google/genai — https://ai.google.dev/gemini-api/docs/libraries
 * Clave: GEMINI_API_KEY (recomendado) u otras (resolveGenaiApiKey).
 * Modelo: GEMINI_MODEL opcional; si falla, se prueba gemini-3-flash-preview → 2.5 → 2.0.
 */
export async function generateFiguritaTheme(
  countryName: string,
  countryCode: string
): Promise<GenerateFiguritaThemeResult> {
  const apiKey = resolveGenaiApiKey()
  if (!apiKey) {
    return {
      ok: false,
      error:
        'Falta clave de API. En .env.local o Vercel definí GEMINI_API_KEY o GOOGLE_GENERATIVE_AI_API_KEY (sin prefijo NEXT_PUBLIC). Reiniciá el servidor tras guardar.',
    }
  }

  const envModel = process.env.GEMINI_MODEL?.trim()
  const stripped = envModel ? stripModelId(envModel) : null
  const modelChain = stripped
    ? [stripped, 'gemini-2.5-flash', 'gemini-2.0-flash']
    : ['gemini-3-flash-preview', 'gemini-2.5-flash', 'gemini-2.0-flash']

  const prompt = `Sos director de arte de figuritas coleccionables del Mundial 2026.
Equipo: "${countryName}" (código bandera típico: ${countryCode}).
Inspirate en la tradición cromática del fútbol de esa selección (no copies escudos ni marcas registradas; solo colores y estilo general).

Respondé UN solo objeto JSON (objeto raíz, sin markdown). Claves exactas:
- "backgroundCss": string, un único valor CSS válido para la propiedad CSS "background" (solo linear-gradient o radial-gradient; tonos nocturnos de estadio, elegantes).
- "jerseyPrimary", "jerseySecondary", "jerseyAccent": strings hex en formato #RRGGBB.
- "stripeStyle": uno de: "vertical", "horizontal", "sash", "none", "hoops".

Ejemplo de forma (no copies valores): {"backgroundCss":"linear-gradient(160deg,#0a1628,#1a2d4a,#0b1220)","jerseyPrimary":"#75aadb","jerseySecondary":"#ffffff","jerseyAccent":"#fcb514","stripeStyle":"vertical"}`

  try {
    const ai = new GoogleGenAI({ apiKey })

    let response: { text?: string } | undefined
    let lastError: unknown

    for (let mi = 0; mi < modelChain.length; mi++) {
      const model = modelChain[mi]!
      try {
        try {
          response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
              responseMimeType: 'application/json',
              temperature: 0.45,
            },
          })
        } catch {
          response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: { temperature: 0.45 },
          })
        }
        break
      } catch (e) {
        lastError = e
        if (isInvalidApiKeyError(e)) {
          return { ok: false, error: formatGenaiError(e) }
        }
        if (mi < modelChain.length - 1 && isLikelyWrongModelError(e)) {
          continue
        }
        return { ok: false, error: formatGenaiError(e) }
      }
    }

    if (!response) {
      return { ok: false, error: formatGenaiError(lastError) }
    }

    const text = response.text?.trim()
    if (!text) {
      return {
        ok: false,
        error:
          'El modelo no devolvió contenido. Si definiste GEMINI_MODEL, probá gemini-2.0-flash o vaciá la variable para usar el fallback automático.',
      }
    }
    let parsed: Record<string, unknown>
    try {
      parsed = JSON.parse(text) as Record<string, unknown>
    } catch {
      try {
        parsed = parseJsonObject(text) as Record<string, unknown>
      } catch {
        return { ok: false, error: 'El modelo no devolvió JSON válido.' }
      }
    }
    const theme = normalizeTheme(parsed)
    if (!theme) {
      return {
        ok: false,
        error:
          'La respuesta no pasó validación (gradiente o colores hex). Probá de nuevo o usá GEMINI_MODEL=gemini-2.0-flash.',
      }
    }
    return { ok: true, theme }
  } catch (e) {
    console.error('generateFiguritaTheme', e)
    return { ok: false, error: formatGenaiError(e) }
  }
}
