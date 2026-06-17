import { isMoveValid } from '../core/game'
import type { Color, GameState, Rule } from '../core/types'
import { findGomokuLibMove } from './gomokuAdapter'
import { findRapfiMove } from './rapfi/rapfiClient'

export async function findEngineMoveAsync(
  state: GameState,
  rule: Rule,
  rank: string,
  aiColor: Color,
  type: 'engine' | 'ai',
): Promise<{ x: number; y: number } | null> {
    const rapfiMove = await findRapfiMove(state, rule, rank, type)
  if (rapfiMove && isMoveValid(state, rapfiMove.x, rapfiMove.y, aiColor, rule, state.board.length)) {
    return rapfiMove
  }

  return findGomokuLibMove(state, rule, rank, aiColor, type)
}

export function findEngineMove(
  state: GameState,
  rule: Rule,
  rank: string,
  aiColor: Color,
  type: 'engine' | 'ai',
): { x: number; y: number } | null {
  return findGomokuLibMove(state, rule, rank, aiColor, type)
}
