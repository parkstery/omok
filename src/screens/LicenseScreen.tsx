import { TopBar } from '../components/ui/TopBar'
import { useGameStore } from '../store/gameStore'
import './Screen.css'

const APP_REPO = 'https://github.com/parkstery/omok'
const RAPFI_REPO = 'https://github.com/dhbloo/rapfi'

export function LicenseScreen() {
  const setScreen = useGameStore((s) => s.setScreen)

  return (
    <div className="screen">
      <TopBar title="오픈소스" onBack={() => setScreen('settings')} />
      <main className="screen-main compact license-main">
        <section className="license-block">
          <h3>Rapfi 엔진</h3>
          <p>
            컴퓨터 대전 AI는 <strong>Rapfi</strong> WASM을 사용합니다. GNU General Public License v3.0.
          </p>
          <a href={RAPFI_REPO} target="_blank" rel="noreferrer" className="license-link">
            github.com/dhbloo/rapfi
          </a>
        </section>
        <section className="license-block">
          <h3>오목 앱</h3>
          <p>본 앱 소스 코드는 GitHub에서 확인할 수 있습니다.</p>
          <a href={APP_REPO} target="_blank" rel="noreferrer" className="license-link">
            github.com/parkstery/omok
          </a>
        </section>
        <section className="license-block">
          <h3>기타 라이브러리</h3>
          <ul className="license-list">
            <li>@algorithm.ts/gomoku — MIT</li>
            <li>React, Vite, Zustand — MIT</li>
            <li>Firebase — Apache 2.0</li>
          </ul>
        </section>
        <p className="license-note">
          Rapfi를 배포할 때 GPL-3.0 라이선스 전문과 소스 제공 의무를 준수해야 합니다.
        </p>
      </main>
    </div>
  )
}
