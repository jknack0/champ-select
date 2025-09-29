import styles from './AuthCard.module.css'
import { Card, Heading } from '../../atoms'

const AuthCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <Card className={styles.card}>
    <Heading level={2}>{title}</Heading>
    <div className={styles.body}>{children}</div>
  </Card>
)

export default AuthCard
