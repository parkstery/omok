import { getSettingsSnapshot } from './settings'

let audioCtx: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!audioCtx) {
    try {
      audioCtx = new AudioContext()
    } catch {
      return null
    }
  }
  return audioCtx
}

function playTone(freq: number, durationMs: number, volume = 0.08): void {
  if (!getSettingsSnapshot().soundEnabled) return
  const ctx = getAudioContext()
  if (!ctx) return

  void ctx.resume().then(() => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = freq
    gain.gain.value = volume
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + durationMs / 1000)
  })
}

/** 착수 피드백 */
export function playMoveFeedback(): void {
  const { hapticEnabled, soundEnabled } = getSettingsSnapshot()
  if (hapticEnabled && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate(15)
  }
  if (soundEnabled) playTone(520, 50)
}

export function playWinFeedback(): void {
  const { hapticEnabled, soundEnabled } = getSettingsSnapshot()
  if (hapticEnabled && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate([20, 40, 20])
  }
  if (soundEnabled) {
    playTone(660, 80)
    setTimeout(() => playTone(880, 100), 90)
  }
}
