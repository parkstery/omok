import { useState } from 'react'
import { BannerAd } from '../components/BannerAd'
import { HelpModal } from '../components/HelpModal'
import { useGameStore } from '../store/gameStore'
import './Screen.css'

export function ModeScreen() {
  const setScreen = useGameStore((s) => s.setScreen)
  const initLocalPvp = useGameStore((s) => s.initLocalPvp)
  const [help, setHelp] = useState(false)

  return (
    <div className="screen">
      <BannerAd />
      <header className="screen-header">
        <button type="button" className="text-btn" onClick={() => setScreen('home')}>
          ←
        </button>
        <span>대전 모드</span>
        <span />
      </header>
      <main className="screen-main">
        <button type="button" className="menu-btn primary" onClick={() => setScreen('pvp')}>
          사람 대전
        </button>
        <button
          type="button"
          className="menu-btn primary"
          onClick={() => setScreen('computer-type')}
        >
          컴퓨터 대전
        </button>
        <button
          type="button"
          className="menu-btn"
          onClick={() => initLocalPvp('freestyle', '15급', '15급')}
        >
          로컬 2인
        </button>
        <button type="button" className="help-link" onClick={() => setHelp(true)}>
          ? 모드 안내
        </button>
      </main>
      {help && (
        <HelpModal title="대전 모드" onClose={() => setHelp(false)}>
          <p><strong>사람 대전:</strong> 온라인 방 코드로 대국합니다.</p>
          <p><strong>컴퓨터 대전:</strong> 엔진 또는 AI를 선택합니다.</p>
          <p><strong>로컬 2인:</strong> 한 기기에서 번갈아 둡니다.</p>
        </HelpModal>
      )}
    </div>
  )
}
