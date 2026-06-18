export const BOARD_SIZE = 15

export type Stone = 0 | 1 | 2
export type Color = 1 | 2
export type Rule = 'freestyle' | 'renju'
export type GameResult = 'black_win' | 'white_win' | 'draw' | null
export type OpponentType = 'human' | 'engine' | 'ai'
export type Screen =
  | 'splash'
  | 'home'
  | 'mode'
  | 'pvp'
  | 'computer-type'
  | 'computer-rank'
  | 'computer-rule'
  | 'game'
  | 'spectate'
  | 'result'
  | 'records'
  | 'replay'
  | 'settings'
  | 'onboarding'
  | 'license'

export interface Move {
  x: number
  y: number
  color: Color
  ts: number
}

export interface GameConfig {
  rule: Rule
  boardSize: number
  opponentType: OpponentType
  playerColor: Color | 'random'
  blackPlayer: string
  whitePlayer: string
  blackRank: string
  whiteRank: string
  isLocal: boolean
  isSpectate: boolean
  roomId?: string
  saveRecord: boolean
}

export interface GameState {
  board: Stone[][]
  moves: Move[]
  turn: Color
  result: GameResult
  forbidden: { x: number; y: number }[]
  lastMove: { x: number; y: number } | null
}

export interface GameRecord {
  id: string
  players: { black: string; white: string; blackRank: string; whiteRank: string }
  opponentType: OpponentType
  rule: Rule
  boardSize: number
  result: GameResult
  moves: Move[]
  startedAt: number
  endedAt: number
  roomId?: string
}

export interface UserProfile {
  gameId: string
  nickname: string
  rank: string
  createdAt: number
  onboardingComplete?: boolean
  stats: { wins: number; losses: number; draws: number }
}
