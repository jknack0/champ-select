import type { ReactNode } from 'react'
import styles from './InlineError.module.css'

type InlineErrorProps = {
  children: ReactNode
  id: string
}

const InlineError = ({ children, id }: InlineErrorProps) => (
  <p id={id} className={styles.error}>
    {children}
  </p>
)

export default InlineError
