'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toPng } from 'html-to-image'
import { Download, Upload, ImageIcon, RefreshCw, Sparkles, Store, Share2 } from 'lucide-react'
import { mockTeams } from '@/lib/mockData'
import Image from 'next/image'
import { getPlayerApodo } from '@/lib/figuritaPlayerApodo'
import { generateFiguritaApodo, generateFiguritaPortrait } from '@/app/figurita/actions'
import { createClient } from '@/lib/supabase/client'
import { STORE_PRINTS_BUCKET, writeFiguritaStoreImageToSession } from '@/lib/storePrints'
import { cn } from '@/lib/utils'

const countries = mockTeams.filter((t) => t.group !== 'KO').sort((a, b) => a.name.localeCompare(b.name))

const DEFAULT_CARD_BACKGROUND =
  'linear-gradient(180deg, #262626 0%, #171717 45%, #0a0a0a 100%)'

type FiguritaMode = 'classic' | 'ia'

export default function FiguritaPage() {
  const router = useRouter()
  const [mode, setMode] = useState<FiguritaMode>('classic')
  const [photo, setPhoto] = useState<string | null>(null)
  const [name, setName] = useState<string>('Tu Nombre')
  const [position, setPosition] = useState<string>('Mediocampista')
  const [selectedTeamCode, setSelectedTeamCode] = useState<string>('ar')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSharing, setIsSharing] = useState(false)
  const [aiPortrait, setAiPortrait] = useState<string | null>(null)
  const [aiApodo, setAiApodo] = useState<string | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)
  const [isSendingStore, setIsSendingStore] = useState(false)

  const figuritaRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const selectedTeam = countries.find((t) => t.code === selectedTeamCode) || countries[0]

  const displayPhoto = mode === 'classic' ? photo : (aiPortrait ?? photo)
  const displayApodo =
    mode === 'ia' && aiApodo
      ? aiApodo
      : getPlayerApodo((name || '').trim() || 'Tu Nombre')

  const setFiguritaMode = (next: FiguritaMode) => {
    setMode(next)
    setAiError(null)
    if (next === 'classic') {
      setAiPortrait(null)
      setAiApodo(null)
    }
  }

  async function resizePhotoForAi(dataUrl: string): Promise<string> {
    const maxSide = 960
    const quality = 0.82
    return new Promise((resolve, reject) => {
      const img = new window.Image()
      img.onload = () => {
        const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight))
        const w = Math.max(1, Math.round(img.naturalWidth * scale))
        const h = Math.max(1, Math.round(img.naturalHeight * scale))
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('canvas'))
          return
        }
        ctx.drawImage(img, 0, 0, w, h)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.onerror = () => reject(new Error('No se pudo leer la imagen.'))
      img.src = dataUrl
    })
  }

  const handleGeminiLook = async () => {
    if (!photo) {
      setAiError(
        'Subí una foto primero: la IA arma el retrato con tu cara, la camiseta a colores de la selección y un estadio Mundial 2026.',
      )
      return
    }
    setAiLoading(true)
    setAiError(null)
    try {
      const resized = await resizePhotoForAi(photo)
      const playerName = (name || 'Jugador').trim()
      const playerPosition = position.trim()
      const [portraitRes, apodoRes] = await Promise.all([
        generateFiguritaPortrait({
          photoDataUrl: resized,
          countryName: selectedTeam.name,
          countryCode: selectedTeam.code,
          playerName,
          position: playerPosition,
        }),
        generateFiguritaApodo({
          photoDataUrl: resized,
          countryName: selectedTeam.name,
          countryCode: selectedTeam.code,
          playerName,
          position: playerPosition,
        }),
      ])
      if (!portraitRes.ok) {
        setAiError(portraitRes.error)
        return
      }
      setAiPortrait(portraitRes.imageDataUrl)
      if (apodoRes.ok) {
        setAiApodo(apodoRes.apodo)
      } else {
        setAiApodo(null)
      }
    } catch (e) {
      console.error('generateFiguritaPortrait', e)
      setAiError('No se pudo generar el retrato. Revisá la consola o probá otra foto.')
    } finally {
      setAiLoading(false)
    }
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setPhoto(event.target?.result as string)
        setAiPortrait(null)
        setAiApodo(null)
      }
      reader.readAsDataURL(file)
    }
  }

  const captureFiguritaPng = useCallback(async () => {
    if (figuritaRef.current === null) {
      throw new Error('Sin vista previa')
    }
    await new Promise((resolve) => setTimeout(resolve, 100))
    return toPng(figuritaRef.current, {
      quality: 0.95,
      pixelRatio: 3,
      cacheBust: true,
    })
  }, [])

  const buildSharePayload = useCallback(() => {
    const playerName = (name || '').trim() || 'Tu Nombre'
    const shareUrl =
      typeof window !== 'undefined' ? `${window.location.origin}/figurita` : 'https://plotmundial.com.ar/figurita'
    const shareText = `¡Mirá mi figurita del Mundial 2026! ${playerName} · ${displayApodo} · ${selectedTeam.name} — armala en Plot Mundial`
    const fileSlug = playerName.replace(/\s+/g, '-').toLowerCase()
    return { shareUrl, shareText, fileSlug }
  }, [name, displayApodo, selectedTeam.name])

  const handleDownload = useCallback(async () => {
    if (!displayPhoto) return

    try {
      setIsGenerating(true)
      const dataUrl = await captureFiguritaPng()
      const { fileSlug } = buildSharePayload()

      const link = document.createElement('a')
      link.download = `figurita-${fileSlug}.png`
      link.href = dataUrl
      link.click()
    } catch (err) {
      console.error('Error al generar la imagen', err)
      alert('Hubo un problema al generar la figurita.')
    } finally {
      setIsGenerating(false)
    }
  }, [displayPhoto, captureFiguritaPng, buildSharePayload])

  const openSocialShare = useCallback(
    (network: 'whatsapp' | 'twitter' | 'facebook') => {
      const { shareUrl, shareText } = buildSharePayload()
      const encodedText = encodeURIComponent(shareText)
      const encodedUrl = encodeURIComponent(shareUrl)
      const urls = {
        whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
        twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`,
      }
      window.open(urls[network], '_blank', 'noopener,noreferrer,width=640,height=720')
    },
    [buildSharePayload],
  )

  const handleShare = useCallback(async () => {
    if (!displayPhoto) return

    try {
      setIsSharing(true)
      const dataUrl = await captureFiguritaPng()
      const blob = await (await fetch(dataUrl)).blob()
      const { shareUrl, shareText, fileSlug } = buildSharePayload()
      const file = new File([blob], `figurita-${fileSlug}.png`, { type: 'image/png' })

      if (typeof navigator !== 'undefined' && navigator.share) {
        const payload: ShareData = { title: 'Mi figurita Plot Mundial', text: shareText, url: shareUrl }
        if (navigator.canShare?.({ ...payload, files: [file] })) {
          await navigator.share({ ...payload, files: [file] })
          return
        }
        if (navigator.canShare?.(payload)) {
          await navigator.share(payload)
          return
        }
      }

      if (typeof navigator !== 'undefined' && navigator.clipboard?.write && typeof ClipboardItem !== 'undefined') {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
        alert('Imagen copiada. Pegala en Instagram, WhatsApp o TikTok.')
        return
      }

      const useSocial = window.confirm(
        'Tu navegador no comparte archivos directo. ¿Querés abrir WhatsApp para mandar el link? (También podés descargar la figurita y subirla a tus redes.)',
      )
      if (useSocial) openSocialShare('whatsapp')
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return
      console.error('handleShare', err)
      alert('No se pudo compartir. Probá descargar la figurita y subirla manualmente.')
    } finally {
      setIsSharing(false)
    }
  }, [displayPhoto, captureFiguritaPng, buildSharePayload, openSocialShare])

  const handleSendToStore = useCallback(async () => {
    if (figuritaRef.current === null || !displayPhoto) {
      alert('Subí una foto primero para armar la figurita.')
      return
    }
    setIsSendingStore(true)
    try {
      await new Promise((r) => setTimeout(r, 150))
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login?next=/figurita')
        return
      }
      const dataUrl = await captureFiguritaPng()
      const blob = await (await fetch(dataUrl)).blob()
      const path = `${user.id}/figurita-${crypto.randomUUID()}.png`
      const { error: upErr } = await supabase.storage.from(STORE_PRINTS_BUCKET).upload(path, blob, {
        contentType: 'image/png',
        upsert: false,
      })
      if (upErr) {
        console.error(upErr)
        const msg = upErr.message?.toLowerCase() ?? ''
        alert(
          msg.includes('bucket not found')
            ? 'El almacenamiento del Store no está configurado en el servidor. Avisá al administrador o probá de nuevo en unos minutos.'
            : upErr.message ||
                'No se pudo subir la imagen. Verificá que estés logueado e intentá de nuevo.',
        )
        return
      }
      const pub = supabase.storage.from(STORE_PRINTS_BUCKET).getPublicUrl(path).data.publicUrl
      writeFiguritaStoreImageToSession(pub)
      router.push('/store')
    } catch (err) {
      console.error('handleSendToStore', err)
      alert('No se pudo enviar al Store. Probá de nuevo o descargá la figurita.')
    } finally {
      setIsSendingStore(false)
    }
  }, [displayPhoto, router, captureFiguritaPng])

  return (
    <div className="min-h-[calc(100vh-4rem)] w-full max-w-[100vw] overflow-x-hidden px-4 py-8 text-[#111] md:px-8 md:py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 text-center font-[family-name:var(--font-store-sans)]">
          <h1 className="text-4xl font-black uppercase tracking-tight text-[#111] md:text-5xl [font-family:var(--font-store-display),sans-serif]">
            Tu figurita oficial
          </h1>
          <p className="mt-2 text-lg font-medium text-[#444]">
            Creá tu figurita y mandala al Store en alta calidad para imprimir.
          </p>
        </div>

        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-2">
          <div
            className={cn(
              'space-y-6 border-[3px] border-[#111] bg-white p-6 font-[family-name:var(--font-store-sans)]',
              'shadow-[8px_8px_0_#111]',
            )}
          >
            <h2 className="border-b-2 border-[#111] pb-2 text-lg font-black uppercase tracking-wide text-[#111] [font-family:var(--font-store-display),sans-serif]">
              Personalizá tu jugador
            </h2>

            <div className="flex overflow-hidden border-2 border-[#111] p-0">
              <button
                type="button"
                onClick={() => setFiguritaMode('classic')}
                className={cn(
                  'flex-1 py-3 text-sm font-bold transition-all [font-family:var(--font-store-display),sans-serif]',
                  mode === 'classic'
                    ? 'bg-[#111] text-[#ccff00]'
                    : 'bg-white text-[#111] hover:bg-[#f5f5f5]',
                )}
              >
                Sin IA
              </button>
              <button
                type="button"
                onClick={() => setFiguritaMode('ia')}
                className={cn(
                  'flex-1 border-l-2 border-[#111] py-3 text-sm font-bold transition-all [font-family:var(--font-store-display),sans-serif]',
                  mode === 'ia'
                    ? 'bg-[#111] text-[#ccff00]'
                    : 'bg-white text-[#111] hover:bg-[#f5f5f5]',
                )}
              >
                Con IA
              </button>
            </div>

            <div className="space-y-2">
              <label className="store-label">Subí tu foto (cara / busto)</label>
              {mode === 'classic' ? (
                <p className="text-xs leading-snug text-[#555]">
                  Subí la foto y completá nombre, posición y selección. La vista previa se actualiza al toque; descargá
                  cuando quieras, sin generar nada con IA.
                </p>
              ) : (
                <p className="text-xs leading-snug text-[#555]">
                  Crear con IA genera un retrato con tu cara, camiseta a colores de la selección y un apodo tuyo que
                  mezcla tu nombre con el país que elijas. Después podés descargarla o compartirla en redes.
                </p>
              )}
              <div
                role="button"
                tabIndex={0}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click()
                }}
                className="flex cursor-pointer flex-col items-center justify-center gap-3 border-2 border-dashed border-[#111] bg-[#fafafa] p-8 text-center transition-colors hover:bg-[#f0f0f0]"
              >
                {photo ? (
                  <div className="flex items-center gap-2 font-bold text-[#5d3fd3]">
                    <RefreshCw className="h-5 w-5" /> Cambiar foto
                  </div>
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-[#666]" />
                    <span className="font-semibold text-[#444]">Clic para elegir imagen</span>
                  </>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoUpload}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="store-label" htmlFor="fig-name">
                  Nombre en la figurita
                </label>
                <input
                  id="fig-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={20}
                  className="store-field"
                  placeholder="Ej: L. MESSI"
                />
              </div>

              <div>
                <label className="store-label" htmlFor="fig-position">
                  Posición
                </label>
                <select
                  id="fig-position"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="store-field"
                >
                  <option value="Arquero">Arquero</option>
                  <option value="Defensa">Defensa</option>
                  <option value="Mediocampista">Mediocampista</option>
                  <option value="Delantero">Delantero</option>
                  <option value="DT">Director Técnico</option>
                </select>
              </div>

              <div>
                <label className="store-label" htmlFor="fig-team">
                  Selección nacional
                </label>
                <select
                  id="fig-team"
                  value={selectedTeamCode}
                  onChange={(e) => {
                    setSelectedTeamCode(e.target.value)
                    setAiPortrait(null)
                    setAiApodo(null)
                    setAiError(null)
                  }}
                  className="store-field"
                >
                  {countries.map((country) => (
                    <option key={country.id} value={country.code}>
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>

              {mode === 'ia' && (
                <>
                  <button
                    type="button"
                    onClick={handleGeminiLook}
                    disabled={aiLoading}
                    className="btn-primary hover-lift flex w-full items-center justify-center gap-2 border-2 border-[#111] py-3 text-center disabled:cursor-not-allowed disabled:opacity-60 [font-family:var(--font-store-display),sans-serif]"
                  >
                    {aiLoading ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" aria-hidden /> Creando…
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 shrink-0" aria-hidden /> Crear con IA
                      </>
                    )}
                  </button>
                  {aiError && <p className="store-message err text-sm leading-snug">{aiError}</p>}
                </>
              )}
            </div>

            <div className="space-y-3 border-t-2 border-[#111] pt-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={isGenerating || isSharing || !displayPhoto}
                  className="btn-primary hover-lift flex w-full items-center justify-center gap-2 py-4 text-center disabled:cursor-not-allowed disabled:opacity-50 [font-family:var(--font-store-display),sans-serif]"
                >
                  {isGenerating ? (
                    <RefreshCw className="h-5 w-5 animate-spin" />
                  ) : (
                    <Download className="h-5 w-5" />
                  )}
                  {isGenerating ? 'Armando PNG…' : 'Descargar'}
                </button>
                <button
                  type="button"
                  onClick={handleShare}
                  disabled={isGenerating || isSharing || !displayPhoto}
                  className="btn-secondary hover-lift flex w-full items-center justify-center gap-2 py-4 text-center disabled:cursor-not-allowed disabled:opacity-50 [font-family:var(--font-store-display),sans-serif]"
                >
                  {isSharing ? (
                    <RefreshCw className="h-5 w-5 animate-spin" />
                  ) : (
                    <Share2 className="h-5 w-5" />
                  )}
                  {isSharing ? 'Compartiendo…' : 'Compartir'}
                </button>
              </div>
              {displayPhoto ? (
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <span className="w-full text-center text-[11px] font-semibold uppercase tracking-wider text-[#666]">
                    O compartí el link
                  </span>
                  <button
                    type="button"
                    onClick={() => openSocialShare('whatsapp')}
                    className="rounded-full border-2 border-[#111] bg-[#25D366] px-4 py-1.5 text-xs font-black uppercase tracking-wide text-white transition-opacity hover:opacity-90"
                  >
                    WhatsApp
                  </button>
                  <button
                    type="button"
                    onClick={() => openSocialShare('twitter')}
                    className="rounded-full border-2 border-[#111] bg-[#111] px-4 py-1.5 text-xs font-black uppercase tracking-wide text-white transition-opacity hover:opacity-90"
                  >
                    X
                  </button>
                  <button
                    type="button"
                    onClick={() => openSocialShare('facebook')}
                    className="rounded-full border-2 border-[#111] bg-[#1877F2] px-4 py-1.5 text-xs font-black uppercase tracking-wide text-white transition-opacity hover:opacity-90"
                  >
                    Facebook
                  </button>
                </div>
              ) : (
                <p className="text-center text-xs font-semibold text-[#c00]">Subí una foto para poder descargar o compartir.</p>
              )}
              <button
                type="button"
                onClick={handleSendToStore}
                disabled={isSendingStore || isGenerating || isSharing || !displayPhoto}
                className="btn-secondary hover-lift flex w-full items-center justify-center gap-2 py-3 text-center disabled:cursor-not-allowed disabled:opacity-50 [font-family:var(--font-store-display),sans-serif]"
              >
                {isSendingStore ? (
                  <RefreshCw className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
                ) : (
                  <Store className="h-4 w-4 shrink-0" aria-hidden />
                )}
                {isSendingStore ? 'Subiendo…' : 'Enviar al Store (alta calidad)'}
              </button>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center font-[family-name:var(--font-store-sans)]">
            <div
              ref={figuritaRef}
              className="relative h-[465px] w-[320px] overflow-hidden rounded-sm border-[6px] border-white bg-neutral-900 shadow-[12px_12px_0_rgba(0,0,0,0.15)] ring-2 ring-[#111]"
              style={{
                boxShadow:
                  '12px 12px 0 rgba(0,0,0,0.12), 0 25px 50px -12px rgba(0, 0, 0, 0.45), inset 0 0 40px rgba(255,255,255,0.06)',
              }}
            >
              <div className="absolute inset-0" style={{ background: DEFAULT_CARD_BACKGROUND }} />
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_50%_-10%,rgba(255,255,255,0.14),transparent_55%)] opacity-40 mix-blend-overlay" />
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/25 via-neutral-900/80 to-black opacity-25" />

              {displayPhoto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={displayPhoto}
                  alt="Foto del jugador"
                  className="absolute inset-0 z-0 h-full w-full object-cover object-top"
                />
              ) : (
                <div className="absolute inset-0 z-0 flex flex-col items-center justify-center gap-2 bg-neutral-800 px-4 text-center">
                  <ImageIcon className="mb-0 h-20 w-20 text-neutral-600" />
                  <span className="text-sm font-bold uppercase tracking-widest text-neutral-500">Sin foto</span>
                  {mode === 'classic' ? (
                    <span className="max-w-[260px] text-[10px] leading-tight text-neutral-500">
                      Subí una foto (cara o busto) y cargá nombre, posición y selección a la izquierda. Vista previa al
                      instante, sin IA.
                    </span>
                  ) : (
                    <>
                      <span className="max-w-[200px] text-[9px] leading-tight text-neutral-500">
                        Fondo y camiseta IA visibles abajo · subí foto para tapar esta zona
                      </span>
                      <span className="max-w-[240px] text-[10px] leading-tight text-neutral-500">
                        Subí tu cara y tocá Crear con IA para armar camiseta a colores de la selección y fondo de estadio
                        Mundial 2026.
                      </span>
                    </>
                  )}
                </div>
              )}

              <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-[1] h-1/2 bg-gradient-to-t from-black via-black/70 to-transparent" />

              <div className="pointer-events-none absolute right-3 top-3 z-20 h-10 w-[104px] rounded-md bg-neutral-800 p-1 shadow-md ring-1 ring-white/15">
                <Image
                  src="/plot%20center%20mundial.png"
                  alt="Plot Mundial"
                  width={160}
                  height={45}
                  className="h-full w-full object-contain object-center"
                  priority
                />
              </div>

              <div className="absolute left-4 top-4 z-20 h-8 w-12 overflow-hidden rounded-sm border border-white/20 shadow-lg">
                <Image
                  unoptimized
                  src={`https://flagcdn.com/w80/${selectedTeamCode === 'gb-eng' ? 'gb' : selectedTeamCode === 'gb-sct' ? 'gb-sct' : selectedTeamCode}.png`}
                  alt={selectedTeam.name}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="absolute bottom-0 left-0 right-0 z-30 flex flex-col p-5">
                <div className="mb-2 flex items-end justify-between border-b-2 border-white/20 pb-2">
                  <div className="flex flex-col">
                    <span className="mb-1 text-xs font-bold uppercase tracking-widest text-[#ccff00]">{position}</span>
                    <h3 className="text-2xl font-black uppercase leading-none tracking-tighter text-white">
                      {(name || '').trim() || 'Tu Nombre'}
                    </h3>
                  </div>
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border-2 border-white shadow-md">
                    <Image
                      unoptimized
                      src={`https://flagcdn.com/w80/${selectedTeamCode === 'gb-eng' ? 'gb' : selectedTeamCode === 'gb-sct' ? 'gb-sct' : selectedTeamCode}.png`}
                      alt={selectedTeam.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>

                <div className="flex items-end justify-between gap-2 text-xs font-medium text-neutral-300">
                  <span className="min-w-0 truncate uppercase tracking-wider">{selectedTeam.name}</span>
                  <div
                    className="max-w-[58%] min-w-0 truncate text-right text-[11px] font-black uppercase tracking-tight text-[#ccff00]/95"
                    title={displayApodo}
                  >
                    {displayApodo}
                  </div>
                </div>
              </div>

              <div className="pointer-events-none absolute inset-0 z-[24] bg-gradient-to-tr from-transparent via-white/5 to-white/20" />
            </div>

            <p className="mt-6 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center text-sm text-[#555]">
              <span className="inline-flex items-center gap-2">
                <span className="inline-block h-2 w-2 shrink-0 animate-pulse rounded-full bg-[#111]" />
                Vista previa en tiempo real
              </span>
              {mode === 'ia' && (aiPortrait || aiLoading) && (
                <span className="font-semibold text-[#5d3fd3]">· Look IA</span>
              )}
            </p>
            {mode === 'ia' && aiPortrait && (
              <button
                type="button"
                onClick={() => {
                  setAiPortrait(null)
                  setAiApodo(null)
                }}
                className="mt-3 text-xs font-bold text-[#111] underline decoration-[#111]/35 underline-offset-4 transition-colors hover:text-[#5d3fd3] hover:decoration-[#5d3fd3]/50"
              >
                Volver a la foto subida
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
