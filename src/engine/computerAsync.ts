import type { Color, GameState, Rule } from '../core/types'
import { findEngineMoveAsync } from './computer'

let worker: Worker | null = null

function getWorker(): Worker | null {
  if (typeof Worker === 'undefined') return null
  if (!worker) {
    worker = new Worker(new URL('./computer.worker.ts', import.meta.url), { type: 'module' })
  }
  return worker
}

export { findEngineMoveAsync }

export function findEngineMoveViaWorker(
  state: GameState,
  rule: Rule,
  rank: string,
  aiColor: Color,
  type: 'engine' | 'ai',
): Promise<{ x: number; y: number } | null> {
  const w = getWorker()
  if (!w) return findEngineMoveAsync(state, rule, rank, aiColor, type)

  return new Promise((resolve) => {
    const onMessage = (event: MessageEvent<{ ok: boolean; move?: { x: number; y: number }; error?: string }>) => {
      w.removeEventListener('message', onMessage)
      const data = event.data
      resolve(data.ok && data.move ? data.move : null)
    }
    w.addEventListener('message', onMessage)
    w.postMessage({
      board: state.board,
      moves: state.moves,
      rule,
      rank,
      aiColor,
      type,
    })
  })
}
