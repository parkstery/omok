import { useEffect } from 'react'
import { useGameStore } from './store/gameStore'
import { useUserStore } from './store/userStore'
import { HomeScreen } from './screens/HomeScreen'
import { ModeScreen } from './screens/ModeScreen'
import { PvPScreen } from './screens/PvPScreen'
import { ComputerTypeScreen } from './screens/ComputerTypeScreen'
import { ComputerRankScreen } from './screens/ComputerRankScreen'
import { ComputerRuleScreen } from './screens/ComputerRuleScreen'
import { GameScreen } from './screens/GameScreen'
import { ResultScreen } from './screens/ResultScreen'
import { ReplayScreen } from './screens/ReplayScreen'
import { RecordsScreen } from './screens/RecordsScreen'
import { SpectateScreen, SettingsScreen } from './screens/SpectateScreen'

export function AppRouter() {
  const screen = useGameStore((s) => s.screen)
  const setScreen = useGameStore((s) => s.setScreen)
  const init = useUserStore((s) => s.init)
  const ready = useUserStore((s) => s.ready)

  useEffect(() => {
    void init().then(() => setScreen('home'))
  }, [init, setScreen])

  if (!ready || screen === 'splash') {
    return (
      <div className="splash">
        <h1>오목</h1>
        <p>로딩 중...</p>
      </div>
    )
  }

  switch (screen) {
    case 'home':
      return <HomeScreen />
    case 'mode':
      return <ModeScreen />
    case 'pvp':
      return <PvPScreen />
    case 'computer-type':
      return <ComputerTypeScreen />
    case 'computer-rank':
      return <ComputerRankScreen />
    case 'computer-rule':
      return <ComputerRuleScreen />
    case 'game':
      return <GameScreen />
    case 'result':
      return <ResultScreen />
    case 'replay':
      return <ReplayScreen />
    case 'records':
      return <RecordsScreen />
    case 'spectate':
      return <SpectateScreen />
    case 'settings':
      return <SettingsScreen />
    default:
      return <HomeScreen />
  }
}
