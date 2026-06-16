import { create } from 'zustand'
import type { UserProfile } from '../core/types'
import { ensureUserProfile } from '../services/account'

interface UserStore {
  profile: UserProfile | null
  ready: boolean
  init: () => Promise<void>
  setNickname: (nickname: string) => void
  setRank: (rank: string) => void
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
    localStorage.setItem('omok_profile', JSON.stringify(next))
  },

  setRank: (rank) => {
    const { profile } = get()
    if (!profile) return
    const next = { ...profile, rank }
    set({ profile: next })
    localStorage.setItem('omok_profile', JSON.stringify(next))
  },
}))
