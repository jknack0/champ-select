import type { ReactNode } from 'react'
import classNames from '../../../lib/classNames'
import styles from './SelectBadge.module.css'

type SelectBadgeProps = {
  children: ReactNode
  tone?: 'default' | 'info' | 'success' | 'warning'
  className?: string
}

const SelectBadge = ({ children, tone = 'default', className }: SelectBadgeProps) => {
  const toneClass = styles[tone] ?? styles.default
  return <span className={classNames(styles.badge, toneClass, className)}>{children}</span>
}

export default SelectBadge
