import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { DropResult } from '@hello-pangea/dnd'
import ChampionList from './ChampionList'

let capturedDragEnd: ((result: DropResult) => void) | null = null

vi.mock('@hello-pangea/dnd', () => ({
  DragDropContext: ({ children, onDragEnd }: any) => {
    capturedDragEnd = onDragEnd
    return <div data-testid="drag-context">{children}</div>
  },
  Droppable: ({ children }: any) => {
    const provided = {
      innerRef: () => {},
      droppableProps: { 'data-droppable': 'true' },
      placeholder: null,
    }
    const snapshot = { isDraggingOver: false }
    return <div data-testid="droppable">{children(provided, snapshot)}</div>
  },
  Draggable: ({ children, draggableId }: any) => {
    const provided = {
      innerRef: () => {},
      draggableProps: { style: {}, 'data-draggable-id': draggableId },
      dragHandleProps: { 'data-drag-handle': draggableId },
    }
    const snapshot = { isDragging: false }
    return <div data-testid={`draggable-${draggableId}`}>{children(provided, snapshot)}</div>
  },
}))

describe('ChampionList', () => {
  const champs = [
    { id: 'ahri', name: 'Ahri', img: '/ahri.png' },
    { id: 'yasuo', name: 'Yasuo', img: '/yasuo.png' },
  ]

  beforeEach(() => {
    capturedDragEnd = null
  })

  it('renders each champion name', () => {
    render(<ChampionList champs={champs} onReorder={() => {}} onRemove={() => {}} />)

    expect(screen.getByText('Ahri')).toBeInTheDocument()
    expect(screen.getByText('Yasuo')).toBeInTheDocument()
  })

  it('invokes onRemove when delete button clicked', async () => {
    const handleRemove = vi.fn()
    const user = userEvent.setup()

    render(<ChampionList champs={champs} onReorder={() => {}} onRemove={handleRemove} />)

    await user.click(screen.getByRole('button', { name: 'Remove Ahri' }))
    expect(handleRemove).toHaveBeenCalledWith('ahri')
  })

  it('calls onReorder when drag ends with new position', () => {
    const handleReorder = vi.fn()

    render(<ChampionList champs={champs} onReorder={handleReorder} onRemove={() => {}} />)

    capturedDragEnd?.({
      draggableId: 'ahri',
      type: 'DEFAULT',
      source: { index: 0, droppableId: 'champion-list' },
      destination: { index: 1, droppableId: 'champion-list' },
      reason: 'DROP',
      mode: 'FLUID',
      combine: null,
    } as unknown as DropResult)

    expect(handleReorder).toHaveBeenCalledWith(0, 1)
  })
})

