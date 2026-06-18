import { useEffect, useState } from 'react'
import { initRapfiEngine, isRapfiReady } from './engine/rapfi/rapfiClient'
import { useGameStore } from './store/gameStore'
import { useUserStore } from './store/userStore'
import { HomeScreen } from './screens/HomeScreen'
import { PvPScreen } from './screens/PvPScreen'
import { GameScreen } from './screens/GameScreen'
import { ReplayScreen } from './screens/ReplayScreen'
import { RecordsScreen } from './screens/RecordsScreen'
import { SpectateScreen, SettingsScreen } from './screens/SpectateScreen'
import { SplashScreen } from './screens/SplashScreen'
import { OnboardingScreen } from './screens/OnboardingScreen'
import { LicenseScreen } from './screens/LicenseScreen'

export function AppRouter() {
  const screen = useGameStore((s) => s.screen)
  const setScreen = useGameStore((s) => s.setScreen)
  const init = useUserStore((s) => s.init)
  const ready = useUserStore((s) => s.ready)
  const profile = useUserStore((s) => s.profile)
  const [engineReady, setEngineReady] = useState(isRapfiReady())

  useEffect(() => {
    void initRapfiEngine().then((ok) => setEngineReady(ok || isRapfiReady()))
  }, [])

  useEffect(() => {
    void init().then(() => {
      if (useGameStore.getState().screen === 'splash') {
        setScreen('home')
      }
    })
  }, [init, setScreen])

  if (!ready || !engineReady) {
    const progress = (ready ? 50 : 10) + (engineReady ? 50 : 0)
    const message = !ready ? '프로필 불러오는 중…' : !engineReady ? 'AI 엔진 로딩 중…' : '준비됨'
    return <SplashScreen message={message} progress={progress} />
  }

  if (!profile?.onboardingComplete) {
    return <OnboardingScreen />
  }

  switch (screen) {
    case 'home':
      return <HomeScreen />
    case 'pvp':
      return <PvPScreen />
    case 'game':
      return <GameScreen />
    case 'replay':
      return <ReplayScreen />
    case 'records':
      return <RecordsScreen />
    case 'spectate':
      return <SpectateScreen />
    case 'settings':
      return <SettingsScreen />
    case 'license':
      return <LicenseScreen />
    default:
      return <HomeScreen />
  }
}

export function App() {
  return (
    <div className="app-shell">
      <AppRouter />
    </div>
  )
}
