let audioCtx: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  try {
    if (!audioCtx) {
      audioCtx = new AudioContext()
    }
    if (audioCtx.state === 'suspended') {
      void audioCtx.resume()
    }
    return audioCtx
  } catch {
    return null
  }
}

/** Sonido corto estilo gol / red + hinchada (Web Audio, sin archivo externo). */
export function playGoalSound(volume = 0.55) {
  const ctx = getAudioContext()
  if (!ctx) return

  const t0 = ctx.currentTime
  const master = ctx.createGain()
  master.gain.value = Math.min(1, Math.max(0, volume))
  master.connect(ctx.destination)

  const thumpOsc = ctx.createOscillator()
  const thumpGain = ctx.createGain()
  thumpOsc.type = 'sine'
  thumpOsc.frequency.setValueAtTime(140, t0)
  thumpOsc.frequency.exponentialRampToValueAtTime(48, t0 + 0.18)
  thumpGain.gain.setValueAtTime(0.9, t0)
  thumpGain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.42)
  thumpOsc.connect(thumpGain).connect(master)
  thumpOsc.start(t0)
  thumpOsc.stop(t0 + 0.45)

  const bufferSize = Math.floor(ctx.sampleRate * 1.35)
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1
  }
  const noise = ctx.createBufferSource()
  noise.buffer = buffer
  const bandpass = ctx.createBiquadFilter()
  bandpass.type = 'bandpass'
  bandpass.frequency.value = 920
  bandpass.Q.value = 0.65
  const noiseGain = ctx.createGain()
  noiseGain.gain.setValueAtTime(0.001, t0)
  noiseGain.gain.linearRampToValueAtTime(0.55, t0 + 0.06)
  noiseGain.gain.exponentialRampToValueAtTime(0.001, t0 + 1.25)
  noise.connect(bandpass).connect(noiseGain).connect(master)
  noise.start(t0)
  noise.stop(t0 + 1.3)

  const cheer = ctx.createOscillator()
  const cheerGain = ctx.createGain()
  cheer.type = 'triangle'
  cheer.frequency.setValueAtTime(392, t0 + 0.04)
  cheer.frequency.exponentialRampToValueAtTime(784, t0 + 0.32)
  cheerGain.gain.setValueAtTime(0.001, t0 + 0.04)
  cheerGain.gain.linearRampToValueAtTime(0.35, t0 + 0.1)
  cheerGain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.65)
  cheer.connect(cheerGain).connect(master)
  cheer.start(t0 + 0.04)
  cheer.stop(t0 + 0.7)
}
