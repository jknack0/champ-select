import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import ChampionGrid from './ChampionGrid'

const sampleChamps = [
  { id: 'ahri', name: 'Ahri', img: 'https://example.com/ahri.png' },
  { id: 'akali', name: 'Akali', img: 'https://example.com/akali.png' },
]

describe('ChampionGrid', () => {
  it('shows empty state when list is empty', () => {
    render(<ChampionGrid champs={[]} mode="view" />)
    expect(screen.getByText('No champions available')).toBeInTheDocument()
  })

  it('renders champions and allows picking', async () => {
    const handlePick = vi.fn()
    const user = userEvent.setup()

    render(<ChampionGrid champs={sampleChamps} mode="pick" onPick={handlePick} selectedChampionId={null} />)

    await user.click(screen.getByRole('button', { name: 'Ahri' }))
    expect(handlePick).toHaveBeenCalledWith(sampleChamps[0])
  })
})
