import { create } from 'zustand'
import { loadSettings, saveSettings, type AppSettings } from '../services/settings'

interface SettingsStore {
  settings: AppSettings
  setSoundEnabled: (enabled: boolean) => void
  setHapticEnabled: (enabled: boolean) => void
  setBoardScale: (scale: AppSettings['boardScale']) => void
}

function persist(settings: AppSettings) {
  saveSettings(settings)
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  settings: loadSettings(),

  setSoundEnabled: (soundEnabled) => {
    const settings = { ...get().settings, soundEnabled }
    set({ settings })
    persist(settings)
  },

  setHapticEnabled: (hapticEnabled) => {
    const settings = { ...get().settings, hapticEnabled }
    set({ settings })
    persist(settings)
  },

  setBoardScale: (boardScale) => {
    const settings = { ...get().settings, boardScale }
    set({ settings })
    persist(settings)
  },
}))
