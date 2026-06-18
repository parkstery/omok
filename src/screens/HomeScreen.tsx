import { BannerAd } from '../components/BannerAd'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { ProfileCard } from '../components/ui/ProfileCard'
import { TopBar } from '../components/ui/TopBar'
import { useGameStore } from '../store/gameStore'
import { useUserStore } from '../store/userStore'
import './Screen.css'

export function HomeScreen() {
  const setScreen = useGameStore((s) => s.setScreen)
  const profile = useUserStore((s) => s.profile)

  if (!profile) return null

  return (
    <div className="screen">
      <BannerAd />
      <TopBar
        title="오목"
        right={
          <Button variant="ghost" onClick={() => setScreen('settings')}>
            설정
          </Button>
        }
      />
      <main className="screen-main home-main">
        <ProfileCard profile={profile} />
        <Button variant="primary" size="lg" fullWidth subLabel="사람 · 컴퓨터 · 로컬" onClick={() => setScreen('mode')}>
          대전
        </Button>
        <div className="home-grid">
          <Card title="관전" description="진행 중인 대국 보기" onClick={() => setScreen('spectate')} />
          <Card title="기보" description="저장된 대국 리플레이" onClick={() => setScreen('records')} />
        </div>
      </main>
    </div>
  )
}
