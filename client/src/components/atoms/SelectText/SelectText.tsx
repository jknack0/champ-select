import type { ReactNode } from 'react'
import classNames from '../../../lib/classNames'
import styles from './SelectText.module.css'

type SelectTextProps = {
  children: ReactNode
  as?: 'p' | 'span'
  tone?: 'default' | 'muted'
  className?: string
}

const SelectText = ({ children, as: Component = 'p', tone = 'default', className }: SelectTextProps) => {
  const toneClass = tone === 'muted' ? styles.muted : undefined
  return <Component className={classNames(styles.text, toneClass, className)}>{children}</Component>
}

export default SelectText
