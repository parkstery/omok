import {
  GomokuSolution,
  createGomokuSearcher,
  type IGomokuMover,
  type IShapeScoreMap,
} from '@algorithm.ts/gomoku'
import { checkWin, getEmptyCells, opponent, placeStone } from '../core/board'
import { isMoveValid } from '../core/game'
import type { Color, GameState, Rule, Stone } from '../core/types'
import { BOARD_SIZE } from '../core/types'
import { rankIndex, rankMistakeChance } from './ranks'

/** 라이브러리: 0=백, 1=흑 / 앱: 1=흑, 2=백 */
export function toLibPlayer(color: Color): 0 | 1 {
  return color === 1 ? 1 : 0
}

export function fromLibCoords(r: number, c: number): { x: number; y: number } {
  return { x: c, y: r }
}

function boardToPieces(board: Stone[][]): { r: number; c: number; p: number }[] {
  const pieces: { r: number; c: number; p: number }[] = []
  for (let y = 0; y < board.length; y++) {
    for (let x = 0; x < board[y].length; x++) {
      const stone = board[y][x]
      if (stone === 1) pieces.push({ r: y, c: x, p: 1 })
      else if (stone === 2) pieces.push({ r: y, c: x, p: 0 })
    }
  }
  return pieces
}

function createRankSearcher(
  mover: IGomokuMover,
  scoreMap: Readonly<IShapeScoreMap>,
  rank: string,
  type: 'engine' | 'ai',
  candidateGrowthFactor: number,
) {
  const idx = rankIndex(rank)
  let deep = 16
  if (idx <= 4) deep = 4
  else if (idx <= 9) deep = 6
  else if (idx <= 14) deep = 10
  else if (idx <= 19) deep = 12
  if (type === 'engine') deep = Math.max(4, deep - 2)

  const mid = Math.min(8, deep)
  const shallow = Math.min(4, deep)

  return createGomokuSearcher({
    narrowSearcherOptions: [
      {
        MAX_SEARCH_DEPTH: 2,
        MAX_CANDIDATE_COUNT: 10,
        MIN_PROMOTION_SCORE: scoreMap.con[2][2] * 2,
        CANDIDATE_GROWTH_FACTOR: candidateGrowthFactor,
      },
      {
        MAX_SEARCH_DEPTH: shallow,
        MAX_CANDIDATE_COUNT: 6,
        MIN_PROMOTION_SCORE: scoreMap.con[3][1] * 2,
        CANDIDATE_GROWTH_FACTOR: candidateGrowthFactor,
      },
      {
        MAX_SEARCH_DEPTH: mid,
        MAX_CANDIDATE_COUNT: 4,
        MIN_PROMOTION_SCORE: scoreMap.con[3][2] * 2,
        CANDIDATE_GROWTH_FACTOR: candidateGrowthFactor,
      },
    ],
    deepSearcherOption: {
      MAX_SEARCH_DEPTH: deep,
      MIN_PROMOTION_SCORE: scoreMap.con[4][1],
    },
    searchContext: mover,
  })
}

let solution: GomokuSolution | null = null
let solutionSize = BOARD_SIZE

function revIdx(posId: number, maxCol: number): [number, number] {
  return [Math.floor(posId / maxCol), posId % maxCol]
}

function getSolution(size: number): GomokuSolution {
  if (!solution || solutionSize !== size) {
    solution = new GomokuSolution({
      MAX_ROW: size,
      MAX_COL: size,
      MAX_ADJACENT: 5,
      MAX_DISTANCE_OF_NEIGHBOR: 2,
      CANDIDATE_GROWTH_FACTOR: 8,
    })
    solutionSize = size
  }
  return solution
}

export function findTacticalMove(
  state: GameState,
  aiColor: Color,
  rule: Rule,
  size = BOARD_SIZE,
): { x: number; y: number } | null {
  const opp = opponent(aiColor)

  for (const { x, y } of getEmptyCells(state.board, size)) {
    if (!isMoveValid(state, x, y, aiColor, rule, size)) continue
    const next = placeStone(state.board, x, y, aiColor)
    if (checkWin(next, x, y, aiColor, size)) return { x, y }
  }

  for (const { x, y } of getEmptyCells(state.board, size)) {
    if (!isMoveValid(state, x, y, opp, rule, size)) continue
    const next = placeStone(state.board, x, y, opp)
    if (checkWin(next, x, y, opp, size)) {
      if (isMoveValid(state, x, y, aiColor, rule, size)) return { x, y }
    }
  }

  return null
}

function pickValidFallback(
  state: GameState,
  aiColor: Color,
  rule: Rule,
  solutionInst: GomokuSolution,
  size: number,
): { x: number; y: number } | null {
  const libPlayer = toLibPlayer(aiColor)
  const candidates: { posId: number; score: number }[] = []
  const count = solutionInst.mover.expand(libPlayer, candidates, 2, 24)
  for (let i = 0; i < count; i++) {
    const [r, c] = revIdx(candidates[i].posId, size)
    if (isMoveValid(state, c, r, aiColor, rule, size)) return { x: c, y: r }
  }

  for (const { x, y } of getEmptyCells(state.board, size)) {
    if (isMoveValid(state, x, y, aiColor, rule, size)) return { x, y }
  }
  return null
}

export function findGomokuLibMove(
  state: GameState,
  rule: Rule,
  rank: string,
  aiColor: Color,
  type: 'engine' | 'ai',
): { x: number; y: number } | null {
  const size = state.board.length || BOARD_SIZE
  const tactical = findTacticalMove(state, aiColor, rule, size)
  if (tactical) return tactical

  const mistake = rankMistakeChance(rank, type)
  if (Math.random() < mistake) {
    const moves = getEmptyCells(state.board, size).filter(({ x, y }) =>
      isMoveValid(state, x, y, aiColor, rule, size),
    )
    if (moves.length > 0) return moves[Math.floor(Math.random() * moves.length)]
  }

  const solutionInst = getSolution(size)
  const pieces = boardToPieces(state.board)
  const searcher = createRankSearcher(
    solutionInst.mover,
    solutionInst.scoreMap,
    rank,
    type,
    solutionInst.CANDIDATE_GROWTH_FACTOR,
  )
  solutionInst.init(pieces, searcher)

  const libPlayer = toLibPlayer(aiColor)
  const [r, c] = solutionInst.minimaxSearch(libPlayer)
  if (r < 0 || c < 0) return pickValidFallback(state, aiColor, rule, solutionInst, size)

  const move = fromLibCoords(r, c)
  if (isMoveValid(state, move.x, move.y, aiColor, rule, size)) return move

  return pickValidFallback(state, aiColor, rule, solutionInst, size)
}
