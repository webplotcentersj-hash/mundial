'use client'

import { useState, useRef, useCallback } from 'react'
import { toPng } from 'html-to-image'
import { Download, Upload, ImageIcon, RefreshCw, Sparkles } from 'lucide-react'
import { mockTeams } from '@/lib/mockData'
import Image from 'next/image'
import { getPlayerApodo } from '@/lib/figuritaPlayerApodo'
import { generateFiguritaPortrait } from '@/app/figurita/actions'

// Filtramos equipos placeholder (como 'Ganador 74') y ordenamos alfabéticamente
const countries = mockTeams.filter(t => t.group !== 'KO').sort((a, b) => a.name.localeCompare(b.name))

const DEFAULT_CARD_BACKGROUND =
  'linear-gradient(180deg, #262626 0%, #171717 45%, #0a0a0a 100%)'

type FiguritaMode = 'classic' | 'ia'

export default function FiguritaPage() {
  const [mode, setMode] = useState<FiguritaMode>('classic')
  const [photo, setPhoto] = useState<string | null>(null)
  const [name, setName] = useState<string>('Tu Nombre')
  const [position, setPosition] = useState<string>('Mediocampista')
  const [selectedTeamCode, setSelectedTeamCode] = useState<string>('ar') // Argentina por defecto
  const [isGenerating, setIsGenerating] = useState(false)
  const [aiPortrait, setAiPortrait] = useState<string | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)
  
  const figuritaRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const selectedTeam = countries.find(t => t.code === selectedTeamCode) || countries[0]

  const displayPhoto = mode === 'classic' ? photo : (aiPortrait ?? photo)

  const setFiguritaMode = (next: FiguritaMode) => {
    setMode(next)
    setAiError(null)
    if (next === 'classic') {
      setAiPortrait(null)
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
      setAiError('Subí una foto primero: la IA arma el retrato con tu cara, la camiseta a colores de la selección y un estadio Mundial 2026.')
      return
    }
    setAiLoading(true)
    setAiError(null)
    try {
      const resized = await resizePhotoForAi(photo)
      const res = await generateFiguritaPortrait({
        photoDataUrl: resized,
        countryName: selectedTeam.name,
        countryCode: selectedTeam.code,
        playerName: (name || 'Jugador').trim(),
        position: position.trim(),
      })
      if (!res.ok) {
        setAiError(res.error)
        return
      }
      setAiPortrait(res.imageDataUrl)
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
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDownload = useCallback(async () => {
    if (figuritaRef.current === null) return

    try {
      setIsGenerating(true)
      // Agregamos un pequeño timeout para asegurar que las fuentes/imágenes estén cargadas
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const dataUrl = await toPng(figuritaRef.current, { 
        quality: 0.95,
        pixelRatio: 2 // Mayor resolución para impresión/redes
      })
      
      const link = document.createElement('a')
      link.download = `figurita-${name.replace(/\s+/g, '-').toLowerCase()}.png`
      link.href = dataUrl
      link.click()
    } catch (err) {
      console.error('Error al generar la imagen', err)
      alert('Hubo un problema al generar la figurita.')
    } finally {
      setIsGenerating(false)
    }
  }, [name])

  return (
    <div className="min-h-screen bg-transparent p-4 md:p-8 pt-24 text-white">
      <div className="max-w-5xl mx-auto">
        
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-black italic tracking-tight uppercase text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
            Tu Figurita Oficial
          </h1>
          <p className="text-neutral-400 mt-2 text-lg">Crea tu propia figurita del Mundial y envíala a imprimir.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          {/* EDITOR (Izquierda) */}
          <div className="bg-neutral-900/50 backdrop-blur-md p-6 rounded-2xl border border-white/5 space-y-6">
            <h2 className="text-xl font-bold border-b border-white/10 pb-2">Personaliza tu Jugador</h2>

            <div className="flex rounded-xl border border-white/10 bg-black/30 p-1">
              <button
                type="button"
                onClick={() => setFiguritaMode('classic')}
                className={`flex-1 rounded-lg py-2.5 text-sm font-bold transition ${
                  mode === 'classic'
                    ? 'bg-emerald-600/90 text-white shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Sin IA
              </button>
              <button
                type="button"
                onClick={() => setFiguritaMode('ia')}
                className={`flex-1 rounded-lg py-2.5 text-sm font-bold transition ${
                  mode === 'ia'
                    ? 'bg-emerald-600/90 text-white shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Con IA
              </button>
            </div>
            
            {/* Foto */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-300 block">Sube tu foto (Cara/Busto)</label>
              {mode === 'classic' ? (
                <p className="text-xs text-neutral-500 leading-snug">
                  Subí la foto y completá nombre, posición y selección. La vista previa se actualiza al toque; descargá
                  cuando quieras, sin generar nada con IA.
                </p>
              ) : (
                <p className="text-xs text-neutral-500 leading-snug">
                  Crear con IA genera un retrato con tu cara, una camiseta genérica a colores de la selección (sin escudos
                  oficiales) y un estadio nocturno estilo Mundial 2026.
                </p>
              )}
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center cursor-pointer hover:bg-white/5 transition-colors flex flex-col items-center justify-center gap-3"
              >
                {photo ? (
                  <div className="text-emerald-400 flex items-center gap-2">
                    <RefreshCw className="w-5 h-5" /> Cambiar Foto
                  </div>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-neutral-400" />
                    <span className="text-neutral-400 font-medium">Click para seleccionar imagen</span>
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

            {/* Datos */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-neutral-300 block mb-1">Nombre en la figurita</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={20}
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  placeholder="Ej: L. MESSI"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-neutral-300 block mb-1">Posición</label>
                <select 
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all appearance-none"
                >
                  <option value="Arquero">Arquero</option>
                  <option value="Defensa">Defensa</option>
                  <option value="Mediocampista">Mediocampista</option>
                  <option value="Delantero">Delantero</option>
                  <option value="DT">Director Técnico</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-neutral-300 block mb-1">Selección Nacional</label>
                <select 
                  value={selectedTeamCode}
                  onChange={(e) => {
                    setSelectedTeamCode(e.target.value)
                    setAiPortrait(null)
                    setAiError(null)
                  }}
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all appearance-none"
                >
                  {countries.map(country => (
                    <option key={country.id} value={country.code}>{country.name}</option>
                  ))}
                </select>
              </div>

              {mode === 'ia' && (
                <>
                  <button
                    type="button"
                    onClick={handleGeminiLook}
                    disabled={aiLoading}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-emerald-400/35 bg-gradient-to-r from-emerald-600/35 to-cyan-600/25 py-3 text-sm font-bold text-white transition hover:border-emerald-300/45 hover:from-emerald-500/45 hover:to-cyan-500/35 disabled:cursor-not-allowed disabled:opacity-60"
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
                  {aiError && (
                    <p className="rounded-lg border border-red-500/30 bg-red-950/40 px-3 py-2 text-xs leading-snug text-red-200/95">
                      {aiError}
                    </p>
                  )}
                </>
              )}
            </div>
            
            <div className="pt-4 border-t border-white/10">
              <button
                onClick={handleDownload}
                disabled={isGenerating || !displayPhoto}
                className="w-full py-4 bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <Download className="w-5 h-5" />
                )}
                {isGenerating ? 'Generando Alta Calidad...' : 'Descargar Figurita'}
              </button>
              {!displayPhoto && (
                <p className="text-xs text-center text-red-400 mt-2">Sube una foto para poder descargar.</p>
              )}
            </div>

          </div>

          {/* PREVISUALIZACIÓN (Derecha) */}
          <div className="flex flex-col items-center justify-center">
            
            {/* Contenedor principal que será capturado por html-to-image */}
            {/* Proporción típica de figurita es ~ 68mm x 99mm (aspect ratio ~ 0.68) */}
            <div 
              ref={figuritaRef}
              className="relative w-[320px] h-[465px] rounded-sm overflow-hidden shadow-2xl border-[6px] border-white bg-neutral-900"
              style={{
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 40px rgba(255,255,255,0.1) inset'
              }}
            >
              
              {/* Fondo base figurita */}
              <div className="absolute inset-0" style={{ background: DEFAULT_CARD_BACKGROUND }} />
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_50%_-10%,rgba(255,255,255,0.14),transparent_55%)] opacity-40 mix-blend-overlay" />
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/25 via-neutral-900/80 to-black opacity-25" />

              {/* Foto: original o retrato generado por IA */}
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
                  <span className="text-sm font-bold uppercase tracking-widest text-neutral-500">Sin Foto</span>
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

              {/* Degradado inferior para legibilidad del texto */}
              <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-[1] h-1/2 bg-gradient-to-t from-black via-black/70 to-transparent" />

              {/* Elementos de la UI de la figurita (Marcos, Textos, Bandera) */}

              {/* Logo de la app arriba a la derecha */}
              <div className="pointer-events-none absolute top-3 right-3 z-20 h-10 w-[104px] rounded-md bg-neutral-800 p-1 shadow-md ring-1 ring-white/15">
                <Image
                  src="/plot%20center%20mundial.png"
                  alt="Plot Mundial"
                  width={160}
                  height={45}
                  className="h-full w-full object-contain object-center"
                  priority
                />
              </div>

              {/* Bandera del país seleccionado arriba a la izquierda */}
              <div className="absolute top-4 left-4 z-20 w-12 h-8 overflow-hidden rounded-sm border border-white/20 shadow-lg">
                  <Image unoptimized 
                    src={`https://flagcdn.com/w80/${selectedTeamCode === 'gb-eng' ? 'gb' : selectedTeamCode === 'gb-sct' ? 'gb-sct' : selectedTeamCode}.png`}
                  alt={selectedTeam.name}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Contenedor inferior: nombre, posición, país, apodo (siempre encima de la foto) */}
              <div className="absolute bottom-0 left-0 right-0 z-30 flex flex-col p-5">
                
                <div className="flex items-end justify-between border-b-2 border-white/20 pb-2 mb-2">
                  <div className="flex flex-col">
                    <span className="text-emerald-400 font-bold text-xs uppercase tracking-widest mb-1">{position}</span>
                    <h3 className="text-white font-black text-2xl uppercase tracking-tighter leading-none">
                      {(name || '').trim() || 'Tu Nombre'}
                    </h3>
                  </div>
                  {/* Escudo secundario redondo (reusando la bandera por ahora) */}
                  <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden relative shadow-md shrink-0">
                    <Image unoptimized 
                      src={`https://flagcdn.com/w80/${selectedTeamCode === 'gb-eng' ? 'gb' : selectedTeamCode === 'gb-sct' ? 'gb-sct' : selectedTeamCode}.png`}
                      alt={selectedTeam.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-end gap-2 text-xs text-neutral-300 font-medium">
                  <span className="min-w-0 truncate uppercase tracking-wider">{selectedTeam.name}</span>
                  <div
                    className="min-w-0 max-w-[58%] text-right text-[11px] font-black uppercase tracking-tight text-emerald-300/95 truncate"
                    title={getPlayerApodo((name || '').trim() || 'Tu Nombre')}
                  >
                    {getPlayerApodo((name || '').trim() || 'Tu Nombre')}
                  </div>
                </div>

              </div>

              {/* Efecto Brilloso Superior (Glossy Overlay) */}
              <div className="pointer-events-none absolute inset-0 z-[24] bg-gradient-to-tr from-transparent via-white/5 to-white/20" />

            </div>

            <p className="text-neutral-500 text-sm mt-6 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center">
              <span className="inline-flex items-center gap-2">
                <span className="inline-block w-2 h-2 shrink-0 rounded-full bg-emerald-500 animate-pulse" />
                Vista previa en tiempo real
              </span>
              {mode === 'ia' && (aiPortrait || aiLoading) && (
                <span className="text-emerald-400/80">· Look IA</span>
              )}
            </p>
            {mode === 'ia' && aiPortrait && (
              <button
                type="button"
                onClick={() => setAiPortrait(null)}
                className="mt-3 text-xs font-medium text-neutral-400 underline decoration-white/20 underline-offset-2 hover:text-white"
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
