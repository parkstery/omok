import { useMemo, useState } from 'react'
import { BannerAd } from '../components/BannerAd'
import { Board } from '../components/Board'
import { HelpModal } from '../components/HelpModal'
import { RenjuHelpContent } from '../components/RenjuHelpContent'
import { getWinningLine } from '../core/board'
import { useGameStore } from '../store/gameStore'
import { useUserStore } from '../store/userStore'
import './Screen.css'

export function GameScreen() {
  const config = useGameStore((s) => s.config)
  const state = useGameStore((s) => s.state)
  const humanColor = useGameStore((s) => s.humanColor)
  const makeMove = useGameStore((s) => s.makeMove)
  const resign = useGameStore((s) => s.resign)
  const goHome = useGameStore((s) => s.goHome)
  const undoMove = useGameStore((s) => s.undoMove)
  const resetGame = useGameStore((s) => s.resetGame)
  const thinking = useGameStore((s) => s.thinking)
  const lastPromotion = useGameStore((s) => s.lastPromotion)
  const profile = useUserStore((s) => s.profile)
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

  const canUndo =
    config.isLocal && !config.isSpectate && !state.result && !thinking && state.moves.length > 0

  const winLine = useMemo(() => {
    if (!state.result || state.result === 'draw' || !state.lastMove) return []
    const color = state.result === 'black_win' ? 1 : 2
    return getWinningLine(state.board, state.lastMove.x, state.lastMove.y, color, config.boardSize) ?? []
  }, [state, config.boardSize])

  const resultText =
    state.result === 'black_win' ? '흑 승리' : state.result === 'white_win' ? '백 승리' : state.result === 'draw' ? '무승부' : ''

  const personalResult = useMemo(() => {
    if (!state.result || config.opponentType === 'human' && config.isLocal) return null
    if (state.result === 'draw') return '무승부'
    const won =
      (state.result === 'black_win' && humanColor === 1) ||
      (state.result === 'white_win' && humanColor === 2)
    return won ? '승리!' : '패배'
  }, [config.opponentType, config.isLocal, state.result, humanColor])

  return (
    <div className="flex h-dvh flex-col bg-[#fff8e1]">
      <BannerAd />
      <header className="shrink-0 border-b border-stone-300/80 px-2 py-1.5">
        <div className="flex items-center justify-between gap-2 text-xs">
          <div className="min-w-0 truncate text-stone-800">
            <span className="font-medium">● {config.blackPlayer}</span>
            <span className="mx-1 text-stone-400">vs</span>
            <span className="font-medium">○ {config.whitePlayer}</span>
          </div>
          <div className="flex shrink-0 gap-1">
            {canUndo && (
              <button
                type="button"
                className="rounded px-2 py-0.5 text-stone-700 hover:bg-stone-200/70"
                onClick={undoMove}
              >
                무르기
              </button>
            )}
            {!config.isSpectate && !state.result && (
              <button
                type="button"
                className="rounded px-2 py-0.5 text-red-700 hover:bg-red-50"
                onClick={resign}
              >
                기권
              </button>
            )}
            <button
              type="button"
              className="rounded px-2 py-0.5 text-stone-600 hover:bg-stone-200/70"
              onClick={goHome}
            >
              나가기
            </button>
          </div>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-1 text-[11px] text-stone-600">
          {!config.isLocal && <span className="rounded bg-stone-200/80 px-1.5 py-0.5">온라인</span>}
          <span className="rounded bg-stone-200/80 px-1.5 py-0.5">{state.moves.length}수</span>
          <span className="rounded bg-amber-100 px-1.5 py-0.5 text-amber-900">{ruleLabel}</span>
          <span className="rounded bg-stone-200/80 px-1.5 py-0.5">{statusLabel}</span>
          {config.rule === 'renju' && (
            <button
              type="button"
              className="rounded px-1.5 py-0.5 hover:bg-stone-200/70"
              onClick={() => setHelp(true)}
              aria-label="렌주 도움말"
            >
              ?
            </button>
          )}
        </div>
      </header>

      <div className="board-area relative min-h-0 flex-1">
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
          winLine={winLine}
          onCellClick={makeMove}
          interactive={canInteract}
        />
      </div>

      {state.result && (
        <footer className="shrink-0 border-t border-stone-300/80 bg-white/95 px-3 py-2.5">
          {personalResult && (
            <p
              className={`mb-0.5 text-xs font-semibold ${
                personalResult === '승리!' ? 'text-green-700' : personalResult === '패배' ? 'text-red-700' : 'text-stone-600'
              }`}
            >
              {personalResult}
            </p>
          )}
          <p className="text-sm font-bold text-stone-800">{resultText}</p>
          <p className="text-[11px] text-stone-500">
            {state.moves.length}수 · {ruleLabel}
            {profile && config.opponentType !== 'human' && (
              <> · {profile.rank} ({profile.winsAtRank ?? 0}승)</>
            )}
          </p>
          {lastPromotion?.promoted && (
            <p className="mt-1 text-xs font-semibold text-amber-800">🎉 {lastPromotion.newRank}으로 승급!</p>
          )}
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              className="flex-1 rounded-md bg-[#5d4037] py-2 text-xs font-medium text-white hover:bg-[#4e342e]"
              onClick={resetGame}
            >
              재대국
            </button>
            <button
              type="button"
              className="flex-1 rounded-md border border-stone-400 py-2 text-xs font-medium text-stone-800 hover:bg-stone-50"
              onClick={goHome}
            >
              홈
            </button>
          </div>
        </footer>
      )}

      {help && (
        <HelpModal title="렌주 금수" onClose={() => setHelp(false)}>
          <RenjuHelpContent />
        </HelpModal>
      )}
    </div>
  )
}
