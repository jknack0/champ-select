import type { Champion } from '../../pages/ChampSelect/types'
import Avatar from '../../atoms/Avatar'
import Card from '../../atoms/Card'
import SelectBadge from '../../atoms/SelectBadge'
import classNames from '../../../lib/classNames'
import styles from './ChampionCard.module.css'

type ChampionCardProps = {
  champ: Champion
  onPick?: (champ: Champion) => void
  isSelected?: boolean
}

const ChampionCard = ({ champ, onPick, isSelected = false }: ChampionCardProps) => {
  const content = (
    <>
      <div className={styles.cardHeader}>
        <Avatar name={champ.name} src={champ.img} />
        <span className={styles.championName}>{champ.name}</span>
      </div>
      {isSelected ? (
        <div className={styles.cardFooter}>
          <SelectBadge tone="success">Selected</SelectBadge>
        </div>
      ) : null}
    </>
  )

  if (onPick) {
    return (
      <Card className={classNames(styles.card, styles.clickable, isSelected && styles.selected)}>
        <button
          type="button"
          className={styles.actionButton}
          onClick={() => onPick(champ)}
          aria-pressed={isSelected}
        >
          <div className={styles.cardBody}>{content}</div>
        </button>
      </Card>
    )
  }

  return (
    <Card className={classNames(styles.card, isSelected && styles.selected)}>
      <div className={styles.cardBody}>{content}</div>
    </Card>
  )
}

export default ChampionCard
