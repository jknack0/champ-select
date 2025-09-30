import type { DraggableProvidedDragHandleProps } from '@hello-pangea/dnd'
import type { Champion } from '../../../types/champion'
import { Avatar, IconButton } from '../../atoms'
import styles from './ChampionRow.module.css'

type ChampionRowProps = {
  champ: Champion
  onRemove: (id: string) => void
  dragHandleProps?: DraggableProvidedDragHandleProps | null
}

const ChampionRow = ({ champ, onRemove, dragHandleProps }: ChampionRowProps) => (
  <div className={styles.row}>
    <div className={styles.info} {...(dragHandleProps ?? {})}>
      <Avatar name={champ.name} src={champ.imageUrl} />
      <span className={styles.name}>{champ.name}</span>
    </div>
    <IconButton icon="x" onClick={() => onRemove(champ.id)} ariaLabel={`Remove ${champ.name}`} />
  </div>
)

export default ChampionRow
