export const RANKS = [
  '15급', '14급', '13급', '12급', '11급',
  '10급', '9급', '8급', '7급', '6급',
  '5급', '4급', '3급', '2급', '1급',
  '1단', '2단', '3단', '4단', '5단', '6단', '7단', '8단', '9단',
] as const

export type RankLabel = (typeof RANKS)[number]

export function rankIndex(label: string): number {
  const idx = RANKS.indexOf(label as RankLabel)
  return idx === -1 ? 0 : idx
}

export function rankToEngineDepth(label: string): number {
  const idx = rankIndex(label)
  if (idx <= 4) return 2
  if (idx <= 9) return 3
  if (idx <= 14) return 4
  if (idx <= 17) return 5
  if (idx <= 20) return 6
  return 7
}

export function rankToAiDepth(label: string): number {
  const idx = rankIndex(label)
  if (idx <= 4) return 2
  if (idx <= 9) return 3
  if (idx <= 14) return 5
  if (idx <= 19) return 6
  if (idx <= 22) return 7
  return 8
}

export function rankMistakeChance(label: string, type: 'engine' | 'ai'): number {
  const idx = rankIndex(label)
  const base = type === 'engine' ? 0.35 : 0.25
  const reduction = idx * 0.015
  return Math.max(0.02, base - reduction)
}

export function formatRank(label: string): string {
  return label
}

export function isAiRecommended(label: string): boolean {
  return rankIndex(label) >= rankIndex('7단')
}
