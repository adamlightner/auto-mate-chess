import { useCallback, useRef } from 'react'

type SoundType = 'move' | 'capture' | 'check' | 'gameOver'

function createAudioContext(): AudioContext | null {
  try {
    return new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
  } catch {
    return null
  }
}

function playNoiseBurst(ctx: AudioContext, volume: number, durationMs: number) {
  const duration = durationMs / 1000
  const bufferSize = Math.ceil(ctx.sampleRate * duration)
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) {
    // Decaying noise envelope
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 1.5)
  }

  const source = ctx.createBufferSource()
  source.buffer = buffer

  const gain = ctx.createGain()
  gain.gain.value = volume

  // High-pass filter for a woody click character
  const filter = ctx.createBiquadFilter()
  filter.type = 'highpass'
  filter.frequency.value = 800

  source.connect(filter)
  filter.connect(gain)
  gain.connect(ctx.destination)
  source.start(ctx.currentTime)
}

function playTone(ctx: AudioContext, freq: number, volume: number, startOffset: number, durationMs: number) {
  const duration = durationMs / 1000
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.frequency.value = freq
  osc.type = 'sine'

  gain.gain.setValueAtTime(0, ctx.currentTime + startOffset)
  gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + startOffset + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startOffset + duration)

  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(ctx.currentTime + startOffset)
  osc.stop(ctx.currentTime + startOffset + duration + 0.01)
}

export function useSound(enabled: boolean = true) {
  const ctxRef = useRef<AudioContext | null>(null)

  function getCtx(): AudioContext | null {
    if (!ctxRef.current) {
      ctxRef.current = createAudioContext()
    }
    if (ctxRef.current?.state === 'suspended') {
      ctxRef.current.resume()
    }
    return ctxRef.current
  }

  const play = useCallback(
    (type: SoundType) => {
      if (!enabled) return
      const ctx = getCtx()
      if (!ctx) return

      switch (type) {
        case 'move':
          playNoiseBurst(ctx, 0.35, 28)
          break
        case 'capture':
          playNoiseBurst(ctx, 0.55, 38)
          break
        case 'check':
          playNoiseBurst(ctx, 0.35, 28)
          playTone(ctx, 880, 0.25, 0.04, 120)
          break
        case 'gameOver':
          playTone(ctx, 523, 0.3, 0.0, 200)  // C5
          playTone(ctx, 440, 0.3, 0.22, 200) // A4
          playTone(ctx, 349, 0.3, 0.44, 300) // F4
          break
      }
    },
    [enabled],
  )

  return { play }
}
