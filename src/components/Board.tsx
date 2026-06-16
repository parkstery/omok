import { BOARD_SIZE } from '../core/types'
import type { Stone } from '../core/types'
import './Board.css'

interface BoardProps {
  board: Stone[][]
  size?: number
  forbidden?: { x: number; y: number }[]
  lastMove?: { x: number; y: number } | null
  onCellClick?: (x: number, y: number) => void
  interactive?: boolean
}

export function Board({
  board,
  size = BOARD_SIZE,
  forbidden = [],
  lastMove = null,
  onCellClick,
  interactive = true,
}: BoardProps) {
  const forbiddenSet = new Set(forbidden.map((p) => `${p.x},${p.y}`))
  const padding = 12
  const cellSize = `calc((min(100vw - 24px, 100vh - 220px) - ${padding * 2}px) / ${size - 1})`

  return (
    <div className="board-wrap">
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
          const isStar =
            (size === 15 &&
              ((x === 3 && y === 3) ||
                (x === 11 && y === 3) ||
                (x === 7 && y === 7) ||
                (x === 3 && y === 11) ||
                (x === 11 && y === 11))) ||
            (size === 19 &&
              [3, 9, 15].some((a) => [3, 9, 15].some((b) => a === x && b === y)))

          return (
            <button
              key={`${x}-${y}`}
              type="button"
              className={[
                'cell',
                stone === 1 ? 'black' : '',
                stone === 2 ? 'white' : '',
                isForbidden ? 'forbidden' : '',
                isLast ? 'last' : '',
                !interactive ? 'readonly' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              style={{ width: cellSize, height: cellSize }}
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
