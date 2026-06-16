import { BannerAd } from '../components/BannerAd'
import { useGameStore } from '../store/gameStore'
import { useUserStore } from '../store/userStore'
import './Screen.css'

export function HomeScreen() {
  const setScreen = useGameStore((s) => s.setScreen)
  const profile = useUserStore((s) => s.profile)

  return (
    <div className="screen">
      <BannerAd />
      <header className="screen-header">
        <div>
          <span className="nickname">{profile?.nickname ?? '...'}</span>
          <span className="rank"> · {profile?.rank ?? '15급'}</span>
        </div>
        <button type="button" className="text-btn" onClick={() => setScreen('settings')}>
          설정
        </button>
      </header>
      <main className="screen-main home-main">
        <button type="button" className="menu-btn primary" onClick={() => setScreen('mode')}>
          대전
        </button>
        <div className="menu-row">
          <button type="button" className="menu-btn" onClick={() => setScreen('spectate')}>
            관전
          </button>
          <button type="button" className="menu-btn" onClick={() => setScreen('records')}>
            기보
          </button>
        </div>
      </main>
    </div>
  )
}
