import { get, ref, onValue, push, set, update, type Unsubscribe } from 'firebase/database'
import { v4 as uuidv4 } from 'uuid'
import { applyMove, createInitialState, resolveRule } from '../core/game'
import type { Color, GameResult, GameState, Move, Rule } from '../core/types'
import { BOARD_SIZE } from '../core/types'
import { getRealtimeDb, isFirebaseConfigured } from './firebase'

export type RoomStatus = 'waiting' | 'playing' | 'finished' | 'abandoned'
export type JoinResult = 'ok' | 'full' | 'missing' | 'offline' | 'self'

export interface RoomPlayer {
  id: string
  name: string
  rank: string
}

export interface RoomData {
  status: RoomStatus
  host: RoomPlayer
  guest: RoomPlayer | null
  rule: Rule
  boardSize: number
  result: GameResult
  moves: Move[]
  updatedAt: number
}

export interface CreateRoomInput {
  hostId: string
  hostName: string
  hostRank: string
  rule: Rule
  boardSize?: number
}

function randomCode(): string {
  return uuidv4().replace(/-/g, '').slice(0, 6).toUpperCase()
}

export function generateRoomCode(): string {
  return randomCode()
}

function parseMoves(raw: unknown): Move[] {
  if (!raw) return []
  if (Array.isArray(raw)) {
    return raw.filter(isMoveRecord).sort((a, b) => a.ts - b.ts)
  }
  if (typeof raw === 'object') {
    return Object.values(raw as Record<string, unknown>)
      .filter(isMoveRecord)
      .sort((a, b) => a.ts - b.ts)
  }
  return []
}

function isMoveRecord(value: unknown): value is Move {
  if (!value || typeof value !== 'object') return false
  const m = value as Move
  return (
    typeof m.x === 'number' &&
    typeof m.y === 'number' &&
    (m.color === 1 || m.color === 2) &&
    typeof m.ts === 'number'
  )
}

export function parseRoomData(raw: Record<string, unknown> | null): RoomData | null {
  if (!raw) return null
  const host = raw.host as RoomPlayer | undefined
  if (!host?.id) return null

  const guestRaw = raw.guest as RoomPlayer | null | undefined
  const guest = guestRaw?.id ? guestRaw : null

  return {
    status: (raw.status as RoomStatus) ?? 'waiting',
    host,
    guest,
    rule: (raw.rule as Rule) ?? 'freestyle',
    boardSize: (raw.boardSize as number) ?? BOARD_SIZE,
    result: (raw.result as GameResult) ?? null,
    moves: parseMoves(raw.moves),
    updatedAt: (raw.updatedAt as number) ?? 0,
  }
}

export function buildStateFromRoom(room: RoomData): GameState {
  const resolvedRule = resolveRule(room.rule, room.host.rank, room.guest?.rank ?? room.host.rank)
  let state = createInitialState(room.boardSize)
  for (const move of room.moves) {
    state = applyMove(state, move.x, move.y, move.color, resolvedRule, room.boardSize)
  }
  if (room.result && !state.result) {
    state = { ...state, result: room.result }
  }
  return state
}

export async function createRoom(input: CreateRoomInput): Promise<string | null> {
  if (!isFirebaseConfigured()) return null

  const rtdb = getRealtimeDb()
  if (!rtdb) return null

  let roomId = randomCode()
  for (let attempt = 0; attempt < 5; attempt++) {
    const roomRef = ref(rtdb, `rooms/${roomId}`)
    const existing = await get(roomRef)
    if (!existing.exists()) break
    roomId = randomCode()
  }

  await set(ref(rtdb, `rooms/${roomId}`), {
    status: 'waiting',
    host: { id: input.hostId, name: input.hostName, rank: input.hostRank },
    guest: null,
    rule: input.rule,
    boardSize: input.boardSize ?? BOARD_SIZE,
    result: null,
    moves: {},
    createdAt: Date.now(),
    updatedAt: Date.now(),
  })

  return roomId
}

export async function joinRoom(
  roomId: string,
  guest: RoomPlayer,
): Promise<JoinResult> {
  if (!isFirebaseConfigured()) return 'offline'

  const rtdb = getRealtimeDb()
  if (!rtdb) return 'offline'

  const code = roomId.trim().toUpperCase()
  const roomRef = ref(rtdb, `rooms/${code}`)
  const snap = await get(roomRef)
  if (!snap.exists()) return 'missing'

  const room = parseRoomData(snap.val() as Record<string, unknown>)
  if (!room) return 'missing'
  if (room.host.id === guest.id) return 'self'
  if (room.status !== 'waiting' || room.guest) return 'full'

  await update(roomRef, {
    guest,
    status: 'playing',
    updatedAt: Date.now(),
  })

  return 'ok'
}

export async function fetchRoom(roomId: string): Promise<RoomData | null> {
  const rtdb = getRealtimeDb()
  if (!rtdb) return null

  const code = roomId.trim().toUpperCase()
  const snap = await get(ref(rtdb, `rooms/${code}`))
  if (!snap.exists()) return null
  return parseRoomData(snap.val() as Record<string, unknown>)
}

export function subscribeRoom(
  roomId: string,
  onUpdate: (room: RoomData | null) => void,
): Unsubscribe | null {
  const rtdb = getRealtimeDb()
  if (!rtdb) return null

  const code = roomId.trim().toUpperCase()
  return onValue(ref(rtdb, `rooms/${code}`), (snap) => {
    onUpdate(parseRoomData(snap.val() as Record<string, unknown> | null))
  })
}

export async function pushMove(roomId: string, move: Move): Promise<void> {
  const rtdb = getRealtimeDb()
  if (!rtdb) return

  const code = roomId.trim().toUpperCase()
  const roomRef = ref(rtdb, `rooms/${code}`)
  await push(ref(rtdb, `rooms/${code}/moves`), move)
  await update(roomRef, { updatedAt: Date.now() })
}

export async function setRoomResult(roomId: string, result: GameResult): Promise<void> {
  const rtdb = getRealtimeDb()
  if (!rtdb) return

  const code = roomId.trim().toUpperCase()
  await update(ref(rtdb, `rooms/${code}`), {
    result,
    status: 'finished',
    updatedAt: Date.now(),
  })
}

export async function abandonRoom(roomId: string): Promise<void> {
  const rtdb = getRealtimeDb()
  if (!rtdb) return

  const code = roomId.trim().toUpperCase()
  await update(ref(rtdb, `rooms/${code}`), {
    status: 'abandoned',
    updatedAt: Date.now(),
  })
}

export function getOnlineStatus(): 'offline' | 'ready' {
  return isFirebaseConfigured() ? 'ready' : 'offline'
}

export function colorForRole(role: 'host' | 'guest'): Color {
  return role === 'host' ? 1 : 2
}

export function inviteUrl(roomId: string): string {
  if (typeof window === 'undefined') return `?room=${roomId}`
  const url = new URL(window.location.href)
  url.searchParams.set('room', roomId.toUpperCase())
  return url.toString()
}
