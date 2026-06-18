import './Card.css'

interface CardProps {
  title?: string
  description?: string
  onClick?: () => void
  className?: string
  children?: React.ReactNode
}

export function Card({ title, description, onClick, className = '', children }: CardProps) {
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag
      type={onClick ? 'button' : undefined}
      className={['ui-card', onClick ? 'ui-card--clickable' : '', className].filter(Boolean).join(' ')}
      onClick={onClick}
    >
      {title && <h3 className="ui-card__title">{title}</h3>}
      {description && <p className="ui-card__desc">{description}</p>}
      {children}
    </Tag>
  )
}
