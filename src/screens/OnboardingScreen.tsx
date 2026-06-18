import { useState } from 'react'
import { RankPicker } from '../components/RankPicker'
import { Button } from '../components/ui/Button'
import { useGameStore } from '../store/gameStore'
import { useUserStore } from '../store/userStore'
import './Screen.css'

export function OnboardingScreen() {
  const completeOnboarding = useUserStore((s) => s.completeOnboarding)
  const setScreen = useGameStore((s) => s.setScreen)
  const [nickname, setNickname] = useState('')
  const [rank, setRank] = useState('15급')

  const canStart = nickname.trim().length >= 2

  return (
    <div className="screen onboarding-screen">
      <main className="screen-main onboarding-main">
        <div className="onboarding-hero">
          <h1>환영합니다</h1>
          <p>닉네임과 급·단을 설정하면 대국을 시작할 수 있습니다.</p>
        </div>
        <div className="field">
          <label htmlFor="onboard-nick">닉네임</label>
          <input
            id="onboard-nick"
            className="text-input"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="2자 이상"
            maxLength={12}
          />
        </div>
        <div className="field field--wide">
          <label>급·단</label>
          <RankPicker value={rank} onChange={setRank} />
        </div>
        <Button
          variant="primary"
          size="lg"
          fullWidth
          disabled={!canStart}
          onClick={() => {
            completeOnboarding(nickname.trim(), rank)
            setScreen('home')
          }}
        >
          시작하기
        </Button>
      </main>
    </div>
  )
}
