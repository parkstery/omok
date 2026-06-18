import { checkOverline, checkWin, getStone, placeStone } from './board'
import type { Color, Stone } from './types'

const AXES = [
  [1, 0],
  [0, 1],
  [1, 1],
  [1, -1],
] as const

function getRun(
  board: Stone[][],
  x: number,
  y: number,
  dx: number,
  dy: number,
  color: Color,
  size: number,
): { left: number; right: number; total: number } {
  let left = 0
  let nx = x - dx
  let ny = y - dy
  while (getStone(board, nx, ny, size) === color) {
    left++
    nx -= dx
    ny -= dy
  }

  let right = 0
  nx = x + dx
  ny = y + dy
  while (getStone(board, nx, ny, size) === color) {
    right++
    nx += dx
    ny += dy
  }

  return { left, right, total: left + right + 1 }
}

/** 해당 칸에 두었을 때 정확히 5목(장목 아님) */
function makesExactFive(board: Stone[][], x: number, y: number, color: Color, size: number): boolean {
  if (x < 0 || y < 0 || x >= size || y >= size) return false
  if (getStone(board, x, y, size) !== 0) return false
  const next = placeStone(board, x, y, color)
  return checkWin(next, x, y, color, size) && !checkOverline(next, x, y, color, size)
}

/** 보드에 이미 color 돌이 (x,y)에 있을 때, 이 방향이 活四인지 */
function isOpenFourAt(
  board: Stone[][],
  x: number,
  y: number,
  dx: number,
  dy: number,
  color: Color,
  size: number,
): boolean {
  if (getStone(board, x, y, size) !== color) return false
  const { left, right, total } = getRun(board, x, y, dx, dy, color, size)
  if (total !== 4) return false

  const lx = x - (left + 1) * dx
  const ly = y - (left + 1) * dy
  const rx = x + (right + 1) * dx
  const ry = y + (right + 1) * dy

  return makesExactFive(board, lx, ly, color, size) && makesExactFive(board, rx, ry, color, size)
}

/** 보드에 이미 color 돌이 (x,y)에 있을 때, 이 방향이 四(한 수로 5목)인지 */
function isFourAt(
  board: Stone[][],
  x: number,
  y: number,
  dx: number,
  dy: number,
  color: Color,
  size: number,
): boolean {
  if (getStone(board, x, y, size) !== color) return false
  const { left, right, total } = getRun(board, x, y, dx, dy, color, size)
  if (total !== 4) return false

  const lx = x - (left + 1) * dx
  const ly = y - (left + 1) * dy
  const rx = x + (right + 1) * dx
  const ry = y + (right + 1) * dy

  return makesExactFive(board, lx, ly, color, size) || makesExactFive(board, rx, ry, color, size)
}

/**
 * (mx,my)에 흑을 둔 보드에서, 이 방향이 活三을 만드는지.
 * 活三 = 빈 칸 E에 두면 活四가 되고, 그 3목에 (mx,my)가 포함됨.
 */
function createsOpenThreeAt(
  board: Stone[][],
  mx: number,
  my: number,
  dx: number,
  dy: number,
  color: Color,
  size: number,
): boolean {
  for (let d = -6; d <= 6; d++) {
    const ex = mx + dx * d
    const ey = my + dy * d
    if (ex < 0 || ey < 0 || ex >= size || ey >= size) continue
    if (getStone(board, ex, ey, size) !== 0) continue

    const after = placeStone(board, ex, ey, color)
    if (!isOpenFourAt(after, ex, ey, dx, dy, color, size)) continue

    const run = getRun(after, ex, ey, dx, dy, color, size)
    let stoneCount = 0
    let includesMove = false

    for (let k = -run.left - 1; k <= run.right + 1; k++) {
      const px = ex + dx * k
      const py = ey + dy * k
      if (px === ex && py === ey) continue
      if (getStone(board, px, py, size) === color) {
        stoneCount++
        if (px === mx && py === my) includesMove = true
      }
    }

    if (includesMove && stoneCount === 3) return true
  }
  return false
}

function countOpenThrees(board: Stone[][], mx: number, my: number, color: Color, size: number): number {
  let count = 0
  for (const [dx, dy] of AXES) {
    if (createsOpenThreeAt(board, mx, my, dx, dy, color, size)) count++
  }
  return count
}

function countFours(board: Stone[][], mx: number, my: number, color: Color, size: number): number {
  let count = 0
  for (const [dx, dy] of AXES) {
    if (isFourAt(board, mx, my, dx, dy, color, size)) count++
  }
  return count
}

export function isRenjuForbidden(
  board: Stone[][],
  x: number,
  y: number,
  size: number,
): boolean {
  if (getStone(board, x, y, size) !== 0) return true

  const simulated = placeStone(board, x, y, 1)

  // 5목이면 금수 아님 (승리 수)
  if (checkWin(simulated, x, y, 1, size) && !checkOverline(simulated, x, y, 1, size)) {
    return false
  }

  // 장목(6목+)
  if (checkOverline(simulated, x, y, 1, size)) return true

  const threes = countOpenThrees(simulated, x, y, 1, size)
  const fours = countFours(simulated, x, y, 1, size)

  return threes >= 2 || fours >= 2
}

/** 일반룰(삼삼금지): 흑의 活三 2개 이상만 금수 */
export function isStandardForbidden(
  board: Stone[][],
  x: number,
  y: number,
  size: number,
): boolean {
  if (getStone(board, x, y, size) !== 0) return true

  const simulated = placeStone(board, x, y, 1)
  if (checkWin(simulated, x, y, 1, size)) return false

  return countOpenThrees(simulated, x, y, 1, size) >= 2
}

export function getStandardForbiddenPoints(board: Stone[][], size: number): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = []
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (getStone(board, x, y, size) === 0 && isStandardForbidden(board, x, y, size)) {
        points.push({ x, y })
      }
    }
  }
  return points
}

export function isValidStandardMove(board: Stone[][], x: number, y: number, color: Color, size: number): boolean {
  if (getStone(board, x, y, size) !== 0) return false
  if (color === 2) return true
  return !isStandardForbidden(board, x, y, size)
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

export function isValidRenjuMove(board: Stone[][], x: number, y: number, color: Color, size: number): boolean {
  if (getStone(board, x, y, size) !== 0) return false
  if (color === 2) return true
  return !isRenjuForbidden(board, x, y, size)
}
