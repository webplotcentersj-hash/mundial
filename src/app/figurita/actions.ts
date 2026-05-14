'use server'

import { GoogleGenAI } from '@google/genai'
import type { FiguritaAiTheme, FiguritaStripeStyle } from '@/lib/figuritaTheme'

const STRIPES: FiguritaStripeStyle[] = ['vertical', 'horizontal', 'sash', 'none', 'hoops']

/** Clave de Google AI Studio / GenAI: varios nombres que suele usar la gente y la doc. */
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
    if (v) return v
  }
  return undefined
}

function formatGenaiError(e: unknown): string {
  if (e instanceof Error) {
    const m = e.message
    if (/API key not valid|invalid api key|401|403/i.test(m)) {
      return 'Clave de API rechazada o sin acceso. Revisá que sea de Google AI Studio y que el modelo esté habilitado.'
    }
    if (/not found|404|does not exist|unsupported/i.test(m)) {
      return `Error del modelo o endpoint: ${m.slice(0, 220)}`
    }
    return m.slice(0, 280)
  }
  return String(e).slice(0, 280)
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
 * Llama a Gemini (solo servidor) y devuelve colores + gradiente para la figurita.
 * API key: GEMINI_API_KEY u otras (ver resolveGenaiApiKey). Opcional: GEMINI_MODEL (default gemini-2.0-flash).
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

  let model = (process.env.GEMINI_MODEL || 'gemini-2.0-flash').trim()
  if (model.startsWith('models/')) model = model.slice('models/'.length)

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
    let response
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
    const text = response.text?.trim()
    if (!text) {
      return { ok: false, error: 'El modelo no devolvió contenido. Probá otro GEMINI_MODEL (ej. gemini-2.0-flash).' }
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
