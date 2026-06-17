import type { Color, GameState, Rule } from '../core/types'
import { findEngineMoveAsync } from './computer'

export type ComputerMoveRequest = {
  board: GameState['board']
  moves: GameState['moves']
  rule: Rule
  rank: string
  aiColor: Color
  type: 'engine' | 'ai'
}

export type ComputerMoveResponse =
  | { ok: true; move: { x: number; y: number } }
  | { ok: false; error: string }

self.onmessage = (event: MessageEvent<ComputerMoveRequest>) => {
  const { board, moves, rule, rank, aiColor, type } = event.data
  const state: GameState = {
    board,
    moves,
    turn: aiColor,
    result: null,
    forbidden: [],
    lastMove: moves.length > 0 ? { x: moves[moves.length - 1].x, y: moves[moves.length - 1].y } : null,
  }

  void findEngineMoveAsync(state, rule, rank, aiColor, type)
    .then((move) => {
      if (!move) {
        const response: ComputerMoveResponse = { ok: false, error: 'no move' }
        self.postMessage(response)
        return
      }
      const response: ComputerMoveResponse = { ok: true, move }
      self.postMessage(response)
    })
    .catch((error: unknown) => {
      const response: ComputerMoveResponse = {
        ok: false,
        error: error instanceof Error ? error.message : 'unknown',
      }
      self.postMessage(response)
    })
}
