import { ref, onValue, set, update, type Unsubscribe } from 'firebase/database'
import { v4 as uuidv4 } from 'uuid'
import type { GameConfig, Move } from '../core/types'
import { getRealtimeDb, isFirebaseConfigured } from './firebase'

export function generateRoomCode(): string {
  return uuidv4().slice(0, 6).toUpperCase()
}

export async function createRoom(hostId: string, config: Partial<GameConfig>): Promise<string | null> {
  if (!isFirebaseConfigured()) return generateRoomCode()

  const rtdb = getRealtimeDb()
  if (!rtdb) return generateRoomCode()

  const roomId = generateRoomCode()
  await set(ref(rtdb, `rooms/${roomId}`), {
    status: 'waiting',
    hostId,
    guestId: null,
    rule: config.rule ?? 'freestyle',
    boardSize: config.boardSize ?? 15,
    moves: [],
    turn: 'black',
    spectators: [],
    spectatorCount: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  })
  return roomId
}

export function subscribeRoom(
  roomId: string,
  onUpdate: (data: Record<string, unknown> | null) => void,
): Unsubscribe | null {
  const rtdb = getRealtimeDb()
  if (!rtdb) return null

  const roomRef = ref(rtdb, `rooms/${roomId}`)
  return onValue(roomRef, (snap) => onUpdate(snap.val()))
}

export async function pushMove(roomId: string, move: Move): Promise<void> {
  const rtdb = getRealtimeDb()
  if (!rtdb) return

  const roomRef = ref(rtdb, `rooms/${roomId}`)
  await update(roomRef, {
    updatedAt: Date.now(),
    [`moves/${move.ts}`]: move,
    turn: move.color === 1 ? 'white' : 'black',
  })
}

export function getOnlineStatus(): 'offline' | 'ready' {
  return isFirebaseConfigured() ? 'ready' : 'offline'
}
