import { describe, expect, it } from 'vitest'
import { applyMove, createInitialState } from '../core/game'
import { buildStateFromRoom, parseRoomData } from './network'

describe('network room parsing', () => {
  it('parses moves from object map sorted by timestamp', () => {
    const room = parseRoomData({
      status: 'playing',
      host: { id: 'h1', name: 'Host', rank: '5급' },
      guest: null,
      rule: 'freestyle',
      boardSize: 15,
      result: null,
      moves: {
        b: { x: 8, y: 7, color: 2, ts: 200 },
        a: { x: 7, y: 7, color: 1, ts: 100 },
      },
      updatedAt: 1,
    })
    expect(room?.moves).toHaveLength(2)
    expect(room?.moves[0].color).toBe(1)
  })

  it('builds game state from room moves', () => {
    const room = parseRoomData({
      status: 'playing',
      host: { id: 'h1', name: 'Host', rank: '5급' },
      guest: { id: 'g1', name: 'Guest', rank: '5급' },
      rule: 'freestyle',
      boardSize: 15,
      result: null,
      moves: [{ x: 7, y: 7, color: 1, ts: 1 }],
      updatedAt: 1,
    })
    expect(room).not.toBeNull()
    const state = buildStateFromRoom(room!)
    expect(state.moves).toHaveLength(1)
    expect(state.turn).toBe(2)
  })

  it('applies remote result when rebuilding', () => {
    let state = createInitialState()
    state = applyMove(state, 7, 7, 1, 'freestyle')
    state = applyMove(state, 6, 7, 2, 'freestyle')

    const room = parseRoomData({
      status: 'finished',
      host: { id: 'h1', name: 'A', rank: '1급' },
      guest: { id: 'g1', name: 'B', rank: '1급' },
      rule: 'freestyle',
      boardSize: 15,
      result: 'white_win',
      moves: state.moves,
      updatedAt: 2,
    })

    const rebuilt = buildStateFromRoom(room!)
    expect(rebuilt.result).toBe('white_win')
  })
})
