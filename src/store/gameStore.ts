import { create } from 'zustand'
import {
  applyMove,
  createInitialState,
  defaultConfig,
  getForbiddenPreview,
  pickPlayerColor,
  resolveRule,
  undoMoves,
} from '../core/game'
import { isSameRankMatch } from '../core/rank'
import type { PromotionResult } from '../core/rank'
import type { Color, GameConfig, GameRecord, GameState, Move, Rule, Screen } from '../core/types'
import { findEngineMoveAsync } from '../engine/computer'
import { playMoveFeedback, playWinFeedback } from '../services/feedback'
import {
  abandonRoom,
  buildStateFromRoom,
  pushMove,
  setRoomResult,
  type RoomData,
} from '../services/network'
import { startRoomSync, stopRoomSync } from '../services/pvpSession'
import { saveGameRecord } from '../services/replay'
import { showInterstitialAd } from '../services/ads'
import { useUserStore } from './userStore'

interface GameStore {
  screen: Screen
  config: GameConfig
  state: GameState
  humanColor: Color
  replayIndex: number
  replayMoves: Move[]
  selectedRecord: GameRecord | null
  roomCode: string
  spectateCode: string
  pendingOpponentType: 'engine' | 'ai' | null
  pendingRank: string
  pendingRule: Rule
  pendingColor: Color | 'random'

  setScreen: (screen: Screen) => void
  initLocalPvp: (rule: Rule, blackRank: string, whiteRank: string) => void
  enterOnlineGame: (roomId: string, room: RoomData, role: 'host' | 'guest') => void
  syncOnlineRoom: (room: RoomData) => void
  initComputer: (type: 'engine' | 'ai', rank: string, rule: Rule, color: Color | 'random') => void
  makeMove: (x: number, y: number) => void
  runComputerTurn: () => void
  thinking: boolean
  resign: () => void
  resetGame: () => void
  goHome: () => void
  setPendingOpponentType: (type: 'engine' | 'ai') => void
  setPendingRank: (rank: string) => void
  setPendingRule: (rule: Rule) => void
  setPendingColor: (color: Color | 'random') => void
  startComputerGame: () => void
  setRoomCode: (code: string) => void
  setSpectateCode: (code: string) => void
  loadReplay: (record: GameRecord) => void
  replayStep: (delta: number) => void
  setReplayIndex: (index: number) => void
  replayToStart: () => void
  replayToEnd: () => void
  finishAndSave: () => Promise<PromotionResult | null>
  undoMove: () => void
  startQuickComputer: (type?: 'engine' | 'ai', color?: Color | 'random') => void
  lastPromotion: PromotionResult | null
  dismissResult: () => void
}

function opponentColor(color: Color): Color {
  return color === 1 ? 2 : 1
}

