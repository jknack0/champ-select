import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import ChampionCard from './ChampionCard'

const champ = {
  id: 'ahri',
  name: 'Ahri',
  img: 'https://example.com/ahri.png',
}

describe('ChampionCard', () => {
  it('renders champion name and avatar', () => {
    render(<ChampionCard champ={champ} />)
    expect(screen.getByText('Ahri')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Ahri' })).toBeInTheDocument()
  })

  it('calls onPick when selectable', async () => {
    const handlePick = vi.fn()
    const user = userEvent.setup()

    render(<ChampionCard champ={champ} onPick={handlePick} />)
    await user.click(screen.getByRole('button', { name: 'Ahri' }))
    expect(handlePick).toHaveBeenCalledWith(champ)
  })
})
