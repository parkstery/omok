import { useState } from 'react'
import { BannerAd } from '../components/BannerAd'
import { HelpModal } from '../components/HelpModal'
import { RankPicker } from '../components/RankPicker'
import { Button } from '../components/ui/Button'
import { TopBar } from '../components/ui/TopBar'
import { getPlayAccountBindingNote } from '../services/account'
import { getOnlineStatus } from '../services/network'
import { useGameStore } from '../store/gameStore'
import { useUserStore } from '../store/userStore'
import './Screen.css'

export function SpectateScreen() {
  const setScreen = useGameStore((s) => s.setScreen)
  const spectateCode = useGameStore((s) => s.spectateCode)
  const setSpectateCode = useGameStore((s) => s.setSpectateCode)
  const [help, setHelp] = useState(false)

  return (
    <div className="screen">
      <BannerAd />
      <TopBar title="관전" onBack={() => setScreen('home')} onHelp={() => setHelp(true)} />
      <main className="screen-main compact">
        <p className="status-line">
          {getOnlineStatus() === 'ready' ? '실시간 관전 가능' : 'Firebase 설정 후 활성화'}
        </p>
        <div className="field">
          <label>관전 코드</label>
          <input
            className="text-input"
            value={spectateCode}
            onChange={(e) => setSpectateCode(e.target.value.toUpperCase())}
            placeholder="방 코드 입력"
          />
        </div>
        <button type="button" className="menu-btn primary" disabled={!spectateCode}>
          관전 입장
        </button>
      </main>
      {help && (
        <HelpModal title="관전" onClose={() => setHelp(false)}>
          <p>진행 중인 대국의 관전 코드를 입력하세요.</p>
          <p>착수는 할 수 없으며 실시간으로 판을 봅니다.</p>
        </HelpModal>
      )}
    </div>
  )
}

export function SettingsScreen() {
  const setScreen = useGameStore((s) => s.setScreen)
  const profile = useUserStore((s) => s.profile)
  const setNickname = useUserStore((s) => s.setNickname)
  const setRank = useUserStore((s) => s.setRank)
  const [help, setHelp] = useState(false)

  return (
    <div className="screen">
      <BannerAd />
      <TopBar title="설정" onBack={() => setScreen('home')} onHelp={() => setHelp(true)} />
      <main className="screen-main compact">
        <div className="field">
          <label>닉네임</label>
          <input
            className="text-input"
            value={profile?.nickname ?? ''}
            onChange={(e) => setNickname(e.target.value)}
          />
        </div>
        <div className="field field--wide">
          <label>급·단</label>
          <RankPicker value={profile?.rank ?? '15급'} onChange={setRank} />
        </div>
        <div className="field">
          <label>게임 ID</label>
          <code className="game-id">{profile?.gameId ?? '-'}</code>
        </div>
        <Button variant="secondary" fullWidth onClick={() => setScreen('license')}>
          오픈소스 라이선스
        </Button>
      </main>
      {help && (
        <HelpModal title="계정" onClose={() => setHelp(false)}>
          <p>{getPlayAccountBindingNote()}</p>
        </HelpModal>
      )}
    </div>
  )
}
