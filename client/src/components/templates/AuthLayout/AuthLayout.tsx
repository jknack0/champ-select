import styles from './AuthLayout.module.css'

const AuthLayout = ({ children }: { children: React.ReactNode }) => (
  <div className={styles.page}>
    <div className={styles.container}>{children}</div>
  </div>
)

export default AuthLayout
