import './Button.css'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  subLabel?: string
}

export function Button({
  variant = 'secondary',
  size = 'md',
  fullWidth = false,
  subLabel,
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={[
        'ui-btn',
        `ui-btn--${variant}`,
        `ui-btn--${size}`,
        fullWidth ? 'ui-btn--full' : '',
        subLabel ? 'ui-btn--column' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      <span>{children}</span>
      {subLabel && <span className="ui-btn__sub">{subLabel}</span>}
    </button>
  )
}
