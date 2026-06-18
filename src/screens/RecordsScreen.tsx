import { useMemo, useState } from 'react'
import { BannerAd } from '../components/BannerAd'
import { TopBar } from '../components/ui/TopBar'
import { StatusBadge } from '../components/ui/StatusBadge'
import type { GameRecord, OpponentType } from '../core/types'
import { loadLocalRecords } from '../services/replay'
import { useGameStore } from '../store/gameStore'
import './Screen.css'

type RecordTab = 'all' | 'pvp' | 'computer'

function matchTab(record: GameRecord, tab: RecordTab): boolean {
  if (tab === 'all') return true
  if (tab === 'pvp') return record.opponentType === 'human'
  return record.opponentType === 'engine' || record.opponentType === 'ai'
}

function opponentLabel(type: OpponentType): string {
  if (type === 'human') return 'PvP'
  if (type === 'engine') return '엔진'
  return 'AI'
}

export function RecordsScreen() {
  const setScreen = useGameStore((s) => s.setScreen)
  const loadReplay = useGameStore((s) => s.loadReplay)
  const [tab, setTab] = useState<RecordTab>('all')
  const records = loadLocalRecords()

  const filtered = useMemo(() => records.filter((r) => matchTab(r, tab)), [records, tab])

  const tabs: { id: RecordTab; label: string }[] = [
    { id: 'all', label: '전체' },
    { id: 'pvp', label: 'PvP' },
    { id: 'computer', label: '컴퓨터' },
  ]

  return (
    <div className="screen records-screen">
      <BannerAd />
      <TopBar title="기보" onBack={() => setScreen('home')} />
      <div className="record-tabs" role="tablist">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            className={`record-tab${tab === t.id ? ' active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <ul className="record-list">
        {filtered.length === 0 && (
          <li className="empty">{tab === 'all' ? '저장된 기보가 없습니다.' : '해당 유형의 기보가 없습니다.'}</li>
        )}
        {filtered.map((r) => (
          <li key={r.id}>
            <button type="button" className="record-card" onClick={() => loadReplay(r)}>
              <div className="record-card__top">
                <span className="record-date">{new Date(r.endedAt).toLocaleDateString()}</span>
                <StatusBadge tone="accent">{r.rule === 'renju' ? '렌주' : '일반'}</StatusBadge>
                <StatusBadge>{opponentLabel(r.opponentType)}</StatusBadge>
              </div>
              <p className="record-card__players">
                {r.players.black} vs {r.players.white}
              </p>
              <div className="record-card__bottom">
                <span>{r.moves.length}수</span>
                <span className="record-result">
                  {r.result === 'black_win' ? '흑승' : r.result === 'white_win' ? '백승' : '무승부'}
                </span>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
