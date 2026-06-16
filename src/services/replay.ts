import { collection, doc, setDoc } from 'firebase/firestore'
import { v4 as uuidv4 } from 'uuid'
import type { GameConfig, GameRecord, GameState } from '../core/types'
import { getFirestoreDb, isFirebaseConfigured } from './firebase'

const LOCAL_KEY = 'omok_records'

export async function saveGameRecord(config: GameConfig, state: GameState): Promise<GameRecord | null> {
  if (!state.result || state.moves.length === 0) return null

  const record: GameRecord = {
    id: uuidv4(),
    players: {
      black: config.blackPlayer,
      white: config.whitePlayer,
      blackRank: config.blackRank,
      whiteRank: config.whiteRank,
    },
    opponentType: config.opponentType,
    rule: config.rule,
    boardSize: config.boardSize,
    result: state.result,
    moves: state.moves,
    startedAt: state.moves[0]?.ts ?? Date.now(),
    endedAt: Date.now(),
    roomId: config.roomId,
  }

  const local = loadLocalRecords()
  local.unshift(record)
  localStorage.setItem(LOCAL_KEY, JSON.stringify(local.slice(0, 100)))

  if (isFirebaseConfigured()) {
    const db = getFirestoreDb()
    if (db) {
      await setDoc(doc(collection(db, 'games'), record.id), record)
    }
  }

  return record
}

export function loadLocalRecords(): GameRecord[] {
  const raw = localStorage.getItem(LOCAL_KEY)
  if (!raw) return []
  try {
    return JSON.parse(raw) as GameRecord[]
  } catch {
    return []
  }
}
