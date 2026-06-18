import { BOARD_SIZE } from '../core/types'
import type { Stone } from '../core/types'
import { useSettingsStore } from '../store/settingsStore'
import './Board.css'

interface BoardProps {
  board: Stone[][]
  size?: number
  forbidden?: { x: number; y: number }[]
  lastMove?: { x: number; y: number } | null
  winLine?: { x: number; y: number }[]
  onCellClick?: (x: number, y: number) => void
  interactive?: boolean
  compact?: boolean
}

export function Board({
  board,
  size = BOARD_SIZE,
  forbidden = [],
  lastMove = null,
  winLine = [],
  onCellClick,
  interactive = true,
  compact = false,
}: BoardProps) {
  const forbiddenSet = new Set(forbidden.map((p) => `${p.x},${p.y}`))
  const winSet = new Set(winLine.map((p) => `${p.x},${p.y}`))
  const boardScale = useSettingsStore((s) => s.settings.boardScale)
  const padding = compact ? 8 : 12

  const wrapClass = [
    'board-wrap',
    compact ? 'board-wrap--compact' : '',
    !compact && boardScale === 'large' ? 'board-wrap--large' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={wrapClass}>
      <div
        className="board"
        style={{
          gridTemplateColumns: `repeat(${size}, 1fr)`,
          gridTemplateRows: `repeat(${size}, 1fr)`,
          padding: `${padding}px`,
        }}
      >
        {Array.from({ length: size * size }).map((_, i) => {
          const x = i % size
          const y = Math.floor(i / size)
          const stone = board[y]?.[x] ?? 0
          const isForbidden = forbiddenSet.has(`${x},${y}`)
          const isLast = lastMove?.x === x && lastMove?.y === y
          const isWin = winSet.has(`${x},${y}`)
          const isStar =
            (size === 15 &&
              ((x === 3 && y === 3) ||
                (x === 11 && y === 3) ||
                (x === 7 && y === 7) ||
                (x === 3 && y === 11) ||
                (x === 11 && y === 11))) ||
            (size === 19 &&
              [3, 9, 15].some((a) => [3, 9, 15].some((b) => a === x && b === y)))
          const edgeLeft = x === 0
          const edgeRight = x === size - 1
          const edgeTop = y === 0
          const edgeBottom = y === size - 1

          return (
            <button
              key={`${x}-${y}`}
              type="button"
              className={[
                'cell',
                edgeLeft ? 'edge-left' : '',
                edgeRight ? 'edge-right' : '',
                edgeTop ? 'edge-top' : '',
                edgeBottom ? 'edge-bottom' : '',
                stone === 1 ? 'black' : '',
                stone === 2 ? 'white' : '',
                isForbidden ? 'forbidden' : '',
                isLast ? 'last' : '',
                isWin ? 'win' : '',
                !interactive ? 'readonly' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => interactive && onCellClick?.(x, y)}
              disabled={!interactive || stone !== 0}
              aria-label={`${x + 1},${y + 1}`}
            >
              {isStar && stone === 0 && <span className="star" />}
              {stone === 1 && <span className="stone black-stone" />}
              {stone === 2 && <span className="stone white-stone" />}
              {isForbidden && stone === 0 && <span className="forbidden-mark">×</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}
