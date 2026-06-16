import {
  checkWin,
  createEmptyBoard,
  getEmptyCells,
  isBoardFull,
  isEmpty,
  opponent,
  placeStone,
} from './board'
import { getRenjuForbiddenPoints, isRenjuForbidden, isValidRenjuMove } from './renju'
import type { Color, GameConfig, GameResult, GameState, Move, Rule } from './types'
import { BOARD_SIZE } from './types'

export function createInitialState(size = BOARD_SIZE): GameState {
  return {
    board: createEmptyBoard(size),
    moves: [],
    turn: 1,
    result: null,
    forbidden: [],
    lastMove: null,
  }
}

export function mustUseRenju(rankLabel: string): boolean {
  const dan = rankLabel.endsWith('단')
  if (dan) return true
  const kyu = parseInt(rankLabel.replace('급', ''), 10)
  return !Number.isNaN(kyu) && kyu <= 3
}

export function resolveRule(requested: Rule, blackRank: string, whiteRank: string): Rule {
  if (mustUseRenju(blackRank) || mustUseRenju(whiteRank)) return 'renju'
  return requested
}

export function isMoveValid(
  state: GameState,
  x: number,
  y: number,
  color: Color,
  rule: Rule,
  size = BOARD_SIZE,
): boolean {
  if (state.result) return false
  if (!isEmpty(state.board, x, y)) return false
  if (rule === 'renju' && color === 1) return isValidRenjuMove(state.board, x, y, color, size)
  return true
}

export function applyMove(
  state: GameState,
  x: number,
  y: number,
  color: Color,
  rule: Rule,
  size = BOARD_SIZE,
): GameState {
  if (!isMoveValid(state, x, y, color, rule, size)) return state

  const board = placeStone(state.board, x, y, color)
  const move: Move = { x, y, color, ts: Date.now() }
  const moves = [...state.moves, move]

  let result: GameResult = null
  if (checkWin(board, x, y, color, size)) {
    result = color === 1 ? 'black_win' : 'white_win'
  } else if (isBoardFull(board, size)) {
    result = 'draw'
  }

  const turn = opponent(color)
  const forbidden =
    rule === 'renju' && turn === 1 && !result ? getRenjuForbiddenPoints(board, size) : []

  return {
    board,
    moves,
    turn,
    result,
    forbidden,
    lastMove: { x, y },
  }
}

export function getForbiddenPreview(
  state: GameState,
  rule: Rule,
  size = BOARD_SIZE,
): { x: number; y: number }[] {
  if (rule !== 'renju' || state.turn !== 1 || state.result) return []
  return getRenjuForbiddenPoints(state.board, size)
}

export function pickPlayerColor(choice: Color | 'random'): Color {
  if (choice === 'random') return Math.random() < 0.5 ? 1 : 2
  return choice
}

export function defaultConfig(partial: Partial<GameConfig> = {}): GameConfig {
  return {
    rule: 'freestyle',
    boardSize: BOARD_SIZE,
    opponentType: 'human',
    playerColor: 1,
    blackPlayer: '흑',
    whitePlayer: '백',
    blackRank: '15급',
    whiteRank: '15급',
    isLocal: true,
    isSpectate: false,
    saveRecord: true,
    ...partial,
  }
}

export function getCandidateMoves(state: GameState, rule: Rule, size = BOARD_SIZE): { x: number; y: number }[] {
  const empties = getEmptyCells(state.board, size)
  if (state.moves.length === 0) {
    const center = Math.floor(size / 2)
    return [{ x: center, y: center }]
  }

  const near = new Set<string>()
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (state.board[y][x] === 0) continue
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          const nx = x + dx
          const ny = y + dy
          if (nx >= 0 && ny >= 0 && nx < size && ny < size && state.board[ny][nx] === 0) {
            near.add(`${nx},${ny}`)
          }
        }
      }
    }
  }

  const candidates = [...near].map((key) => {
    const [x, y] = key.split(',').map(Number)
    return { x, y }
  })

  const filtered = candidates.filter(({ x, y }) => isMoveValid(state, x, y, state.turn, rule, size))
  return filtered.length > 0 ? filtered : empties.filter(({ x, y }) => isMoveValid(state, x, y, state.turn, rule, size))
}

export { isRenjuForbidden }
