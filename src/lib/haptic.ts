export function vibrate(pattern: number | number[] = 10) {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern)
    } catch {
      // ignore haptic errors
    }
  }
}

export function lightImpact() {
  vibrate(10)
}

export function mediumImpact() {
  vibrate(20)
}

export function heavyImpact() {
  vibrate(30)
}

export function successImpact() {
  vibrate([10, 30, 10, 30])
}

export function warningImpact() {
  vibrate([20, 20, 20])
}
