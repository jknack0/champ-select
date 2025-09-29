import type { ReactNode } from 'react'
import styles from './Card.module.css'

type CardProps = {
  children: ReactNode
  className?: string
}

const Card = ({ children, className }: CardProps) => {
  const classes = [styles.card, className].filter(Boolean).join(' ')
  return <section className={classes}>{children}</section>
}

export default Card
