import { create } from 'zustand'
import type { UserProfile } from '../core/types'
import {
  applyRankedWin,
  DEFAULT_RANK,
  isSameRankMatch,
  winsRequiredForPromotion,
  type PromotionResult,
} from '../core/rank'
import { ensureUserProfile } from '../services/account'

interface UserStore {
  profile: UserProfile | null
  ready: boolean
  init: () => Promise<void>
  setNickname: (nickname: string) => void
  completeOnboarding: (nickname: string) => void
  recordGameResult: (result: 'win' | 'loss' | 'draw') => void
  recordRankedComputerResult: (
    opponentRank: string,
    won: boolean,
  ) => PromotionResult | null
  getPromotionProgress: () => { winsAtRank: number; winsRequired: number }
}

function saveProfile(profile: UserProfile) {
  localStorage.setItem('omok_profile', JSON.stringify(profile))
}

function normalizeProfile(profile: UserProfile): UserProfile {
  return {
    ...profile,
    rank: profile.rank || DEFAULT_RANK,
    winsAtRank: profile.winsAtRank ?? 0,
    stats: profile.stats ?? { wins: 0, losses: 0, draws: 0 },
  }
}

export const useUserStore = create<UserStore>((set, get) => ({
  profile: null,
  ready: false,

  init: async () => {
    const profile = normalizeProfile(await ensureUserProfile())
    set({ profile, ready: true })
  },

  setNickname: (nickname) => {
    const { profile } = get()
    if (!profile) return
    const next = { ...profile, nickname }
    set({ profile: next })
    saveProfile(next)
  },

  completeOnboarding: (nickname) => {
    const { profile } = get()
    if (!profile) return
    const next = normalizeProfile({
      ...profile,
      nickname,
      rank: DEFAULT_RANK,
      winsAtRank: 0,
      onboardingComplete: true,
    })
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

  recordRankedComputerResult: (opponentRank, won) => {
    const { profile } = get()
    if (!profile || !isSameRankMatch(profile.rank, opponentRank)) return null

    if (!won) {
      const next = {
        ...profile,
        winsAtRank: 0,
        stats: { ...profile.stats, losses: profile.stats.losses + 1 },
      }
      set({ profile: next })
      saveProfile(next)
      return null
    }

    const promotion = applyRankedWin(profile.rank, profile.winsAtRank ?? 0)
    const next = {
      ...profile,
      rank: promotion.newRank,
      winsAtRank: promotion.winsAtRank,
      stats: { ...profile.stats, wins: profile.stats.wins + 1 },
    }
    set({ profile: next })
    saveProfile(next)
    return promotion
  },

  getPromotionProgress: () => {
    const { profile } = get()
    const rank = profile?.rank ?? DEFAULT_RANK
    return {
      winsAtRank: profile?.winsAtRank ?? 0,
      winsRequired: winsRequiredForPromotion(rank),
    }
  },
}))
