import { create } from 'zustand'
import {
  applyMove,
  createInitialState,
  defaultConfig,
  getForbiddenPreview,
  pickPlayerColor,
  resolveRule,
} from '../core/game'
import type { Color, GameConfig, GameRecord, GameState, Move, Rule, Screen } from '../core/types'
import { findEngineMoveAsync } from '../engine/computer'
import { saveGameRecord } from '../services/replay'
import { showInterstitialAd } from '../services/ads'

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
  replayToStart: () => void
  replayToEnd: () => void
  finishAndSave: () => Promise<void>
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

  setScreen: (screen) => set({ screen }),

  initLocalPvp: (rule, blackRank, whiteRank) => {
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

  initComputer: (type, rank, rule, color) => {
    const resolved = resolveRule(rule, rank, rank)
    const humanColor = pickPlayerColor(color)
    const aiColor = opponentColor(humanColor)
    const state = createInitialState()
    set({
      screen: 'game',
      config: defaultConfig({
        rule: resolved,
        opponentType: type,
        isLocal: true,
        blackRank: rank,
        whiteRank: rank,
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

  makeMove: (x, y) => {
    const { config, state, humanColor } = get()
    if (config.isSpectate || state.result) return

    const isHumanTurn =
      config.opponentType === 'human' ? true : state.turn === humanColor
    if (!isHumanTurn) return

    const next = applyMove(state, x, y, state.turn, config.rule, config.boardSize)
    if (next.moves.length === state.moves.length) return

    set({ state: next })

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
    const { state, humanColor } = get()
    if (state.result) return
    const winner = humanColor === 1 ? 'white_win' : 'black_win'
    set({
      state: { ...state, result: winner },
      screen: 'result',
    })
    void get().finishAndSave()
  },

  resetGame: () => {
    const { config, humanColor } = get()
    const state = createInitialState()
    set({
      state: { ...state, forbidden: getForbiddenPreview(state, config.rule) },
      screen: 'game',
    })
    if (config.opponentType !== 'human' && humanColor === 2) {
      setTimeout(() => get().runComputerTurn(), 400)
    }
  },

  goHome: () =>
    set({
      screen: 'home',
      state: createInitialState(),
      config: defaultConfig(),
    }),

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
    const { replayMoves, replayIndex, config } = get()
    const nextIndex = Math.max(0, Math.min(replayMoves.length, replayIndex + delta))
    let state = createInitialState(config.boardSize)
    for (let i = 0; i < nextIndex; i++) {
      const m = replayMoves[i]
      state = applyMove(state, m.x, m.y, m.color, config.rule, config.boardSize)
    }
    set({ replayIndex: nextIndex, state })
  },

  replayToStart: () => {
    set({ replayIndex: 0, state: createInitialState(get().config.boardSize) })
  },

  replayToEnd: () => {
    const { replayMoves, config } = get()
    let state = createInitialState(config.boardSize)
    for (const m of replayMoves) {
      state = applyMove(state, m.x, m.y, m.color, config.rule, config.boardSize)
    }
    set({ replayIndex: replayMoves.length, state })
  },

  finishAndSave: async () => {
    const { config, state } = get()
    if (!state.result) return

    await showInterstitialAd()
    await saveGameRecord(config, state)
    set({ screen: 'result' })
  },
}))
