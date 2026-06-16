import { BannerAd } from '../components/BannerAd'
import { useGameStore } from '../store/gameStore'
import './Screen.css'

export function ComputerTypeScreen() {
  const setScreen = useGameStore((s) => s.setScreen)
  const setPendingOpponentType = useGameStore((s) => s.setPendingOpponentType)

  const pick = (type: 'engine' | 'ai') => {
    setPendingOpponentType(type)
    setScreen('computer-rank')
  }

  return (
    <div className="screen">
      <BannerAd />
      <header className="screen-header">
        <button type="button" className="text-btn" onClick={() => setScreen('mode')}>
          ←
        </button>
        <span>컴퓨터 대전</span>
        <span />
      </header>
      <main className="screen-main">
        <button type="button" className="menu-btn primary" onClick={() => pick('engine')}>
          엔진
          <small>규칙 기반 · 가벼움</small>
        </button>
        <button type="button" className="menu-btn primary" onClick={() => pick('ai')}>
          AI
          <small>고급 · 고단 권장</small>
        </button>
      </main>
    </div>
  )
}
