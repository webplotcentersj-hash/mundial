'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { toPng } from 'html-to-image'
import { Download, Upload, ImageIcon, RefreshCw, Sparkles } from 'lucide-react'
import { mockTeams } from '@/lib/mockData'
import Image from 'next/image'
import type { FiguritaAiTheme } from '@/lib/figuritaTheme'
import { jerseyShirtBackground } from '@/lib/figuritaJerseyCss'
import { generateFiguritaTheme } from '@/app/figurita/actions'

// Filtramos equipos placeholder (como 'Ganador 74') y ordenamos alfabéticamente
const countries = mockTeams.filter(t => t.group !== 'KO').sort((a, b) => a.name.localeCompare(b.name))

const DEFAULT_CARD_BACKGROUND =
  'linear-gradient(180deg, #262626 0%, #171717 45%, #0a0a0a 100%)'

export default function FiguritaPage() {
  const [photo, setPhoto] = useState<string | null>(null)
  const [name, setName] = useState<string>('Tu Nombre')
  const [position, setPosition] = useState<string>('Mediocampista')
  const [selectedTeamCode, setSelectedTeamCode] = useState<string>('ar') // Argentina por defecto
  const [isGenerating, setIsGenerating] = useState(false)
  const [aiTheme, setAiTheme] = useState<FiguritaAiTheme | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiHint, setAiHint] = useState<string | null>(null)
  
  const figuritaRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const selectedTeam = countries.find(t => t.code === selectedTeamCode) || countries[0]

  useEffect(() => {
    setAiTheme(null)
    setAiHint(null)
  }, [selectedTeamCode])

  const handleGeminiLook = async () => {
    setAiLoading(true)
    setAiHint(null)
    try {
      const { theme, error } = await generateFiguritaTheme(selectedTeam.name, selectedTeam.code)
      setAiTheme(theme)
      if (error) setAiHint(error)
    } catch {
      setAiHint('No se pudo generar el diseño.')
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
      link.download = `figurita-${name.replace(/\\s+/g, '-').toLowerCase()}.png`
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
            
            {/* Foto */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-300 block">Sube tu foto (Cara/Busto)</label>
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
                  onChange={(e) => setSelectedTeamCode(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all appearance-none"
                >
                  {countries.map(country => (
                    <option key={country.id} value={country.code}>{country.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-emerald-200/90">
                <Sparkles className="h-4 w-4 shrink-0 text-emerald-400" />
                Gemini · camiseta y fondo
              </div>
              <p className="text-xs text-neutral-400">
                Genera un fondo de estadio y un patrón de camiseta alineado a la selección (solo en servidor; necesitás{' '}
                <code className="rounded bg-black/40 px-1 text-[10px] text-emerald-300/90">GEMINI_API_KEY</code>).
              </p>
              <button
                type="button"
                onClick={handleGeminiLook}
                disabled={aiLoading}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-emerald-400/35 bg-gradient-to-r from-emerald-600/40 to-cyan-600/30 py-3 text-sm font-bold text-white transition hover:border-emerald-300/50 hover:from-emerald-500/50 hover:to-cyan-500/40 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {aiLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" /> Generando con IA…
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" /> Crear look con IA
                  </>
                )}
              </button>
              {aiHint && <p className="text-center text-xs text-amber-400/90">{aiHint}</p>}
            </div>
            
            <div className="pt-4 border-t border-white/10">
              <button
                onClick={handleDownload}
                disabled={isGenerating || !photo}
                className="w-full py-4 bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <Download className="w-5 h-5" />
                )}
                {isGenerating ? 'Generando Alta Calidad...' : 'Descargar Figurita'}
              </button>
              {!photo && (
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
              
              {/* Fondo: Gemini o default */}
              <div
                className="absolute inset-0"
                style={{ background: aiTheme?.backgroundCss ?? DEFAULT_CARD_BACKGROUND }}
              />
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_50%_-10%,rgba(255,255,255,0.14),transparent_55%)] opacity-40 mix-blend-overlay" />
              {aiTheme && (
                <>
                  <div
                    className="pointer-events-none absolute inset-x-0 bottom-0 top-[36%]"
                    style={{
                      background: jerseyShirtBackground(aiTheme),
                      maskImage:
                        'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.35) 14%, black 22%, black 100%)',
                      WebkitMaskImage:
                        'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.35) 14%, black 22%, black 100%)',
                    }}
                  />
                  <div
                    className="pointer-events-none absolute left-1/2 top-[32%] h-[16%] w-[58%] -translate-x-1/2 opacity-[0.85]"
                    style={{
                      background: `linear-gradient(180deg, ${aiTheme.jerseyAccent}55 0%, transparent 85%)`,
                      clipPath: 'polygon(12% 100%, 50% 0%, 88% 100%)',
                    }}
                  />
                  <div
                    className="pointer-events-none absolute bottom-0 left-0 right-0 h-[22%]"
                    style={{
                      background: `linear-gradient(0deg, ${aiTheme.jerseyAccent}22 0%, transparent 100%)`,
                    }}
                  />
                </>
              )}
              {!aiTheme && (
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/25 via-neutral-900/80 to-black opacity-25" />
              )}
              
              {/* Capa de la Foto del Usuario */}
              {photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                  src={photo} 
                  alt="Foto del jugador" 
                  className="absolute inset-0 w-full h-full object-cover object-top"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-800">
                  <ImageIcon className="w-20 h-20 text-neutral-600 mb-2" />
                  <span className="text-neutral-500 font-bold uppercase tracking-widest text-sm">Sin Foto</span>
                </div>
              )}

              {/* Degradado inferior para legibilidad del texto */}
              <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black via-black/70 to-transparent"></div>
              
              {/* Elementos de la UI de la figurita (Marcos, Textos, Bandera) */}
              
              {/* Logo "FIFA" o del evento genérico arriba a la derecha */}
              <div className="absolute top-4 right-4 bg-white text-black text-[10px] font-black px-2 py-1 rounded-sm uppercase tracking-wider">
                Mundial 2026
              </div>

              {/* Bandera del país seleccionado arriba a la izquierda */}
              <div className="absolute top-4 left-4 w-12 h-8 rounded-sm overflow-hidden border border-white/20 shadow-lg relative">
                  <Image unoptimized 
                    src={`https://flagcdn.com/w80/${selectedTeamCode === 'gb-eng' ? 'gb' : selectedTeamCode === 'gb-sct' ? 'gb-sct' : selectedTeamCode}.png`}
                  alt={selectedTeam.name}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Contenedor inferior de datos */}
              <div className="absolute bottom-0 left-0 right-0 p-5 flex flex-col">
                
                <div className="flex items-end justify-between border-b-2 border-white/20 pb-2 mb-2">
                  <div className="flex flex-col">
                    <span className="text-emerald-400 font-bold text-xs uppercase tracking-widest mb-1">{position}</span>
                    <h3 className="text-white font-black text-2xl uppercase tracking-tighter leading-none">
                      {name || 'Tu Nombre'}
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

                <div className="flex justify-between items-center text-xs text-neutral-300 font-medium uppercase tracking-wider">
                  <span>{selectedTeam.name}</span>
                  <span>⭐ Rookie</span>
                </div>

              </div>

              {/* Efecto Brilloso Superior (Glossy Overlay) */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/20 pointer-events-none"></div>

            </div>

            <p className="text-neutral-500 text-sm mt-6 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Vista previa en tiempo real
              {aiTheme && <span className="text-emerald-400/80">· Look IA</span>}
            </p>

          </div>
        </div>
      </div>
    </div>
  )
}
