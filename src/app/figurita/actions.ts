'use server'

import { GoogleGenAI, Modality, type GenerateContentResponse } from '@google/genai'
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

    let response: GenerateContentResponse | undefined
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
      const c0 = response.candidates?.[0]
      const fr = c0?.finishReason
      const extra =
        fr != null && String(fr) !== 'STOP'
          ? ` (${String(fr).replace(/^FINISH_REASON_/, '')})`
          : response.promptFeedback?.blockReason
            ? ` (bloqueo: ${response.promptFeedback.blockReason})`
            : ''
      return {
        ok: false,
        error: [
          `El modelo no devolvió texto usable${extra}.`,
          'En local: GEMINI_API_KEY en .env.local (sin NEXT_PUBLIC) y reiniciá el servidor.',
          'Opcional: GEMINI_MODEL=gemini-2.0-flash',
        ].join(' '),
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

export type GenerateFiguritaPortraitResult =
  | { ok: true; imageDataUrl: string }
  | { ok: false; error: string }

function parseDataUrl(dataUrl: string): { mimeType: string; base64: string } | null {
  const t = dataUrl.trim()
  const m = /^data:([^;,]+);base64,([\s\S]+)$/.exec(t)
  if (!m) return null
  const mimeType = m[1].toLowerCase()
  const base64 = m[2].replace(/\s/g, '')
  if (!base64) return null
  return { mimeType, base64 }
}

function extractGeneratedImageDataUrl(response: GenerateContentResponse): string | null {
  const parts = response.candidates?.[0]?.content?.parts
  if (!parts?.length) return null
  for (let i = parts.length - 1; i >= 0; i--) {
    const id = parts[i]?.inlineData
    if (id?.data && id.mimeType && /^image\//i.test(id.mimeType)) {
      return `data:${id.mimeType};base64,${id.data}`
    }
  }
  return null
}

/** Instrucciones visuales para la IA según la posición elegida en el formulario (español). */
function positionVisualBrief(position: string): string {
  const p = position.trim().toLowerCase()
  if (p === 'arquero')
    return [
      'The person must be depicted as a GOALKEEPER, not an outfield player.',
      'Use a distinct goalkeeper kit (often different accent color from outfield, long sleeves common), padded jersey optional, and professional goalkeeper GLOVES clearly visible.',
      'Shorts and socks in matching GK style; optional subtle goal net in deep background blur.',
    ].join(' ')
  if (p === 'defensa')
    return [
      'The person must be depicted as a DEFENDER / center-back or full-back, not a goalkeeper.',
      'Standard outfield football kit (short sleeves typical) in the national palette; no goalkeeper gloves, no padded GK jersey.',
    ].join(' ')
  if (p === 'mediocampista')
    return [
      'The person must be depicted as a MIDFIELDER, not a goalkeeper or pure striker cliché.',
      'Standard outfield kit in the national palette; athletic build, no GK gloves.',
    ].join(' ')
  if (p === 'delantero')
    return [
      'The person must be depicted as a FORWARD / STRIKER / attacker, not a goalkeeper.',
      'Standard outfield kit in the national palette; no goalkeeper gloves.',
    ].join(' ')
  if (p === 'dt' || p.includes('director') || p.includes('técnico'))
    return [
      'The person must be depicted as a TEAM MANAGER / HEAD COACH on the sideline, NOT as an active player.',
      'Dress in a smart tracksuit, coach jacket, or formal sideline attire in colors that echo the national team (no playing jersey, no shorts kit). Headset or tactics board optional and subtle.',
    ].join(' ')
  return `Depict the person in a role consistent with the football position "${position.trim()}" on the card (outfield kit unless it is clearly goalkeeper or coach).`
}

/**
 * Genera un retrato estilo figurita (misma persona, camiseta genérica a colores de la selección, estadio Mundial 2026).
 * Modelos con salida de imagen: GEMINI_IMAGE_MODEL opcional; si no, cadena flash-image → previews.
 */
export async function generateFiguritaPortrait(params: {
  photoDataUrl: string
  countryName: string
  countryCode: string
  playerName: string
  position: string
}): Promise<GenerateFiguritaPortraitResult> {
  const apiKey = resolveGenaiApiKey()
  if (!apiKey) {
    return {
      ok: false,
      error:
        'Falta clave de API. En .env.local o Vercel definí GEMINI_API_KEY (sin NEXT_PUBLIC). Reiniciá el servidor tras guardar.',
    }
  }

  const parsed = parseDataUrl(params.photoDataUrl)
  if (!parsed) {
    return { ok: false, error: 'La foto no llegó en formato base64 válido (data URL).' }
  }
  if (!/^image\/(jpeg|jpg|png|webp)$/i.test(parsed.mimeType)) {
    return { ok: false, error: 'Usá una imagen JPG, PNG o WebP.' }
  }
  if (parsed.base64.length > 14_000_000) {
    return { ok: false, error: 'La imagen es demasiado grande. Probá otra más chica.' }
  }

  const envImg = process.env.GEMINI_IMAGE_MODEL?.trim()
  const strippedImg = envImg ? stripModelId(envImg) : null
  const modelChain = strippedImg
    ? [strippedImg, 'gemini-2.5-flash-image', 'gemini-3.1-flash-image-preview', 'gemini-3-pro-image-preview']
    : ['gemini-2.5-flash-image', 'gemini-3.1-flash-image-preview', 'gemini-3-pro-image-preview']

  const safeName = params.playerName.replace(/"/g, "'").slice(0, 40)
  const safePos = params.position.replace(/"/g, "'").slice(0, 32)

  const prompt = `IMAGE-TO-IMAGE. The first attachment is one real person.

Generate a single new image: keep the same person (facial identity, apparent age, skin tone, hair; no face swap).

Premium collectible football card portrait for a World Cup tournament in 2026 (Panini / sticker style lighting).

• Position on card (MUST follow — user selected "${safePos}" in Spanish): ${positionVisualBrief(params.position)}

• Kit: generic football jersey whose colors and simple patterns evoke "${params.countryName}" (typical flag/kit code: ${params.countryCode}). Only flat color fields or stripes. NO national federation crest, NO FIFA logo or wordmark, NO sponsor logos, NO official club or team badges. Adapt the kit type to the position above (e.g. goalkeeper kit vs outfield kit vs coach attire).

• Background: outdoor stadium at night, crowd bokeh, stadium lights, subtle confetti or haze — big-final atmosphere. No readable trademark text or logos.

• Framing: chest / three-quarter portrait, broadcast sports photography, photorealistic, shallow depth of field.

• Do NOT paint the player's name ("${safeName}"), position ("${safePos}"), nicknames, or any other readable text on the image. Keep the lower ~25% calmer (darker or softer) for a UI overlay later.

Avoid nudity or violence.`

  try {
    const ai = new GoogleGenAI({ apiKey })
    let response: GenerateContentResponse | undefined
    let lastError: unknown

    for (let mi = 0; mi < modelChain.length; mi++) {
      const model = modelChain[mi]!
      try {
        response = await ai.models.generateContent({
          model,
          contents: [
            {
              role: 'user',
              parts: [
                { inlineData: { mimeType: parsed.mimeType, data: parsed.base64 } },
                { text: prompt },
              ],
            },
          ],
          config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
            imageConfig: {
              aspectRatio: '3:4',
            },
            temperature: 0.35,
          },
        })
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

    const out = extractGeneratedImageDataUrl(response)
    if (!out) {
      const hint = response.text?.trim().slice(0, 220)
      return {
        ok: false,
        error: [
          'El modelo no devolvió imagen.',
          hint || 'Probá otra foto, o definí GEMINI_IMAGE_MODEL=gemini-2.5-flash-image en el entorno.',
        ].join(' '),
      }
    }
    return { ok: true, imageDataUrl: out }
  } catch (e) {
    console.error('generateFiguritaPortrait', e)
    return { ok: false, error: formatGenaiError(e) }
  }
}
