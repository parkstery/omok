import { Button } from './Button'
import './TopBar.css'

interface TopBarProps {
  title: string
  onBack?: () => void
  backLabel?: string
  onHelp?: () => void
  right?: React.ReactNode
}

export function TopBar({ title, onBack, backLabel = '←', onHelp, right }: TopBarProps) {
  return (
    <header className="ui-topbar">
      <div className="ui-topbar__side">
        {onBack && (
          <Button variant="ghost" onClick={onBack}>
            {backLabel}
          </Button>
        )}
      </div>
      <span className="ui-topbar__title">{title}</span>
      <div className="ui-topbar__side ui-topbar__side--right">
        {right}
        {onHelp && (
          <button type="button" className="ui-topbar__icon" onClick={onHelp} aria-label="도움말">
            ?
          </button>
        )}
      </div>
    </header>
  )
}
