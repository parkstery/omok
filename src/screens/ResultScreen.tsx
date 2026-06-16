import { BannerAd } from '../components/BannerAd'
import { useGameStore } from '../store/gameStore'
import './Screen.css'

export function ResultScreen() {
  const state = useGameStore((s) => s.state)
  const config = useGameStore((s) => s.config)
  const resetGame = useGameStore((s) => s.resetGame)
  const goHome = useGameStore((s) => s.goHome)

  const resultText =
    state.result === 'black_win'
      ? '흑 승리'
      : state.result === 'white_win'
        ? '백 승리'
        : '무승부'

  return (
    <div className="screen">
      <BannerAd />
      <main className="screen-main result-main">
        <h1 className="result-title">{resultText}</h1>
        <p className="result-detail">
          {state.moves.length}수 · {config.rule === 'renju' ? '렌주' : '일반'}
        </p>
        <button type="button" className="menu-btn primary" onClick={resetGame}>
          재대국
        </button>
        <button type="button" className="menu-btn" onClick={goHome}>
          홈
        </button>
      </main>
    </div>
  )
}
