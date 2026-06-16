import { describe, expect, it } from 'vitest'
import { checkWin, createEmptyBoard, placeStone } from '../core/board'
import { applyMove, createInitialState, mustUseRenju, resolveRule } from '../core/game'
import { isRenjuForbidden, isValidRenjuMove } from '../core/renju'

describe('game rules', () => {
  it('detects five in a row', () => {
    let board = createEmptyBoard()
    for (let x = 0; x < 5; x++) board = placeStone(board, x, 7, 1)
    expect(checkWin(board, 4, 7, 1)).toBe(true)
  })

  it('forces renju for 3kyu and above', () => {
    expect(mustUseRenju('3급')).toBe(true)
    expect(mustUseRenju('4급')).toBe(false)
    expect(mustUseRenju('1단')).toBe(true)
    expect(resolveRule('freestyle', '5급', '2급')).toBe('renju')
  })

  it('applies moves in freestyle', () => {
    const state = createInitialState()
    const next = applyMove(state, 7, 7, 1, 'freestyle')
    expect(next.moves).toHaveLength(1)
    expect(next.turn).toBe(2)
  })
})

describe('renju', () => {
  it('allows white anywhere on empty board', () => {
    const board = createEmptyBoard()
    expect(isValidRenjuMove(board, 7, 7, 2, 15)).toBe(true)
    expect(isRenjuForbidden(board, 7, 7, 15)).toBe(false)
  })
})
