import { BannerAd } from '../components/BannerAd'
import { Board } from '../components/Board'
import { useGameStore } from '../store/gameStore'
import './Screen.css'

export function ReplayScreen() {
  const setScreen = useGameStore((s) => s.setScreen)
  const state = useGameStore((s) => s.state)
  const config = useGameStore((s) => s.config)
  const replayIndex = useGameStore((s) => s.replayIndex)
  const replayMoves = useGameStore((s) => s.replayMoves)
  const replayStep = useGameStore((s) => s.replayStep)
  const replayToStart = useGameStore((s) => s.replayToStart)
  const replayToEnd = useGameStore((s) => s.replayToEnd)
  const selectedRecord = useGameStore((s) => s.selectedRecord)

  return (
    <div className="screen game-screen">
      <BannerAd />
      <header className="game-header">
        <button type="button" className="text-btn" onClick={() => setScreen('records')}>
          ←
        </button>
        <span>
          {replayIndex}/{replayMoves.length}수
        </span>
        <span className="result-mini">{selectedRecord?.result === 'black_win' ? '흑승' : selectedRecord?.result === 'white_win' ? '백승' : '무'}</span>
      </header>
      <Board board={state.board} size={config.boardSize} lastMove={state.lastMove} interactive={false} />
      <footer className="replay-controls">
        <button type="button" onClick={replayToStart}>
          ⏮
        </button>
        <button type="button" onClick={() => replayStep(-1)}>
          ◀
        </button>
        <button type="button" onClick={() => replayStep(1)}>
          ▶
        </button>
        <button type="button" onClick={replayToEnd}>
          ⏭
        </button>
      </footer>
    </div>
  )
}
