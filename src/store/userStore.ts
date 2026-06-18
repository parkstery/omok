import { create } from 'zustand'
import type { UserProfile } from '../core/types'
import { ensureUserProfile } from '../services/account'

interface UserStore {
  profile: UserProfile | null
  ready: boolean
  init: () => Promise<void>
  setNickname: (nickname: string) => void
  setRank: (rank: string) => void
  completeOnboarding: (nickname: string, rank: string) => void
  recordGameResult: (result: 'win' | 'loss' | 'draw') => void
}

function saveProfile(profile: UserProfile) {
  localStorage.setItem('omok_profile', JSON.stringify(profile))
}

export const useUserStore = create<UserStore>((set, get) => ({
  profile: null,
  ready: false,

  init: async () => {
    const profile = await ensureUserProfile()
    set({ profile, ready: true })
  },

  setNickname: (nickname) => {
    const { profile } = get()
    if (!profile) return
    const next = { ...profile, nickname }
    set({ profile: next })
    saveProfile(next)
  },

  setRank: (rank) => {
    const { profile } = get()
    if (!profile) return
    const next = { ...profile, rank }
    set({ profile: next })
    saveProfile(next)
  },

  completeOnboarding: (nickname, rank) => {
    const { profile } = get()
    if (!profile) return
    const next = { ...profile, nickname, rank, onboardingComplete: true }
    set({ profile: next })
    saveProfile(next)
  },

  recordGameResult: (result) => {
    const { profile } = get()
    if (!profile) return
    const stats = { ...profile.stats }
    if (result === 'win') stats.wins++
    else if (result === 'loss') stats.losses++
    else stats.draws++
    const next = { ...profile, stats }
    set({ profile: next })
    saveProfile(next)
  },
}))
