'use server'

import { GoogleGenAI } from '@google/genai'
import type { FiguritaAiTheme, FiguritaStripeStyle } from '@/lib/figuritaTheme'

const STRIPES: FiguritaStripeStyle[] = ['vertical', 'horizontal', 'sash', 'none', 'hoops']

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

function fallbackTheme(countryName: string): FiguritaAiTheme {
  return {
    backgroundCss:
      'linear-gradient(165deg, #0a0f1a 0%, #152238 38%, #0c1829 72%, #050a14 100%)',
    jerseyPrimary: '#e2e8f0',
    jerseySecondary: '#1e293b',
    jerseyAccent: '#38bdf8',
    stripeStyle: 'vertical',
  }
}

/**
 * Llama a Gemini (solo servidor) y devuelve colores + gradiente para la figurita.
 * Requiere GEMINI_API_KEY en .env / Vercel. Opcional: GEMINI_MODEL (ej. gemini-2.5-flash).
 */
export async function generateFiguritaTheme(
  countryName: string,
  countryCode: string
): Promise<{ theme: FiguritaAiTheme; error?: string }> {
  const apiKey = process.env.GEMINI_API_KEY?.trim()
  if (!apiKey) {
    return { theme: fallbackTheme(countryName), error: 'GEMINI_API_KEY no configurada.' }
  }

  const model =
    process.env.GEMINI_MODEL?.trim() ||
    'gemini-2.5-flash'

  const prompt = `Sos director de arte de figuritas coleccionables del Mundial 2026.
Equipo: "${countryName}" (código bandera típico: ${countryCode}).
Inspirate en la tradición cromática del fútbol de esa selección (no copies escudos ni marcas registradas; solo colores y estilo general).

Respondé UN solo objeto JSON, sin markdown, sin texto antes ni después. Claves exactas:
- "backgroundCss": string, un único valor CSS válido para la propiedad CSS "background" (preferí linear-gradient o radial-gradient con tonos nocturnos de estadio, elegantes, que armonicen con la camiseta).
- "jerseyPrimary", "jerseySecondary", "jerseyAccent": strings hex (#RRGGBB) para tejer la camiseta (primary = color base, secondary = contraste, accent = detalle vivo).
- "stripeStyle": uno de estos strings exactos: "vertical", "horizontal", "sash", "none", "hoops".

Ejemplo de forma (no copies valores): {"backgroundCss":"linear-gradient(160deg,#0a1628,#1a2d4a,#0b1220)","jerseyPrimary":"#75aadb","jerseySecondary":"#ffffff","jerseyAccent":"#fcb514","stripeStyle":"vertical"}`

  try {
    const ai = new GoogleGenAI({ apiKey })
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    })
    const text = response.text?.trim()
    if (!text) {
      return { theme: fallbackTheme(countryName), error: 'El modelo no devolvió texto.' }
    }
    const parsed = parseJsonObject(text) as Record<string, unknown>
    const theme = normalizeTheme(parsed)
    if (!theme) {
      return { theme: fallbackTheme(countryName), error: 'No se pudo validar el JSON del modelo.' }
    }
    return { theme }
  } catch (e) {
    console.error('generateFiguritaTheme', e)
    return {
      theme: fallbackTheme(countryName),
      error: 'Error al llamar a Gemini. Revisá la API key y el nombre del modelo.',
    }
  }
}
