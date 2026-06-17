import type { GameState, Rule } from '../../core/types'
import { buildThinkCommands } from './rapfiProtocol'

const ENGINE_URL = '/rapfi/fallback/rapfi-single.js'

type WorkerOutMessage =
  | { type: 'ready' }
  | { type: 'loading'; data: { progress: number } }
  | { type: 'move'; data: { x: number; y: number } }
  | { type: 'error'; data: string }
  | { type: 'stderr'; data: string }

let worker: Worker | null = null
let initPromise: Promise<boolean> | null = null
let ready = false

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker('/rapfi/rapfi-bridge.worker.js')
  }
  return worker
}

export function isRapfiReady(): boolean {
  return ready
}

export function initRapfiEngine(): Promise<boolean> {
  if (initPromise) return initPromise

  initPromise = new Promise((resolve) => {
    if (typeof Worker === 'undefined') {
      resolve(false)
      return
    }

    const w = getWorker()

    const onMessage = (event: MessageEvent<WorkerOutMessage>) => {
      const msg = event.data
      if (msg.type === 'ready') {
        ready = true
        w.removeEventListener('message', onMessage)
        resolve(true)
      } else if (msg.type === 'error') {
        console.error('[Rapfi]', msg.data)
        w.removeEventListener('message', onMessage)
        resolve(false)
      }
    }

    w.addEventListener('message', onMessage)
    w.postMessage({
      type: 'init',
      data: {
        engineURL: ENGINE_URL,
        memoryArgs: {
          initial: 64 * ((1024 * 1024) / 65536),
          maximum: 512 * ((1024 * 1024) / 65536),
          shared: false,
        },
      },
    })

    setTimeout(() => {
      if (!ready) {
        w.removeEventListener('message', onMessage)
        resolve(false)
      }
    }, 120_000)
  })

  return initPromise
}

export function findRapfiMove(
  state: GameState,
  rule: Rule,
  rank: string,
  type: 'engine' | 'ai',
): Promise<{ x: number; y: number } | null> {
  return initRapfiEngine().then((ok) => {
    if (!ok || !ready) return null

    const w = getWorker()
    const commands = buildThinkCommands(state, rule, rank, type, state.board.length)

    return new Promise<{ x: number; y: number } | null>((resolve) => {
      const timeout = setTimeout(() => {
        w.removeEventListener('message', onMessage)
        resolve(null)
      }, 30_000)

      const onMessage = (event: MessageEvent<WorkerOutMessage>) => {
        const msg = event.data
        if (msg.type === 'move') {
          clearTimeout(timeout)
          w.removeEventListener('message', onMessage)
          resolve({ x: msg.data.x, y: msg.data.y })
        } else if (msg.type === 'error') {
          clearTimeout(timeout)
          w.removeEventListener('message', onMessage)
          resolve(null)
        }
      }

      w.addEventListener('message', onMessage)
      w.postMessage({ type: 'think', data: { commands } })
    })
  })
}
