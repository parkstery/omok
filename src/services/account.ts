import { v4 as uuidv4 } from 'uuid'
import type { UserProfile } from '../core/types'

const PROFILE_KEY = 'omok_profile'

export async function ensureUserProfile(): Promise<UserProfile> {
  const stored = localStorage.getItem(PROFILE_KEY)
  if (stored) {
    const profile = JSON.parse(stored) as UserProfile
    if (profile.onboardingComplete === undefined) {
      profile.onboardingComplete = !profile.nickname.startsWith('Guest-')
    }
    if (!profile.stats) {
      profile.stats = { wins: 0, losses: 0, draws: 0 }
    }
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
    return profile
  }

  const profile: UserProfile = {
    gameId: uuidv4(),
    nickname: `Guest-${uuidv4().slice(0, 4)}`,
    rank: '15급',
    createdAt: Date.now(),
    onboardingComplete: false,
    stats: { wins: 0, losses: 0, draws: 0 },
  }

  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
  return profile
}

export function getPlayAccountBindingNote(): string {
  return 'Google Play 로그인 시 계정당 게임 ID가 1개로 고정됩니다. (출시 빌드에서 연동)'
}
