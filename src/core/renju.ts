import { checkOverline, checkWin, getStone, placeStone } from './board'
import type { Stone } from './types'

function lineString(board: Stone[][], x: number, y: number, dx: number, dy: number, size: number): string {
  let s = ''
  for (let i = -4; i <= 4; i++) {
    const nx = x + dx * i
    const ny = y + dy * i
    const stone = getStone(board, nx, ny, size)
    if (stone === 0) s += nx < 0 || ny < 0 || nx >= size || ny >= size ? 'b' : '.'
    else if (stone === 1) s += 'x'
    else s += 'o'
  }
  return s
}

const OPEN_THREE_PATTERNS = [
  '.xxx.',
  '.xx.x.',
  '.x.xx.',
  '..xxx..',
]

const OPEN_FOUR_PATTERNS = ['.xxxx.', 'xxx.x.', 'xx.xx.', 'x.xxx.']

function countPatterns(line: string, patterns: string[]): number {
  let count = 0
  for (const pattern of patterns) {
    let idx = 0
    while (true) {
      const found = line.indexOf(pattern, idx)
      if (found === -1) break
      if (line[4] === 'x' && found <= 4 && found + pattern.length > 4) count++
      idx = found + 1
    }
  }
  return count
}

function countOpenThreesOnLine(board: Stone[][], x: number, y: number, dx: number, dy: number, size: number): number {
  const line = lineString(board, x, y, dx, dy, size)
  return countPatterns(line, OPEN_THREE_PATTERNS)
}

function countOpenFoursOnLine(board: Stone[][], x: number, y: number, dx: number, dy: number, size: number): number {
  const line = lineString(board, x, y, dx, dy, size)
  return countPatterns(line, OPEN_FOUR_PATTERNS)
}

const AXES = [
  [1, 0],
  [0, 1],
  [1, 1],
  [1, -1],
] as const

export function isRenjuForbidden(
  board: Stone[][],
  x: number,
  y: number,
  size: number,
): boolean {
  if (getStone(board, x, y, size) !== 0) return true

  const simulated = placeStone(board, x, y, 1)

  if (checkWin(simulated, x, y, 1, size)) return false
  if (checkOverline(simulated, x, y, 1, size)) return true

  let openThrees = 0
  let openFours = 0
  for (const [dx, dy] of AXES) {
    openThrees += countOpenThreesOnLine(simulated, x, y, dx, dy, size)
    openFours += countOpenFoursOnLine(simulated, x, y, dx, dy, size)
  }

  return openThrees >= 2 || openFours >= 2
}

export function getRenjuForbiddenPoints(board: Stone[][], size: number): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = []
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (getStone(board, x, y, size) === 0 && isRenjuForbidden(board, x, y, size)) {
        points.push({ x, y })
      }
    }
  }
  return points
}

export function isValidRenjuMove(board: Stone[][], x: number, y: number, color: 1 | 2, size: number): boolean {
  if (getStone(board, x, y, size) !== 0) return false
  if (color === 2) return true
  return !isRenjuForbidden(board, x, y, size)
}
