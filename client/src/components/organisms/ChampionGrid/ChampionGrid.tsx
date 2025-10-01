import type { Champion } from '../../pages/ChampSelect/types'
import Card from '../../atoms/Card'
import Heading from '../../atoms/Heading'
import SelectText from '../../atoms/SelectText'
import ChampionCard from '../../molecules/ChampionCard/ChampionCard'
import styles from './ChampionGrid.module.css'

type ChampionGridProps = {
  champs: Champion[]
  mode: 'view' | 'pick'
  onPick?: (champ: Champion) => void
  selectedChampionId?: string | null
}

const ChampionGrid = ({ champs, mode, onPick, selectedChampionId }: ChampionGridProps) => {
  if (!champs.length) {
    return (
      <Card className={styles.emptyState}>
        <Heading level={3}>No champions available</Heading>
        <SelectText tone="muted">Check back soon-your streamer has not published a roster yet.</SelectText>
      </Card>
    )
  }

  return (
    <div className={styles.grid}>
      {champs.map((champion) => (
        <ChampionCard
          key={champion.id}
          champ={champion}
          onPick={mode === 'pick' ? onPick : undefined}
          isSelected={Boolean(selectedChampionId && selectedChampionId === champion.id)}
        />
      ))}
    </div>
  )
}

export default ChampionGrid
