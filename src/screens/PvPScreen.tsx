import { useState } from 'react'
import { BannerAd } from '../components/BannerAd'
import { HelpModal } from '../components/HelpModal'
import { RuleToggle } from '../components/RankPicker'
import { mustUseRenju } from '../core/game'
import { createRoom, generateRoomCode, getOnlineStatus } from '../services/network'
import { useGameStore } from '../store/gameStore'
import { useUserStore } from '../store/userStore'
import './Screen.css'

export function PvPScreen() {
  const setScreen = useGameStore((s) => s.setScreen)
  const roomCode = useGameStore((s) => s.roomCode)
  const setRoomCode = useGameStore((s) => s.setRoomCode)
  const initLocalPvp = useGameStore((s) => s.initLocalPvp)
  const profile = useUserStore((s) => s.profile)
  const [rule, setRule] = useState<'freestyle' | 'renju'>('freestyle')
  const [help, setHelp] = useState(false)
  const online = getOnlineStatus()

  const handleCreate = async () => {
    const code = (await createRoom(profile?.gameId ?? 'local', { rule })) ?? generateRoomCode()
    setRoomCode(code)
  }

  const handleJoin = () => {
    if (!roomCode.trim()) return
    initLocalPvp(rule, profile?.rank ?? '15급', profile?.rank ?? '15급')
  }

  return (
    <div className="screen">
      <BannerAd />
      <header className="screen-header">
        <button type="button" className="text-btn" onClick={() => setScreen('mode')}>
          ←
        </button>
        <span>사람 대전</span>
        <button type="button" className="icon-btn-sm" onClick={() => setHelp(true)}>
          ?
        </button>
      </header>
      <main className="screen-main compact">
        <p className="status-line">
          {online === 'ready' ? '온라인 준비됨' : '오프라인 · 방 코드만 생성'}
        </p>
        <div className="field">
          <label>규칙</label>
          <RuleToggle value={rule} onChange={setRule} rank={profile?.rank ?? '15급'} />
          {mustUseRenju(profile?.rank ?? '15급') && (
            <p className="hint">3급 이상은 렌주룰만 적용됩니다.</p>
          )}
        </div>
        <button type="button" className="menu-btn" onClick={handleCreate}>
          방 만들기
        </button>
        {roomCode && (
          <div className="code-box">
            <span>방 코드</span>
            <strong>{roomCode}</strong>
          </div>
        )}
        <div className="field">
          <label>코드 입력</label>
          <input
            className="text-input"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            placeholder="ABCDEF"
            maxLength={8}
          />
        </div>
        <button type="button" className="menu-btn primary" onClick={handleJoin}>
          참가
        </button>
      </main>
      {help && (
        <HelpModal title="사람 대전" onClose={() => setHelp(false)}>
          <p>방을 만들고 코드를 상대에게 공유하세요.</p>
          <p>Firebase 설정 시 실시간 동기화가 활성화됩니다.</p>
        </HelpModal>
      )}
    </div>
  )
}
