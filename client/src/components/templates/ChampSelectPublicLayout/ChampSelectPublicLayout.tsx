import type { ReactNode } from 'react'

type ChampSelectPublicLayoutProps = {
  header: ReactNode
  donationBar: ReactNode
  main: ReactNode
  selectionBanner?: ReactNode
}

const ChampSelectPublicLayout = ({ header, donationBar, main, selectionBanner }: ChampSelectPublicLayoutProps) => {
  return (
    <div className="champ-select-container">
      <div className="layout-stack">
        {header}
        {selectionBanner ?? null}
        {donationBar}
        {main}
      </div>
    </div>
  )
}

export default ChampSelectPublicLayout