export const useGameStore = create<GameStore>((set, get) => ({
  screen: 'splash',
  config: defaultConfig(),
  state: createInitialState(),
  humanColor: 1,
  replayIndex: 0,
  replayMoves: [],
  selectedRecord: null,
  roomCode: '',
  spectateCode: '',
  pendingOpponentType: null,
  pendingRank: '15급',
  pendingRule: 'freestyle',
  pendingColor: 1,
  thinking: false,
  lastPromotion: null as PromotionResult | null,

  setScreen: (screen) => set({ screen }),

  initLocalPvp: (rule, blackRank, whiteRank) => {
    stopRoomSync()
    const resolved = resolveRule(rule, blackRank, whiteRank)
    const state = createInitialState()
    set({
      screen: 'game',
      config: defaultConfig({
        rule: resolved,
        opponentType: 'human',
        isLocal: true,
        blackRank,
        whiteRank,
        blackPlayer: '흑',
        whitePlayer: '백',
      }),
      state: { ...state, forbidden: getForbiddenPreview(state, resolved) },
      humanColor: 1,
    })
  },

  enterOnlineGame: (roomId, room, role) => {
    stopRoomSync()
    const resolved = resolveRule(room.rule, room.host.rank, room.guest?.rank ?? room.host.rank)
    const humanColor = role === 'host' ? 1 : 2
    const state = buildStateFromRoom({ ...room, rule: resolved })

    set({
      screen: 'game',
      roomCode: roomId.toUpperCase(),
      humanColor,
      config: defaultConfig({
        rule: resolved,
        opponentType: 'human',
        isLocal: false,
        roomId: roomId.toUpperCase(),
        blackPlayer: room.host.name,
        whitePlayer: room.guest?.name ?? '상대',
        blackRank: room.host.rank,
        whiteRank: room.guest?.rank ?? '15급',
      }),
      state,
    })

    startRoomSync(roomId, (updated) => {
      if (updated) get().syncOnlineRoom(updated)
    })
  },

  syncOnlineRoom: (room) => {
    const { config, screen } = get()
    if (config.isLocal || !config.roomId || screen !== 'game') return

    const resolved = resolveRule(room.rule, room.host.rank, room.guest?.rank ?? room.host.rank)
    const nextState = buildStateFromRoom({ ...room, rule: resolved })
    const prevMoveCount = get().state.moves.length

    set({
      state: nextState,
      config: {
        ...config,
        rule: resolved,
        whitePlayer: room.guest?.name ?? config.whitePlayer,
        whiteRank: room.guest?.rank ?? config.whiteRank,
      },
    })

    if (nextState.moves.length > prevMoveCount) {
      playMoveFeedback()
    }

    if (nextState.result && get().screen === 'game') {
      void get().finishAndSave()
    }
  },

  initComputer: (type, rank, rule, color) => {
    const profileRank = useUserStore.getState().profile?.rank ?? rank
    const matchRank = profileRank
    const resolved = resolveRule(rule, matchRank, matchRank)
    const humanColor = pickPlayerColor(color)
    const aiColor = opponentColor(humanColor)
    const state = createInitialState()
    set({
      screen: 'game',
      config: defaultConfig({
        rule: resolved,
        opponentType: type,
        isLocal: true,
        blackRank: matchRank,
        whiteRank: matchRank,
        blackPlayer: humanColor === 1 ? '나' : type === 'engine' ? '엔진' : 'AI',
        whitePlayer: humanColor === 2 ? '나' : type === 'engine' ? '엔진' : 'AI',
        playerColor: humanColor,
      }),
      state: { ...state, forbidden: getForbiddenPreview(state, resolved) },
      humanColor,
    })

    if (aiColor === 1) {
      setTimeout(() => get().runComputerTurn(), 400)
    }
  },

  startQuickComputer: (type = 'engine', color = 'random') => {
    const profile = useUserStore.getState().profile
    const rank = profile?.rank ?? '15급'
    const rule = resolveRule('freestyle', rank, rank)
    get().initComputer(type, rank, rule, color)
  },

  undoMove: () => {
    const { config, state, humanColor, thinking } = get()
    if (thinking || state.result || !config.isLocal || config.isSpectate) return
    if (state.moves.length === 0) return

    let count = 1
    if (config.opponentType !== 'human') {
      const aiColor = opponentColor(humanColor)
      const last = state.moves[state.moves.length - 1]
      count = last.color === aiColor ? 2 : 1
      if (state.moves.length < count) return
    }

    const next = undoMoves(state, count, config.rule, config.boardSize)
    set({ state: next, lastPromotion: null })
  },

  dismissResult: () => {
    set({ lastPromotion: null })
  },

  makeMove: (x, y) => {
    const { config, state, humanColor } = get()
    if (config.isSpectate || state.result) return

    const isHumanTurn = config.isLocal
      ? config.opponentType === 'human' || state.turn === humanColor
      : state.turn === humanColor
    if (!isHumanTurn) return

    const next = applyMove(state, x, y, state.turn, config.rule, config.boardSize)
    if (next.moves.length === state.moves.length) return

    set({ state: next })
    playMoveFeedback()

    if (!config.isLocal && config.roomId) {
      const move = next.moves[next.moves.length - 1]
      void (async () => {
        await pushMove(config.roomId!, move)
        if (next.result) {
          await setRoomResult(config.roomId!, next.result)
          await get().finishAndSave()
        }
      })()
      return
    }

    if (next.result) {
      void get().finishAndSave()
      return
    }

    if (config.opponentType !== 'human') {
      setTimeout(() => get().runComputerTurn(), 300)
    }
  },

  runComputerTurn: () => {
    const { config, state, humanColor } = get()
    if (state.result || config.opponentType === 'human' || get().thinking) return

    const aiColor = opponentColor(humanColor)
    if (state.turn !== aiColor) return

    const rank = humanColor === 1 ? config.whiteRank : config.blackRank
    set({ thinking: true })

    void findEngineMoveAsync(state, config.rule, rank, aiColor, config.opponentType as 'engine' | 'ai')
      .then((move) => {
        const latest = get()
        if (!move || latest.state.result || latest.state.turn !== aiColor) {
          set({ thinking: false })
          return
        }
        const next = applyMove(latest.state, move.x, move.y, latest.state.turn, latest.config.rule, latest.config.boardSize)
        set({ state: next, thinking: false })
        if (next.result) void get().finishAndSave()
      })
      .catch(() => set({ thinking: false }))
  },

  resign: () => {
    const { state, humanColor, config } = get()
    if (state.result) return
    const winner = humanColor === 1 ? 'white_win' : 'black_win'
    if (!config.isLocal && config.roomId) {
      void setRoomResult(config.roomId, winner)
    }
    set({
      state: { ...state, result: winner },
    })
    void get().finishAndSave()
  },

  resetGame: () => {
    const { config, humanColor } = get()
    const state = createInitialState()
    set({
      state: { ...state, forbidden: getForbiddenPreview(state, config.rule) },
      screen: 'game',
      lastPromotion: null,
    })
    if (config.opponentType !== 'human' && humanColor === 2) {
      setTimeout(() => get().runComputerTurn(), 400)
    }
  },

  goHome: () => {
    const { config, roomCode } = get()
    if (!config.isLocal && roomCode) {
      void abandonRoom(roomCode)
    }
    stopRoomSync()
    set({
      screen: 'home',
      state: createInitialState(),
      config: defaultConfig(),
      roomCode: '',
      lastPromotion: null,
    })
  },

  setPendingOpponentType: (type) => set({ pendingOpponentType: type }),
  setPendingRank: (rank) => {
    const isDan = rank.endsWith('단')
    const kyu = parseInt(rank.replace('급', ''), 10)
    const forceRenju = isDan || (!Number.isNaN(kyu) && kyu <= 3)
    set({
      pendingRank: rank,
      pendingRule: forceRenju ? 'renju' : get().pendingRule,
    })
  },
  setPendingRule: (rule) => set({ pendingRule: rule }),
  setPendingColor: (color) => set({ pendingColor: color }),

  startComputerGame: () => {
    const { pendingOpponentType, pendingRank, pendingRule, pendingColor } = get()
    if (!pendingOpponentType) return
    get().initComputer(pendingOpponentType, pendingRank, pendingRule, pendingColor)
  },

  setRoomCode: (code) => set({ roomCode: code }),
  setSpectateCode: (code) => set({ spectateCode: code }),

  loadReplay: (record) => {
    set({
      selectedRecord: record,
      replayMoves: record.moves,
      replayIndex: 0,
      state: createInitialState(record.boardSize),
      screen: 'replay',
      config: defaultConfig({ rule: record.rule, boardSize: record.boardSize }),
    })
  },

  replayStep: (delta) => {
    const { replayIndex } = get()
    get().setReplayIndex(replayIndex + delta)
  },

  setReplayIndex: (index) => {
    const { replayMoves, config } = get()
    const nextIndex = Math.max(0, Math.min(replayMoves.length, index))
    let state = createInitialState(config.boardSize)
    for (let i = 0; i < nextIndex; i++) {
      const m = replayMoves[i]
      state = applyMove(state, m.x, m.y, m.color, config.rule, config.boardSize)
    }
    set({ replayIndex: nextIndex, state })
  },

  replayToStart: () => {
    get().setReplayIndex(0)
  },

  replayToEnd: () => {
    get().setReplayIndex(get().replayMoves.length)
  },

  finishAndSave: async () => {
    const { config, state, humanColor, screen } = get()
    if (!state.result || screen !== 'game') return null

    let promotion: PromotionResult | null = null
    const profileRank = useUserStore.getState().profile?.rank ?? '15급'
    const opponentRank = humanColor === 1 ? config.whiteRank : config.blackRank

    if (config.opponentType !== 'human' && config.isLocal) {
      if (state.result === 'draw') {
        useUserStore.getState().recordGameResult('draw')
      } else {
        const won =
          (state.result === 'black_win' && humanColor === 1) ||
          (state.result === 'white_win' && humanColor === 2)
        if (won && isSameRankMatch(profileRank, opponentRank)) {
          promotion = useUserStore.getState().recordRankedComputerResult(opponentRank, true)
          playWinFeedback()
        } else if (won) {
          useUserStore.getState().recordGameResult('win')
          playWinFeedback()
        } else if (isSameRankMatch(profileRank, opponentRank)) {
          useUserStore.getState().recordRankedComputerResult(opponentRank, false)
        } else {
          useUserStore.getState().recordGameResult('loss')
        }
      }
    } else if (!config.isLocal) {
      if (state.result === 'draw') {
        useUserStore.getState().recordGameResult('draw')
      } else {
        const won =
          (state.result === 'black_win' && humanColor === 1) ||
          (state.result === 'white_win' && humanColor === 2)
        useUserStore.getState().recordGameResult(won ? 'win' : 'loss')
        if (won) playWinFeedback()
      }
    }

    await showInterstitialAd()
    await saveGameRecord(config, state)
    set({ lastPromotion: promotion })
    return promotion
  },
}))
