import type { GameState, Move, Rule } from '../../core/types'
import { rankIndex } from '../ranks'

export type RapfiRuleCode = 0 | 2

export function ruleToRapfi(rule: Rule): RapfiRuleCode {
  return rule === 'renju' ? 2 : 0
}

export interface RapfiSettings {
  strength: number
  maxDepth: number
  turnTimeMs: number
  matchTimeMs: number
}

export function rankToRapfiSettings(rank: string, type: 'engine' | 'ai'): RapfiSettings {
  const idx = rankIndex(rank)
  const strength = Math.min(100, Math.round(25 + idx * 3.2))
  let maxDepth = 12
  let turnTimeMs = 2000

  if (idx <= 4) {
    maxDepth = 6
    turnTimeMs = 800
  } else if (idx <= 9) {
    maxDepth = 10
    turnTimeMs = 1500
  } else if (idx <= 14) {
    maxDepth = 14
    turnTimeMs = 2500
  } else if (idx <= 19) {
    maxDepth = 18
    turnTimeMs = 3500
  } else {
    maxDepth = 22
    turnTimeMs = 5000
  }

  if (type === 'engine') {
    return {
      strength: Math.max(20, strength - 12),
      maxDepth: Math.max(4, maxDepth - 3),
      turnTimeMs: Math.max(500, turnTimeMs - 500),
      matchTimeMs: 9999000,
    }
  }

  return { strength, maxDepth, turnTimeMs, matchTimeMs: 9999000 }
}

export function movesToBoardCommand(moves: Move[], immediate: boolean): string {
  let command = immediate ? 'BOARD' : 'YXBOARD'
  let side: 1 | 2 = moves.length % 2 === 0 ? 1 : 2
  for (const m of moves) {
    command += ` ${m.x},${m.y},${side}`
    side = side === 1 ? 2 : 1
  }
  return `${command} DONE`
}

export function buildThinkCommands(
  state: GameState,
  rule: Rule,
  rank: string,
  type: 'engine' | 'ai',
  boardSize: number,
): string[] {
  const settings = rankToRapfiSettings(rank, type)
  const rapfiRule = ruleToRapfi(rule)

  return [
    `START ${boardSize}`,
    'RELOADCONFIG config.toml',
    `INFO RULE ${rapfiRule}`,
    'INFO THREAD_NUM 1',
    'INFO CAUTION_FACTOR 3',
    `INFO STRENGTH ${settings.strength}`,
    `INFO TIMEOUT_TURN ${settings.turnTimeMs}`,
    `INFO TIMEOUT_MATCH ${settings.matchTimeMs}`,
    `INFO MAX_DEPTH ${settings.maxDepth}`,
    'INFO MAX_NODE 0',
    'INFO SHOW_DETAIL 2',
    'INFO PONDERING 0',
    'INFO SWAPABLE 0',
    movesToBoardCommand(state.moves, false),
    'YXNBEST 1',
  ]
}
