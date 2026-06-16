import { BannerAd } from '../components/BannerAd'
import { loadLocalRecords } from '../services/replay'
import { useGameStore } from '../store/gameStore'
import './Screen.css'

export function RecordsScreen() {
  const setScreen = useGameStore((s) => s.setScreen)
  const loadReplay = useGameStore((s) => s.loadReplay)
  const records = loadLocalRecords()

  return (
    <div className="screen records-screen">
      <BannerAd />
      <header className="screen-header">
        <button type="button" className="text-btn" onClick={() => setScreen('home')}>
          ←
        </button>
        <span>기보</span>
        <span />
      </header>
      <ul className="record-list">
        {records.length === 0 && <li className="empty">저장된 기보가 없습니다.</li>}
        {records.map((r) => (
          <li key={r.id}>
            <button type="button" className="record-item" onClick={() => loadReplay(r)}>
              <span className="record-date">{new Date(r.endedAt).toLocaleDateString()}</span>
              <span>
                {r.players.black} vs {r.players.white}
              </span>
              <span className="record-result">
                {r.result === 'black_win' ? '흑승' : r.result === 'white_win' ? '백승' : '무'}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
