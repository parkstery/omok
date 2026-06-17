import { useState } from 'react'
import { BannerAd } from '../components/BannerAd'
import { Board } from '../components/Board'
import { HelpModal } from '../components/HelpModal'
import { useGameStore } from '../store/gameStore'
import './Screen.css'

export function GameScreen() {
  const config = useGameStore((s) => s.config)
  const state = useGameStore((s) => s.state)
  const makeMove = useGameStore((s) => s.makeMove)
  const resign = useGameStore((s) => s.resign)
  const goHome = useGameStore((s) => s.goHome)
  const thinking = useGameStore((s) => s.thinking)
  const [help, setHelp] = useState(false)

  const ruleLabel = config.rule === 'renju' ? '렌주' : '일반'
  const turnLabel = state.turn === 1 ? '흑' : '백'
  const statusLabel =
    thinking && config.opponentType !== 'human'
      ? '생각 중…'
      : `${turnLabel} 차례`

  return (
    <div className="screen game-screen">
      <BannerAd />
      <header className="game-header">
        <div className="players">
          <span>흑 {config.blackPlayer}</span>
          <span className="vs">vs</span>
          <span>백 {config.whitePlayer}</span>
        </div>
        <div className="game-meta">
          <span>{state.moves.length}수 · {ruleLabel} · {statusLabel}</span>
          {config.rule === 'renju' && (
            <button type="button" className="icon-btn-sm" onClick={() => setHelp(true)}>
              ?
            </button>
          )}
        </div>
        <div className="game-actions">
          {!config.isSpectate && (
            <button type="button" className="text-btn" onClick={resign}>
              기권
            </button>
          )}
          <button type="button" className="text-btn" onClick={goHome}>
            나가기
          </button>
        </div>
      </header>
      <Board
        board={state.board}
        size={config.boardSize}
        forbidden={state.forbidden}
        lastMove={state.lastMove}
        onCellClick={makeMove}
        interactive={!config.isSpectate && !state.result && !thinking}
      />
      {help && (
        <HelpModal title="렌주 금수" onClose={() => setHelp(false)}>
          <p>빨간 × 표시는 흑이 둘 수 없는 금수입니다.</p>
        </HelpModal>
      )}
    </div>
  )
}
