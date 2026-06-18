/** 착수 피드백 — 웹 vibrate, Capacitor WebView에서도 동작 */
export function playMoveFeedback(): void {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate(15)
  }
}

export function playWinFeedback(): void {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate([20, 40, 20])
  }
}
