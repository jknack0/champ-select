import type { ReactNode } from 'react'
import styles from './Button.module.css'

type ButtonVariant = 'solid' | 'ghost'

type ButtonProps = {
  children: ReactNode
  onClick?: () => void
  variant?: ButtonVariant
  ariaLabel?: string
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
}

const Button = ({ children, onClick, variant = 'solid', ariaLabel, type = 'button', disabled }: ButtonProps) => {
  const className = [styles.button, variant === 'solid' ? styles.solid : styles.ghost]
    .filter(Boolean)
    .join(' ')

  return (
    <button type={type} className={className} onClick={onClick} aria-label={ariaLabel} disabled={disabled}>
      {children}
    </button>
  )
}

export default Button
