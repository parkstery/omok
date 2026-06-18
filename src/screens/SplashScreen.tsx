import './SplashScreen.css'

interface SplashScreenProps {
  message: string
  progress: number
}

export function SplashScreen({ message, progress }: SplashScreenProps) {
  return (
    <div className="splash-screen">
      <div className="splash-screen__logo" aria-hidden>
        ⚫
      </div>
      <h1 className="splash-screen__title">오목</h1>
      <p className="splash-screen__msg">{message}</p>
      <div className="splash-screen__bar" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
        <div className="splash-screen__fill" style={{ width: `${progress}%` }} />
      </div>
    </div>
  )
}
