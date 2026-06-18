import { useState } from 'react'
import { DEFAULT_RANK } from '../core/rank'
import { useGameStore } from '../store/gameStore'
import { useUserStore } from '../store/userStore'

export function OnboardingScreen() {
  const completeOnboarding = useUserStore((s) => s.completeOnboarding)
  const setScreen = useGameStore((s) => s.setScreen)
  const [nickname, setNickname] = useState('')

  const canStart = nickname.trim().length >= 2

  return (
    <div className="flex h-dvh flex-col bg-[#fff8e1]">
      <main className="flex flex-1 flex-col justify-center gap-4 overflow-y-auto px-4 py-6">
        <div className="text-center">
          <h1 className="text-xl font-bold text-stone-800">환영합니다</h1>
          <p className="mt-1 text-sm text-stone-600">닉네임만 입력하면 {DEFAULT_RANK}부터 시작합니다.</p>
        </div>

        <label className="block">
          <span className="mb-1 block text-xs font-medium text-stone-600">닉네임</span>
          <input
            className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-amber-600"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="2자 이상"
            maxLength={12}
          />
        </label>

        <p className="rounded-md border border-stone-300/70 bg-white/50 px-3 py-2 text-xs leading-relaxed text-stone-600">
          같은 급·단 AI와 2승(단은 3승)하면 승급합니다. 패배 시 승급 진행은 초기화됩니다.
        </p>

        <button
          type="button"
          disabled={!canStart}
          className="rounded-md bg-[#5d4037] py-2.5 text-sm font-medium text-white enabled:hover:bg-[#4e342e] disabled:opacity-40"
          onClick={() => {
            completeOnboarding(nickname.trim())
            setScreen('home')
          }}
        >
          시작하기
        </button>
      </main>
    </div>
  )
}
