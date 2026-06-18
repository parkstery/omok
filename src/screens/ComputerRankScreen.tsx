import { BannerAd } from '../components/BannerAd'
import { RankPicker } from '../components/RankPicker'
import { Button } from '../components/ui/Button'
import { TopBar } from '../components/ui/TopBar'
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
      <TopBar title="급·단 선택" onBack={() => setScreen('computer-type')} />
      <main className="screen-main compact scroll-main">
        <div className="picker-panel">
          <RankPicker value={pendingRank} onChange={setPendingRank} />
        </div>
        {pendingOpponentType === 'engine' && isAiRecommended(pendingRank) && (
          <p className="hint warn content-panel">7단 이상은 AI 대전을 권장합니다.</p>
        )}
        <Button variant="primary" size="lg" fullWidth onClick={() => setScreen('computer-rule')}>
          다음
        </Button>
      </main>
    </div>
  )
}
