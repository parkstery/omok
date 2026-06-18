import './Toggle.css'

interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  description?: string
}

export function Toggle({ checked, onChange, label, description }: ToggleProps) {
  return (
    <label className="ui-toggle">
      <span className="ui-toggle__text">
        <span className="ui-toggle__label">{label}</span>
        {description && <span className="ui-toggle__desc">{description}</span>}
      </span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="ui-toggle__track" aria-hidden />
    </label>
  )
}
