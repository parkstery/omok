import { checkWin, countLine, opponent, placeStone } from '../core/board'
import { getCandidateMoves, isMoveValid } from '../core/game'
import type { Color, GameState, Rule } from '../core/types'
import { BOARD_SIZE } from '../core/types'
import { rankMistakeChance, rankToAiDepth, rankToEngineDepth } from './ranks'

const DIRECTIONS = [
  [1, 0],
  [0, 1],
  [1, 1],
  [1, -1],
] as const

function evaluatePosition(board: number[][], color: Color, size: number): number {
  let score = 0
  const opp = opponent(color)

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (board[y][x] !== color) continue
      for (const [dx, dy] of DIRECTIONS) {
        const len = countLine(board as never, x, y, dx, dy, color, size)
        if (len >= 5) score += 100000
        else if (len === 4) score += 10000
        else if (len === 3) score += 1000
        else if (len === 2) score += 100
        else score += 10
      }
    }
  }

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (board[y][x] !== opp) continue
      for (const [dx, dy] of DIRECTIONS) {
        const len = countLine(board as never, x, y, dx, dy, opp, size)
        if (len >= 4) score -= 8000
        else if (len === 3) score -= 800
        else if (len === 2) score -= 80
      }
    }
  }

  const center = Math.floor(size / 2)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (board[y][x] === color) {
        score -= (Math.abs(x - center) + Math.abs(y - center)) * 2
      }
    }
  }

  return score
}

function minimax(
  board: number[][],
  depth: number,
  alpha: number,
  beta: number,
  maximizing: boolean,
  aiColor: Color,
  rule: Rule,
  size: number,
  state: GameState,
): number {
  const current = maximizing ? aiColor : opponent(aiColor)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (board[y][x] === current && checkWin(board as never, x, y, current, size)) {
        return maximizing ? 999999 - depth : -999999 + depth
      }
    }
  }

  if (depth === 0) return evaluatePosition(board, aiColor, size)

  const moves = getCandidateMoves({ ...state, board: board as never }, rule, size)
  if (moves.length === 0) return 0

  if (maximizing) {
    let maxEval = -Infinity
    for (const { x, y } of moves) {
      if (!isMoveValid(state, x, y, current, rule, size)) continue
      const next = placeStone(board as never, x, y, current)
      const nextState = { ...state, board: next, turn: opponent(current) }
      const ev = minimax(next as never, depth - 1, alpha, beta, false, aiColor, rule, size, nextState)
      maxEval = Math.max(maxEval, ev)
      alpha = Math.max(alpha, ev)
      if (beta <= alpha) break
    }
    return maxEval
  }

  let minEval = Infinity
  for (const { x, y } of moves) {
    if (!isMoveValid(state, x, y, current, rule, size)) continue
    const next = placeStone(board as never, x, y, current)
    const nextState = { ...state, board: next, turn: opponent(current) }
    const ev = minimax(next as never, depth - 1, alpha, beta, true, aiColor, rule, size, nextState)
    minEval = Math.min(minEval, ev)
    beta = Math.min(beta, ev)
    if (beta <= alpha) break
  }
  return minEval
}

export function findEngineMove(
  state: GameState,
  rule: Rule,
  rank: string,
  aiColor: Color,
  type: 'engine' | 'ai',
): { x: number; y: number } | null {
  const size = state.board.length || BOARD_SIZE
  const depth = type === 'engine' ? rankToEngineDepth(rank) : rankToAiDepth(rank)
  const moves = getCandidateMoves(state, rule, size)
  if (moves.length === 0) return null

  const mistake = rankMistakeChance(rank, type)
  if (Math.random() < mistake) {
    return moves[Math.floor(Math.random() * moves.length)]
  }

  let bestScore = -Infinity
  let bestMoves: { x: number; y: number }[] = []

  for (const move of moves) {
    if (!isMoveValid(state, move.x, move.y, aiColor, rule, size)) continue
    const nextBoard = placeStone(state.board, move.x, move.y, aiColor)
    const nextState = { ...state, board: nextBoard, turn: opponent(aiColor) }
    const score = minimax(
      nextBoard as never,
      depth - 1,
      -Infinity,
      Infinity,
      false,
      aiColor,
      rule,
      size,
      nextState,
    )
    if (score > bestScore) {
      bestScore = score
      bestMoves = [move]
    } else if (score === bestScore) {
      bestMoves.push(move)
    }
  }

  if (bestMoves.length === 0) return moves[0]
  return bestMoves[Math.floor(Math.random() * bestMoves.length)]
}
