const audioContext = typeof window !== 'undefined' ? new (window.AudioContext || (window as any).webkitAudioContext)() : null

export function playTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume = 0.3) {
  if (!audioContext) return
  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()

  oscillator.type = type
  oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime)
  gainNode.gain.setValueAtTime(volume, audioContext.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration)

  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)

  oscillator.start(audioContext.currentTime)
  oscillator.stop(audioContext.currentTime + duration)
}

export function playSpinSound() {
  playTone(200, 0.15, 'sawtooth', 0.15)
  setTimeout(() => playTone(280, 0.12, 'sine', 0.2), 100)
  setTimeout(() => playTone(350, 0.1, 'sine', 0.15), 200)
}

export function playSelectSound() {
  playTone(500, 0.08, 'sine', 0.25)
  setTimeout(() => playTone(700, 0.1, 'sine', 0.2), 60)
}

export function playWinSound() {
  playTone(400, 0.12, 'sine', 0.25)
  setTimeout(() => playTone(500, 0.12, 'sine', 0.25), 100)
  setTimeout(() => playTone(600, 0.12, 'sine', 0.25), 200)
  setTimeout(() => playTone(800, 0.2, 'sine', 0.2), 300)
}

export function playClickSound() {
  playTone(1000, 0.05, 'square', 0.1)
}

export function resumeAudioContext() {
  if (audioContext && audioContext.state === 'suspended') {
    audioContext.resume()
  }
}
