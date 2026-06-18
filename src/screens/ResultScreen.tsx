import { useMemo } from 'react'
import { BannerAd } from '../components/BannerAd'
import { Board } from '../components/Board'
import { getWinningLine } from '../core/board'
import { Button } from '../components/ui/Button'
import { useGameStore } from '../store/gameStore'
import { useUserStore } from '../store/userStore'
import './Screen.css'

export function ResultScreen() {
  const state = useGameStore((s) => s.state)
  const config = useGameStore((s) => s.config)
  const humanColor = useGameStore((s) => s.humanColor)
  const resetGame = useGameStore((s) => s.resetGame)
  const goHome = useGameStore((s) => s.goHome)
  const profile = useUserStore((s) => s.profile)

  const resultText =
    state.result === 'black_win' ? '흑 승리' : state.result === 'white_win' ? '백 승리' : '무승부'

  const personalResult = useMemo(() => {
    if (config.opponentType === 'human' || !state.result) return null
    if (state.result === 'draw') return '무승부'
    const won =
      (state.result === 'black_win' && humanColor === 1) ||
      (state.result === 'white_win' && humanColor === 2)
    return won ? '승리!' : '패배'
  }, [config.opponentType, state.result, humanColor])

  const winLine = useMemo(() => {
    if (!state.result || state.result === 'draw' || !state.lastMove) return []
    const color = state.result === 'black_win' ? 1 : 2
    return getWinningLine(state.board, state.lastMove.x, state.lastMove.y, color, config.boardSize) ?? []
  }, [state, config.boardSize])

  return (
    <div className="screen">
      <BannerAd />
      <main className="screen-main result-main scroll-main">
        {personalResult && (
          <p className={`result-personal ${personalResult === '승리!' ? 'win' : personalResult === '패배' ? 'loss' : ''}`}>
            {personalResult}
          </p>
        )}
        <h1 className="result-title">{resultText}</h1>
        <p className="result-detail">
          {state.moves.length}수 · {config.rule === 'renju' ? '렌주' : '일반'}
        </p>
        {winLine.length > 0 && (
          <Board
            board={state.board}
            size={config.boardSize}
            lastMove={state.lastMove}
            winLine={winLine}
            interactive={false}
            compact
          />
        )}
        {profile && config.opponentType !== 'human' && (
          <p className="result-stats">
            전적 {profile.stats.wins}승 {profile.stats.losses}패 {profile.stats.draws}무
          </p>
        )}
        <Button variant="primary" size="lg" fullWidth onClick={resetGame}>
          재대국
        </Button>
        <Button variant="secondary" fullWidth onClick={goHome}>
          홈
        </Button>
      </main>
    </div>
  )
}
