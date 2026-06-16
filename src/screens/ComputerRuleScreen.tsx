import { useState } from 'react'
import { BannerAd } from '../components/BannerAd'
import { HelpModal } from '../components/HelpModal'
import { RuleToggle } from '../components/RankPicker'
import { mustUseRenju } from '../core/game'
import type { Color } from '../core/types'
import { useGameStore } from '../store/gameStore'
import './Screen.css'

export function ComputerRuleScreen() {
  const setScreen = useGameStore((s) => s.setScreen)
  const pendingRank = useGameStore((s) => s.pendingRank)
  const pendingRule = useGameStore((s) => s.pendingRule)
  const pendingColor = useGameStore((s) => s.pendingColor)
  const setPendingRule = useGameStore((s) => s.setPendingRule)
  const setPendingColor = useGameStore((s) => s.setPendingColor)
  const startComputerGame = useGameStore((s) => s.startComputerGame)
  const [help, setHelp] = useState(false)

  const locked = mustUseRenju(pendingRank)

  return (
    <div className="screen">
      <BannerAd />
      <header className="screen-header">
        <button type="button" className="text-btn" onClick={() => setScreen('computer-rank')}>
          ←
        </button>
        <span>규칙 · 색</span>
        <button type="button" className="icon-btn-sm" onClick={() => setHelp(true)}>
          ?
        </button>
      </header>
      <main className="screen-main compact">
        <div className="field">
          <label>규칙 {locked && '(렌주 고정)'}</label>
          <RuleToggle value={pendingRule} onChange={setPendingRule} rank={pendingRank} />
        </div>
        <div className="field">
          <label>색</label>
          <div className="color-picker">
            {(['1', '2', 'random'] as const).map((c) => (
              <button
                key={c}
                type="button"
                className={pendingColor === (c === 'random' ? 'random' : (Number(c) as Color)) ? 'active' : ''}
                onClick={() => setPendingColor(c === 'random' ? 'random' : (Number(c) as Color))}
              >
                {c === '1' ? '흑' : c === '2' ? '백' : '랜덤'}
              </button>
            ))}
          </div>
        </div>
        <button type="button" className="menu-btn primary" onClick={startComputerGame}>
          시작
        </button>
      </main>
      {help && (
        <HelpModal title="렌주룰" onClose={() => setHelp(false)}>
          <p>흑은 3-3, 4-4, 장목(6목+)이 금수입니다.</p>
          <p>백은 금수가 없습니다.</p>
          <p>3급 이상은 렌주룰만 적용됩니다.</p>
        </HelpModal>
      )}
    </div>
  )
}
