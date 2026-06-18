import './StatusBadge.css'

type BadgeTone = 'default' | 'accent' | 'turn' | 'thinking'

interface StatusBadgeProps {
  children: React.ReactNode
  tone?: BadgeTone
}

export function StatusBadge({ children, tone = 'default' }: StatusBadgeProps) {
  return <span className={['ui-badge', tone !== 'default' ? `ui-badge--${tone}` : ''].filter(Boolean).join(' ')}>{children}</span>
}
