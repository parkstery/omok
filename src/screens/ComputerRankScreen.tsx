import { BannerAd } from '../components/BannerAd'
import { RankPicker } from '../components/RankPicker'
import { isAiRecommended } from '../engine/ranks'
import { useGameStore } from '../store/gameStore'
import './Screen.css'

export function ComputerRankScreen() {
  const setScreen = useGameStore((s) => s.setScreen)
  const pendingRank = useGameStore((s) => s.pendingRank)
  const pendingOpponentType = useGameStore((s) => s.pendingOpponentType)
  const setPendingRank = useGameStore((s) => s.setPendingRank)

  return (
    <div className="screen">
      <BannerAd />
      <header className="screen-header">
        <button type="button" className="text-btn" onClick={() => setScreen('computer-type')}>
          ←
        </button>
        <span>급·단 선택</span>
        <span />
      </header>
      <main className="screen-main compact">
        <RankPicker value={pendingRank} onChange={setPendingRank} />
        {pendingOpponentType === 'engine' && isAiRecommended(pendingRank) && (
          <p className="hint warn">7단 이상은 AI 대전을 권장합니다.</p>
        )}
        <button type="button" className="menu-btn primary" onClick={() => setScreen('computer-rule')}>
          다음
        </button>
      </main>
    </div>
  )
}
