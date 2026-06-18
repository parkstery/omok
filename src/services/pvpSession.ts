import type { Unsubscribe } from 'firebase/database'
import type { RoomData } from './network'
import { subscribeRoom } from './network'

let activeUnsubscribe: Unsubscribe | null = null

export function startRoomSync(roomId: string, onRoom: (room: RoomData | null) => void): void {
  stopRoomSync()
  activeUnsubscribe = subscribeRoom(roomId, onRoom)
}

export function stopRoomSync(): void {
  activeUnsubscribe?.()
  activeUnsubscribe = null
}

export function isRoomSyncActive(): boolean {
  return activeUnsubscribe !== null
}
