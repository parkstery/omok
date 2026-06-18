import { describe, expect, it } from 'vitest'
import { checkWin, createEmptyBoard, getWinningLine, placeStone } from '../core/board'
import { applyMove, createInitialState, mustUseRenju, resolveRule } from '../core/game'
import { isRenjuForbidden, isValidRenjuMove } from '../core/renju'

describe('board', () => {
  it('finds winning line of five', () => {
    let board = createEmptyBoard()
    for (let x = 0; x < 4; x++) board = placeStone(board, x, 7, 1)
    board = placeStone(board, 4, 7, 1)
    const line = getWinningLine(board, 4, 7, 1, 15)
    expect(line).toHaveLength(5)
    expect(line?.[4]).toEqual({ x: 4, y: 7 })
  })
})

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

  it('does not mark ordinary positions as forbidden mid-game (10-move board)', () => {
    let board = createEmptyBoard()
    const seq: [number, number, 1 | 2][] = [
      [7, 7, 1],
      [6, 8, 2],
      [8, 6, 1],
      [7, 8, 2],
      [8, 8, 1],
      [8, 7, 2],
      [9, 7, 1],
      [9, 8, 2],
      [7, 9, 1],
      [9, 9, 2],
    ]
    for (const [x, y, c] of seq) board = placeStone(board, x, y, c)

    const wronglyMarked = [
      [5, 8],
      [8, 5],
      [10, 7],
      [10, 8],
      [9, 10],
    ]
    for (const [x, y] of wronglyMarked) {
      expect(isRenjuForbidden(board, x, y, 15)).toBe(false)
    }
  })

  it('forbids overline (6+ in a row)', () => {
    let board = createEmptyBoard()
    for (let x = 0; x < 5; x++) board = placeStone(board, x, 7, 1)
    expect(isRenjuForbidden(board, 5, 7, 15)).toBe(true)
  })

  it('allows a single open three', () => {
    let board = createEmptyBoard()
    board = placeStone(board, 6, 7, 1)
    board = placeStone(board, 7, 7, 1)
    board = placeStone(board, 8, 7, 1)
    expect(isRenjuForbidden(board, 5, 7, 15)).toBe(false)
    expect(isRenjuForbidden(board, 9, 7, 15)).toBe(false)
  })
})
