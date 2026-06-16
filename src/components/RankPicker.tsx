import { mustUseRenju } from '../core/game'
import { RANKS } from '../engine/ranks'
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
  rank,
}: {
  value: 'freestyle' | 'renju'
  onChange: (v: 'freestyle' | 'renju') => void
  rank: string
}) {
  const locked = mustUseRenju(rank)
  return (
    <div className="rule-toggle">
      <button
        type="button"
        className={value === 'freestyle' ? 'active' : ''}
        disabled={locked}
        onClick={() => onChange('freestyle')}
      >
        일반
      </button>
      <button
        type="button"
        className={value === 'renju' ? 'active' : ''}
        onClick={() => onChange('renju')}
      >
        렌주
      </button>
    </div>
  )
}
