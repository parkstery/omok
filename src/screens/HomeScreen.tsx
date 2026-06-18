import { BannerAd } from '../components/BannerAd'
import { DEFAULT_RANK, winsRequiredForPromotion } from '../core/rank'
import { useGameStore } from '../store/gameStore'
import { useUserStore } from '../store/userStore'

export function HomeScreen() {
  const setScreen = useGameStore((s) => s.setScreen)
  const startQuickComputer = useGameStore((s) => s.startQuickComputer)
  const initLocalPvp = useGameStore((s) => s.initLocalPvp)
  const profile = useUserStore((s) => s.profile)
  const winsAtRank = useUserStore((s) => s.profile?.winsAtRank ?? 0)
  const rank = profile?.rank ?? DEFAULT_RANK
  const winsRequired = winsRequiredForPromotion(rank)

  if (!profile) return null

  return (
    <div className="flex h-dvh flex-col bg-[#fff8e1]">
      <BannerAd />
      <header className="flex shrink-0 items-center justify-between border-b border-stone-300/80 px-3 py-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-stone-800">{profile.nickname}</p>
          <p className="text-xs text-stone-500">
            {profile.rank} · 승급 {winsAtRank}/{winsRequired} · {profile.stats.wins}승 {profile.stats.losses}패
          </p>
        </div>
        <button
          type="button"
          className="shrink-0 rounded px-2 py-1 text-xs text-stone-600 hover:bg-stone-200/60"
          onClick={() => setScreen('settings')}
        >
          설정
        </button>
      </header>

      <main className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-3">
        <section className="rounded-lg border border-stone-300/70 bg-white/50 p-3">
          <p className="mb-2 text-xs font-medium text-stone-600">빠른 대국</p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              className="rounded-md bg-[#5d4037] px-2 py-2 text-xs font-medium text-white hover:bg-[#4e342e]"
              onClick={() => startQuickComputer('engine')}
            >
              컴퓨터
            </button>
            <button
              type="button"
              className="rounded-md border border-stone-400 bg-white px-2 py-2 text-xs font-medium text-stone-800 hover:bg-stone-50"
              onClick={() => setScreen('pvp')}
            >
              온라인
            </button>
            <button
              type="button"
              className="rounded-md border border-stone-400 bg-white px-2 py-2 text-xs font-medium text-stone-800 hover:bg-stone-50"
              onClick={() => initLocalPvp('freestyle', profile.rank, profile.rank)}
            >
              2인
            </button>
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-stone-500">
            컴퓨터 대국은 현재 급·단({profile.rank}) AI와 대결합니다. 같은 급·단에서 {winsRequired}승 시 승급합니다.
          </p>
        </section>

        <section className="grid grid-cols-2 gap-2">
          <button
            type="button"
            className="rounded-md border border-stone-300 bg-white px-2 py-2 text-left text-xs text-stone-700 hover:bg-stone-50"
            onClick={() => setScreen('records')}
          >
            <span className="block font-medium">기보</span>
            <span className="text-[11px] text-stone-500">저장된 대국</span>
          </button>
          <button
            type="button"
            className="rounded-md border border-stone-300 bg-white px-2 py-2 text-left text-xs text-stone-700 hover:bg-stone-50"
            onClick={() => setScreen('spectate')}
          >
            <span className="block font-medium">관전</span>
            <span className="text-[11px] text-stone-500">진행 중 대국</span>
          </button>
        </section>

        <details className="rounded-lg border border-stone-300/70 bg-white/40 px-3 py-2 text-xs text-stone-600">
          <summary className="cursor-pointer font-medium text-stone-700">고급 AI · 색 선택</summary>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded border border-stone-300 px-2 py-1 hover:bg-stone-100"
              onClick={() => startQuickComputer('ai', 'random')}
            >
              AI · 랜덤
            </button>
            <button
              type="button"
              className="rounded border border-stone-300 px-2 py-1 hover:bg-stone-100"
              onClick={() => startQuickComputer('engine', 1)}
            >
              엔진 · 흑
            </button>
            <button
              type="button"
              className="rounded border border-stone-300 px-2 py-1 hover:bg-stone-100"
              onClick={() => startQuickComputer('engine', 2)}
            >
              엔진 · 백
            </button>
          </div>
        </details>
      </main>
    </div>
  )
}
