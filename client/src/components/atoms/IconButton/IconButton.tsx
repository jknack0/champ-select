import type { ReactNode } from 'react'
import styles from './IconButton.module.css'

type IconButtonProps = {
  icon: ReactNode
  onClick?: () => void
  ariaLabel: string
  type?: 'button' | 'submit' | 'reset'
}

const IconButton = ({ icon, onClick, ariaLabel, type = 'button' }: IconButtonProps) => (
  <button type={type} className={styles.button} onClick={onClick} aria-label={ariaLabel}>
    {icon}
  </button>
)

export default IconButton
