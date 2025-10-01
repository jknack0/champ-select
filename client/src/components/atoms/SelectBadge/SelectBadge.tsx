import type { ReactNode } from 'react'
import classNames from '../../../lib/classNames'

type SelectBadgeProps = {
  children: ReactNode
  tone?: 'default' | 'info' | 'success' | 'warning'
  className?: string
}

const SelectBadge = ({ children, tone = 'default', className }: SelectBadgeProps) => {
  return <span className={classNames('badge', `badge-${tone}`, className)}>{children}</span>
}

export default SelectBadge
