import type { Champion } from '../../pages/ChampSelect/types'
import Avatar from '../../atoms/Avatar'
import Card from '../../atoms/Card'
import SelectBadge from '../../atoms/SelectBadge'
import classNames from '../../../lib/classNames'

type ChampionCardProps = {
  champ: Champion
  onPick?: (champ: Champion) => void
  isSelected?: boolean
}

const ChampionCard = ({ champ, onPick, isSelected = false }: ChampionCardProps) => {
  const content = (
    <>
      <div className="champion-card-header">
        <Avatar name={champ.name} src={champ.img} />
        <span className="champion-card-name">{champ.name}</span>
      </div>
      {isSelected ? (
        <div className="champion-card-footer">
          <SelectBadge tone="success">Selected</SelectBadge>
        </div>
      ) : null}
    </>
  )

  if (onPick) {
    return (
      <Card className={classNames('champion-card', 'clickable', isSelected && 'selected')}>
        <button
          type="button"
          className="champion-card-action"
          onClick={() => onPick(champ)}
          aria-pressed={isSelected}
        >
          {content}
        </button>
      </Card>
    )
  }

  return (
    <Card className={classNames('champion-card', isSelected && 'selected')}>
      <div className="champion-card-body">{content}</div>
    </Card>
  )
}

export default ChampionCard

