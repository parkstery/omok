import { useState } from 'react'
import { BannerAd } from '../components/BannerAd'
import { Board } from '../components/Board'
import { HelpModal } from '../components/HelpModal'
import { RenjuHelpContent } from '../components/RenjuHelpContent'
import { Button } from '../components/ui/Button'
import { StatusBadge } from '../components/ui/StatusBadge'
import { useGameStore } from '../store/gameStore'
import './Screen.css'

export function GameScreen() {
  const config = useGameStore((s) => s.config)
  const state = useGameStore((s) => s.state)
  const humanColor = useGameStore((s) => s.humanColor)
  const makeMove = useGameStore((s) => s.makeMove)
  const resign = useGameStore((s) => s.resign)
  const goHome = useGameStore((s) => s.goHome)
  const thinking = useGameStore((s) => s.thinking)
  const [help, setHelp] = useState(false)

  const ruleLabel = config.rule === 'renju' ? '렌주' : '일반'
  const isMyTurn = config.isLocal || state.turn === humanColor
  const turnLabel = state.turn === 1 ? '흑' : '백'
  const statusLabel =
    thinking && config.opponentType !== 'human'
      ? '생각 중…'
      : !config.isLocal && !isMyTurn
        ? '상대 차례'
        : `${turnLabel} 차례`

  const canInteract =
    !config.isSpectate && !state.result && !thinking && (config.isLocal || isMyTurn)

  return (
    <div className="screen game-screen">
      <BannerAd />
      <header className="game-bar">
        <div className="game-bar__players">
          <span className="player-chip player-chip--black">● {config.blackPlayer}</span>
          <span className="game-bar__vs">vs</span>
          <span className="player-chip player-chip--white">○ {config.whitePlayer}</span>
        </div>
        <div className="game-bar__meta">
          {!config.isLocal && <StatusBadge>온라인</StatusBadge>}
          <StatusBadge>{state.moves.length}수</StatusBadge>
          <StatusBadge tone="accent">{ruleLabel}</StatusBadge>
          <StatusBadge tone={thinking ? 'thinking' : isMyTurn ? 'turn' : 'default'}>{statusLabel}</StatusBadge>
          {config.rule === 'renju' && (
            <button type="button" className="game-bar__help" onClick={() => setHelp(true)} aria-label="렌주 도움말">
              ?
            </button>
          )}
        </div>
        <div className="game-bar__actions">
          {!config.isSpectate && (
            <Button variant="danger" onClick={resign}>
              기권
            </Button>
          )}
          <Button variant="ghost" onClick={goHome}>
            나가기
          </Button>
        </div>
      </header>
      <div className="board-area">
        {thinking && (
          <div className="thinking-overlay" aria-live="polite">
            <span>AI 생각 중…</span>
          </div>
        )}
        {!config.isLocal && !isMyTurn && !state.result && (
          <div className="waiting-overlay" aria-live="polite">
            <span>상대 착수 대기…</span>
          </div>
        )}
        <Board
          board={state.board}
          size={config.boardSize}
          forbidden={state.forbidden}
          lastMove={state.lastMove}
          onCellClick={makeMove}
          interactive={canInteract}
        />
      </div>
      {help && (
        <HelpModal title="렌주 금수" onClose={() => setHelp(false)}>
          <RenjuHelpContent />
        </HelpModal>
      )}
    </div>
  )
}
