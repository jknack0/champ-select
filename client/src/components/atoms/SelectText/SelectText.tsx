import type { ReactNode } from 'react'
import classNames from '../../../lib/classNames'

type SelectTextProps = {
  children: ReactNode
  as?: 'p' | 'span'
  tone?: 'default' | 'muted'
  className?: string
}

const SelectText = ({ children, as: Component = 'p', tone = 'default', className }: SelectTextProps) => {
  return <Component className={classNames('text', tone === 'muted' && 'text-muted', className)}>{children}</Component>
}

export default SelectText
