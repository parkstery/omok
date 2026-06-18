import { RANKS } from '../engine/ranks'
import type { Rule } from '../core/types'
import './RankPicker.css'

interface RankPickerProps {
  value: string
  onChange: (rank: string) => void
}

export function RankPicker({ value, onChange }: RankPickerProps) {
  return (
    <div className="rank-picker">
      {RANKS.map((rank) => (
        <button
          key={rank}
          type="button"
          className={`rank-chip ${value === rank ? 'active' : ''}`}
          onClick={() => onChange(rank)}
        >
          {rank}
        </button>
      ))}
    </div>
  )
}

export function RuleToggle({
  value,
  onChange,
}: {
  value: Rule
  onChange: (v: Rule) => void
}) {
  return (
    <div className="rule-toggle">
      <button
        type="button"
        className={value === 'freestyle' ? 'active' : ''}
        onClick={() => onChange('freestyle')}
        title="흑 3-3(삼삼) 금수"
      >
        일반
      </button>
      <button
        type="button"
        className={value === 'renju' ? 'active' : ''}
        onClick={() => onChange('renju')}
        title="흑 3-3·4-4·장목 금수"
      >
        렌주
      </button>
    </div>
  )
}
