import { describe, expect, it } from 'vitest'
import { applyRankedWin, DEFAULT_RANK, getNextRank, winsRequiredForPromotion } from './rank'

describe('rank promotion', () => {
  it('starts at 15급 with 2 wins required', () => {
    expect(winsRequiredForPromotion(DEFAULT_RANK)).toBe(2)
  })

  it('promotes after 2 wins at same kyu', () => {
    const first = applyRankedWin('15급', 0)
    expect(first.promoted).toBe(false)
    expect(first.winsAtRank).toBe(1)

    const second = applyRankedWin('15급', first.winsAtRank)
    expect(second.promoted).toBe(true)
    expect(second.newRank).toBe('14급')
    expect(second.winsAtRank).toBe(0)
  })

  it('requires 3 wins for dan ranks', () => {
    expect(winsRequiredForPromotion('1단')).toBe(3)
    let wins = 0
    let rank = '1단'
    for (let i = 0; i < 2; i++) {
      const r = applyRankedWin(rank, wins)
      expect(r.promoted).toBe(false)
      wins = r.winsAtRank
    }
    const promoted = applyRankedWin(rank, wins)
    expect(promoted.promoted).toBe(true)
    expect(promoted.newRank).toBe('2단')
  })

  it('does not promote beyond 9단', () => {
    expect(getNextRank('9단')).toBeNull()
    const r = applyRankedWin('9단', 2)
    expect(r.promoted).toBe(false)
  })
})
