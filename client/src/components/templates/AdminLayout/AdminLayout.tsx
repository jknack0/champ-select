import type { ReactNode } from 'react'
import styles from './AdminLayout.module.css'

type AdminLayoutProps = {
  header: ReactNode
  donation: ReactNode
  championList: ReactNode
}

const AdminLayout = ({ header, donation, championList }: AdminLayoutProps) => (
  <div className={styles.page}>
    <div className={[styles.container, styles.layout].join(' ')}>
      {header}
      {donation}
      {championList}
    </div>
  </div>
)

export default AdminLayout
