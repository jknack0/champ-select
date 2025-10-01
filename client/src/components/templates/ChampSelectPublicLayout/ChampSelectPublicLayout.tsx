import type { ReactNode } from 'react'
import styles from './ChampSelectPublicLayout.module.css'

type ChampSelectPublicLayoutProps = {
  header: ReactNode
  donationBar: ReactNode
  main: ReactNode
  selectionBanner?: ReactNode
}

const ChampSelectPublicLayout = ({ header, donationBar, main, selectionBanner }: ChampSelectPublicLayoutProps) => {
  return (
    <div className={styles.container}>
      <div className={styles.stack}>
        {header}
        {selectionBanner ?? null}
        {donationBar}
        {main}
      </div>
    </div>
  )
}

export default ChampSelectPublicLayout
