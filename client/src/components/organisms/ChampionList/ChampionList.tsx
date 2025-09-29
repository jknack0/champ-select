import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from '@hello-pangea/dnd'
import type { Champion } from '../../../types/champion'
import { Card } from '../../atoms'
import { ChampionRow } from '../../molecules'
import styles from './ChampionList.module.css'

type ChampionListProps = {
  champs: Champion[]
  onReorder: (fromIndex: number, toIndex: number) => void
  onRemove: (id: string) => void
}

const ChampionList = ({ champs, onReorder, onRemove }: ChampionListProps) => {
  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result
    if (!destination || destination.index === source.index) {
      return
    }
    onReorder(source.index, destination.index)
  }

  return (
    <Card className={styles.cardOverride}>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="champion-list">
          {(dropProvided) => (
            <ul className={styles.list} ref={dropProvided.innerRef} {...dropProvided.droppableProps}>
              {champs.map((champ, index) => (
                <Draggable key={champ.id} draggableId={champ.id} index={index}>
                  {(dragProvided, snapshot) => (
                    <li
                      ref={dragProvided.innerRef}
                      {...dragProvided.draggableProps}
                      style={dragProvided.draggableProps.style}
                      className={[styles.item, snapshot.isDragging ? styles.dragging : undefined]
                        .filter(Boolean)
                        .join(' ')}
                    >
                      <ChampionRow
                        champ={champ}
                        onRemove={onRemove}
                        dragHandleProps={dragProvided.dragHandleProps}
                      />
                    </li>
                  )}
                </Draggable>
              ))}
              {dropProvided.placeholder}
            </ul>
          )}
        </Droppable>
      </DragDropContext>
    </Card>
  )
}

export default ChampionList
