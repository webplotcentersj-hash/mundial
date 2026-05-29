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

function makeNoiseBuffer(ctx: AudioContext, seconds: number, pink = false) {
  const length = Math.floor(ctx.sampleRate * seconds)
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  if (!pink) {
    for (let i = 0; i < length; i++) {
      data[i] = Math.random() * 2 - 1
    }
    return buffer
  }
  let b0 = 0
  let b1 = 0
  let b2 = 0
  for (let i = 0; i < length; i++) {
    const white = Math.random() * 2 - 1
    b0 = 0.99886 * b0 + white * 0.0555179
    b1 = 0.99332 * b1 + white * 0.0750759
    b2 = 0.969 * b2 + white * 0.153852
    data[i] = (b0 + b1 + b2 + white * 0.3105536) * 0.22
  }
  return buffer
}

function connectNoiseBurst(
  ctx: AudioContext,
  dest: AudioNode,
  t0: number,
  opts: { start: number; attack: number; peak: number; decay: number; freq: number; q: number; type?: BiquadFilterType },
) {
  const { start, attack, peak, decay, freq, q, type = 'bandpass' } = opts
  const src = ctx.createBufferSource()
  src.buffer = makeNoiseBuffer(ctx, decay + 0.4, true)
  const filter = ctx.createBiquadFilter()
  filter.type = type
  filter.frequency.value = freq
  filter.Q.value = q
  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0.0001, t0 + start)
  gain.gain.linearRampToValueAtTime(peak, t0 + start + attack)
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + start + decay)
  src.connect(filter).connect(gain).connect(dest)
  src.start(t0 + start)
  src.stop(t0 + start + decay + 0.05)
}

/** Festejo de gol: red, hinchada creciente y clímax tipo estadio (Web Audio). */
export function playGoalSound(volume = 0.62) {
  const ctx = getAudioContext()
  if (!ctx) return

  const t0 = ctx.currentTime
  const master = ctx.createGain()
  master.gain.value = Math.min(1, Math.max(0, volume))
  master.connect(ctx.destination)

  const limiter = ctx.createGain()
  limiter.gain.value = 0.92
  limiter.connect(master)

  // --- Impacto en la red ---
  const net = ctx.createOscillator()
  const netGain = ctx.createGain()
  net.type = 'sine'
  net.frequency.setValueAtTime(180, t0)
  net.frequency.exponentialRampToValueAtTime(55, t0 + 0.12)
  netGain.gain.setValueAtTime(1.1, t0)
  netGain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.35)
  net.connect(netGain).connect(limiter)
  net.start(t0)
  net.stop(t0 + 0.38)

  const rattle = ctx.createOscillator()
  const rattleGain = ctx.createGain()
  rattle.type = 'square'
  rattle.frequency.setValueAtTime(920, t0 + 0.02)
  rattle.frequency.exponentialRampToValueAtTime(240, t0 + 0.14)
  rattleGain.gain.setValueAtTime(0.0001, t0 + 0.02)
  rattleGain.gain.linearRampToValueAtTime(0.18, t0 + 0.04)
  rattleGain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.2)
  rattle.connect(rattleGain).connect(limiter)
  rattle.start(t0 + 0.02)
  rattle.stop(t0 + 0.22)

  // --- Hinchada: capas superpuestas (explosión + oleada + clímax) ---
  connectNoiseBurst(ctx, limiter, t0, {
    start: 0.05,
    attack: 0.08,
    peak: 0.75,
    decay: 1.05,
    freq: 680,
    q: 0.55,
  })
  connectNoiseBurst(ctx, limiter, t0, {
    start: 0.12,
    attack: 0.18,
    peak: 0.95,
    decay: 1.85,
    freq: 420,
    q: 0.45,
  })
  connectNoiseBurst(ctx, limiter, t0, {
    start: 0.28,
    attack: 0.22,
    peak: 0.7,
    decay: 2.1,
    freq: 1100,
    q: 0.35,
    type: 'highpass',
  })

  // --- "Goooool" sintético: acorde mayor ascendente ---
  const notes = [392, 494, 587, 784]
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator()
    const g = ctx.createGain()
    osc.type = i === notes.length - 1 ? 'triangle' : 'sine'
    const start = 0.08 + i * 0.07
    osc.frequency.setValueAtTime(freq * 0.92, t0 + start)
    osc.frequency.exponentialRampToValueAtTime(freq * 1.08, t0 + start + 0.45)
    g.gain.setValueAtTime(0.0001, t0 + start)
    g.gain.linearRampToValueAtTime(0.22 - i * 0.03, t0 + start + 0.12)
    g.gain.setValueAtTime(0.16 - i * 0.02, t0 + start + 0.55)
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + start + 1.15)
    osc.connect(g).connect(limiter)
    osc.start(t0 + start)
    osc.stop(t0 + start + 1.2)
  })

  // --- Silbato de árbitro / festejo corto al pico ---
  const whistle = ctx.createOscillator()
  const whistleGain = ctx.createGain()
  whistle.type = 'sine'
  whistle.frequency.setValueAtTime(2100, t0 + 0.55)
  whistle.frequency.linearRampToValueAtTime(2800, t0 + 0.72)
  whistle.frequency.linearRampToValueAtTime(2400, t0 + 0.95)
  whistleGain.gain.setValueAtTime(0.0001, t0 + 0.55)
  whistleGain.gain.linearRampToValueAtTime(0.14, t0 + 0.62)
  whistleGain.gain.setValueAtTime(0.12, t0 + 0.78)
  whistleGain.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.05)
  whistle.connect(whistleGain).connect(limiter)
  whistle.start(t0 + 0.55)
  whistle.stop(t0 + 1.08)

  // --- Segunda oleada de hinchada (eco de festejo) ---
  connectNoiseBurst(ctx, limiter, t0, {
    start: 0.85,
    attack: 0.15,
    peak: 0.55,
    decay: 1.4,
    freq: 520,
    q: 0.5,
  })

  // --- Bombo de celebración ---
  const drumHits = [0.35, 0.55, 0.75, 0.95]
  drumHits.forEach((hit, idx) => {
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.type = 'sine'
    o.frequency.setValueAtTime(95, t0 + hit)
    o.frequency.exponentialRampToValueAtTime(48, t0 + hit + 0.09)
    g.gain.setValueAtTime(0.55 - idx * 0.06, t0 + hit)
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + hit + 0.14)
    o.connect(g).connect(limiter)
    o.start(t0 + hit)
    o.stop(t0 + hit + 0.16)
  })
}
