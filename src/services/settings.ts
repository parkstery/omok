export interface AppSettings {
  soundEnabled: boolean
  hapticEnabled: boolean
  boardScale: 'auto' | 'large'
}

const KEY = 'omok_settings'

const defaults: AppSettings = {
  soundEnabled: true,
  hapticEnabled: true,
  boardScale: 'auto',
}

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { ...defaults }
    return { ...defaults, ...(JSON.parse(raw) as Partial<AppSettings>) }
  } catch {
    return { ...defaults }
  }
}

export function saveSettings(settings: AppSettings): void {
  localStorage.setItem(KEY, JSON.stringify(settings))
}

export function getSettingsSnapshot(): AppSettings {
  return loadSettings()
}
