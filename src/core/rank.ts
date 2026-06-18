/** 15급 → 1급 → 1단 → 9단 */
export const RANKS = [
  '15급', '14급', '13급', '12급', '11급', '10급', '9급', '8급', '7급', '6급',
  '5급', '4급', '3급', '2급', '1급',
  '1단', '2단', '3단', '4단', '5단', '6단', '7단', '8단', '9단',
] as const

export const DEFAULT_RANK = '15급'

export function winsRequiredForPromotion(rank: string): number {
  return rank.endsWith('단') ? 3 : 2
}

export function getNextRank(rank: string): string | null {
  const idx = RANKS.indexOf(rank as (typeof RANKS)[number])
  if (idx < 0 || idx >= RANKS.length - 1) return null
  return RANKS[idx + 1]
}

export function isSameRankMatch(playerRank: string, opponentRank: string): boolean {
  return playerRank === opponentRank
}

export interface PromotionResult {
  promoted: boolean
  newRank: string
  winsAtRank: number
  winsRequired: number
}

/** 같은 급·단 AI 대국 승리 시 호출 */
export function applyRankedWin(currentRank: string, winsAtRank: number): PromotionResult {
  const required = winsRequiredForPromotion(currentRank)
  const nextWins = winsAtRank + 1

  if (nextWins < required) {
    return { promoted: false, newRank: currentRank, winsAtRank: nextWins, winsRequired: required }
  }

  const nextRank = getNextRank(currentRank)
  if (!nextRank) {
    return { promoted: false, newRank: currentRank, winsAtRank: required, winsRequired: required }
  }

  return {
    promoted: true,
    newRank: nextRank,
    winsAtRank: 0,
    winsRequired: winsRequiredForPromotion(nextRank),
  }
}
