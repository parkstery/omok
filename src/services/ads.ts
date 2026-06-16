let lastInterstitialAt = 0
const COOLDOWN_MS = 30_000

export function showBannerPlaceholder(): void {
  // AdMob 배너는 Capacitor 네이티브 플러그인 연동 시 교체
}

export async function showInterstitialAd(): Promise<void> {
  const now = Date.now()
  if (now - lastInterstitialAt < COOLDOWN_MS) return
  lastInterstitialAt = now
  // AdMob 전면 광고 플레이스홀더
}

export function getAdNotice(): string {
  return '무료 앱 · 배너/대국 종료 전면 광고'
}
