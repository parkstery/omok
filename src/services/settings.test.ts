import { describe, expect, it, beforeEach, vi } from 'vitest'
import { loadSettings, saveSettings } from './settings'

describe('settings', () => {
  const store: Record<string, string> = {}

  beforeEach(() => {
    for (const key of Object.keys(store)) delete store[key]
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => store[key] ?? null,
      setItem: (key: string, value: string) => {
        store[key] = value
      },
      removeItem: (key: string) => {
        delete store[key]
      },
      clear: () => {
        for (const key of Object.keys(store)) delete store[key]
      },
    })
  })

  it('loads defaults when empty', () => {
    expect(loadSettings()).toEqual({
      soundEnabled: true,
      hapticEnabled: true,
      boardScale: 'auto',
    })
  })

  it('persists user preferences', () => {
    saveSettings({ soundEnabled: false, hapticEnabled: true, boardScale: 'large' })
    expect(loadSettings().soundEnabled).toBe(false)
    expect(loadSettings().boardScale).toBe('large')
  })
})
