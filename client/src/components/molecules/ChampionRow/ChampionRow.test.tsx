import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import type { DraggableProvidedDragHandleProps } from '@hello-pangea/dnd'
import ChampionRow from './ChampionRow'

const champ = {
  id: 'ahri',
  name: 'Ahri',
  imageUrl: '/ahri.png',
  role: null,
  tags: [],
  isActive: true,
}

describe('ChampionRow', () => {
  it('renders champion info and remove button', () => {
    render(<ChampionRow champ={champ} onRemove={() => {}} dragHandleProps={null} />)

    expect(screen.getByText('Ahri')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Remove Ahri' })).toBeInTheDocument()
  })

  it('passes drag handle props to the info container', () => {
    const handleProps = {
      'data-drag-handle': 'drag-handle',
    } as unknown as DraggableProvidedDragHandleProps

    render(<ChampionRow champ={champ} onRemove={() => {}} dragHandleProps={handleProps} />)

    const info = screen.getByText('Ahri').closest('div')
    expect(info).toHaveAttribute('data-drag-handle', 'drag-handle')
  })

  it('invokes onRemove when the button is clicked', async () => {
    const handleRemove = vi.fn()
    const user = userEvent.setup()

    render(<ChampionRow champ={champ} onRemove={handleRemove} dragHandleProps={null} />)

    await user.click(screen.getByRole('button', { name: 'Remove Ahri' }))
    expect(handleRemove).toHaveBeenCalledWith('ahri')
  })
})
