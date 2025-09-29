import { createElement } from 'react'
import type { ReactNode } from 'react'
import styles from './Heading.module.css'

const headingTagMap = {
  1: 'h1',
  2: 'h2',
  3: 'h3',
} as const

type HeadingProps = {
  level: 1 | 2 | 3
  children: ReactNode
  className?: string
}

const Heading = ({ level, children, className }: HeadingProps) => {
  const levelKey = `headingH${level}` as keyof typeof styles
  const classes = [styles.heading, styles[levelKey], className].filter(Boolean).join(' ')
  return createElement(headingTagMap[level], { className: classes }, children)
}

export default Heading
