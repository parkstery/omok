import { BOARD_SIZE, type Color, type Stone } from './types'

export function createEmptyBoard(size = BOARD_SIZE): Stone[][] {
  return Array.from({ length: size }, () => Array(size).fill(0) as Stone[])
}

export function cloneBoard(board: Stone[][]): Stone[][] {
  return board.map((row) => [...row])
}

export function getStone(board: Stone[][], x: number, y: number, size = BOARD_SIZE): Stone {
  if (x < 0 || y < 0 || x >= size || y >= size) return 0
  return board[y][x]
}

export function isEmpty(board: Stone[][], x: number, y: number): boolean {
  return getStone(board, x, y) === 0
}

export function placeStone(board: Stone[][], x: number, y: number, color: Color): Stone[][] {
  const next = cloneBoard(board)
  next[y][x] = color
  return next
}

export function opponent(color: Color): Color {
  return color === 1 ? 2 : 1
}

const DIRECTIONS = [
  [1, 0],
  [0, 1],
  [1, 1],
  [1, -1],
] as const

export function countLine(
  board: Stone[][],
  x: number,
  y: number,
  dx: number,
  dy: number,
  color: Color,
  size = BOARD_SIZE,
): number {
  let count = 1
  for (const sign of [-1, 1]) {
    let nx = x + dx * sign
    let ny = y + dy * sign
    while (getStone(board, nx, ny, size) === color) {
      count++
      nx += dx * sign
      ny += dy * sign
    }
  }
  return count
}

export function checkWin(board: Stone[][], x: number, y: number, color: Color, size = BOARD_SIZE): boolean {
  for (const [dx, dy] of DIRECTIONS) {
    if (countLine(board, x, y, dx, dy, color, size) >= 5) return true
  }
  return false
}

export function checkOverline(board: Stone[][], x: number, y: number, color: Color, size = BOARD_SIZE): boolean {
  for (const [dx, dy] of DIRECTIONS) {
    if (countLine(board, x, y, dx, dy, color, size) >= 6) return true
  }
  return false
}

export function isBoardFull(board: Stone[][], size = BOARD_SIZE): boolean {
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (board[y][x] === 0) return false
    }
  }
  return true
}

export function getEmptyCells(board: Stone[][], size = BOARD_SIZE): { x: number; y: number }[] {
  const cells: { x: number; y: number }[] = []
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (board[y][x] === 0) cells.push({ x, y })
    }
  }
  return cells
}
