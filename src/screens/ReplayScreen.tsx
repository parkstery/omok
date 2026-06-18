import { useEffect, useState } from 'react'
import { BannerAd } from '../components/BannerAd'
import { Board } from '../components/Board'
import { Button } from '../components/ui/Button'
import { StatusBadge } from '../components/ui/StatusBadge'
import { TopBar } from '../components/ui/TopBar'
import { useGameStore } from '../store/gameStore'
import './Screen.css'

const SPEEDS = [
  { value: 0.5, label: '0.5x' },
  { value: 1, label: '1x' },
  { value: 2, label: '2x' },
] as const

export function ReplayScreen() {
  const setScreen = useGameStore((s) => s.setScreen)
  const state = useGameStore((s) => s.state)
  const config = useGameStore((s) => s.config)
  const replayIndex = useGameStore((s) => s.replayIndex)
  const replayMoves = useGameStore((s) => s.replayMoves)
  const replayStep = useGameStore((s) => s.replayStep)
  const setReplayIndex = useGameStore((s) => s.setReplayIndex)
  const replayToStart = useGameStore((s) => s.replayToStart)
  const replayToEnd = useGameStore((s) => s.replayToEnd)
  const selectedRecord = useGameStore((s) => s.selectedRecord)

  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState<(typeof SPEEDS)[number]['value']>(1)

  useEffect(() => {
    if (!playing) return
    if (replayIndex >= replayMoves.length) {
      setPlaying(false)
      return
    }
    const delay = 700 / speed
    const timer = window.setTimeout(() => replayStep(1), delay)
    return () => window.clearTimeout(timer)
  }, [playing, replayIndex, replayMoves.length, speed, replayStep])

  const resultLabel =
    selectedRecord?.result === 'black_win' ? '흑승' : selectedRecord?.result === 'white_win' ? '백승' : '무승부'

  return (
    <div className="screen game-screen">
      <BannerAd />
      <TopBar title="리플레이" onBack={() => setScreen('records')} />
      <div className="replay-meta">
        <StatusBadge>
          {replayIndex}/{replayMoves.length}수
        </StatusBadge>
        <StatusBadge tone="accent">{resultLabel}</StatusBadge>
        {selectedRecord && (
          <span className="replay-players">
            {selectedRecord.players.black} vs {selectedRecord.players.white}
          </span>
        )}
      </div>
      <Board board={state.board} size={config.boardSize} lastMove={state.lastMove} interactive={false} />
      <div className="replay-panel">
        <input
          className="replay-slider"
          type="range"
          min={0}
          max={replayMoves.length}
          value={replayIndex}
          onChange={(e) => {
            setPlaying(false)
            setReplayIndex(Number(e.target.value))
          }}
          aria-label="수순 탐색"
        />
        <div className="replay-speed">
          {SPEEDS.map((s) => (
            <button
              key={s.value}
              type="button"
              className={`speed-chip${speed === s.value ? ' active' : ''}`}
              onClick={() => setSpeed(s.value)}
            >
              {s.label}
            </button>
          ))}
        </div>
        <div className="replay-controls">
          <button type="button" className="replay-btn" onClick={replayToStart} aria-label="처음">
            ⏮
          </button>
          <button type="button" className="replay-btn" onClick={() => replayStep(-1)} aria-label="이전">
            ◀
          </button>
          <Button
            variant="primary"
            onClick={() => setPlaying((p) => !p)}
            className="replay-play-btn"
          >
            {playing ? '⏸ 정지' : '▶ 재생'}
          </Button>
          <button type="button" className="replay-btn" onClick={() => replayStep(1)} aria-label="다음">
            ▶
          </button>
          <button type="button" className="replay-btn" onClick={replayToEnd} aria-label="끝">
            ⏭
          </button>
        </div>
      </div>
    </div>
  )
}
