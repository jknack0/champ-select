import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ChampSelect from './ChampSelect'

const STORAGE_KEYS = {
  champions: 'champ-select-admin:champions',
  donationAmount: 'champ-select-admin:donationAmount',
} as const

const renderPage = () => render(<ChampSelect />)

describe('ChampSelect page', () => {
  let getItemSpy: ReturnType<typeof vi.spyOn>
  let openSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => null)
    openSpy = vi.spyOn(window, 'open').mockImplementation(() => null)
  })

  afterEach(() => {
    window.localStorage.clear()
    vi.restoreAllMocks()
  })

  it('renders default champions and donate button when storage is empty', () => {
    renderPage()

    expect(screen.getByRole('heading', { level: 1, name: /champ select/i })).toBeInTheDocument()

    const donateBtn = screen.getByRole('button', { name: /donate to the stream/i })
    expect(donateBtn).toHaveTextContent('Donate')
    expect(screen.queryByText(/prefilled amount/i)).not.toBeInTheDocument()

    const champions = screen.getAllByRole('listitem')
    expect(champions.length).toBeGreaterThan(0)
    expect(screen.getByText('Ahri')).toBeInTheDocument()
  })

  it('shows formatted donation amount and opens a prefilled link when clicked', async () => {
    const user = userEvent.setup()
    const champions = [
      { id: 'ezreal', name: 'Ezreal', img: 'ezreal.png' },
      { id: 'lux', name: 'Lux', img: 'lux.png' },
    ]

    getItemSpy.mockImplementation((key: string) => {
      if (key === STORAGE_KEYS.donationAmount) {
        return '12.5'
      }
      if (key === STORAGE_KEYS.champions) {
        return JSON.stringify(champions)
      }
      return null
    })

    renderPage()

    const donateBtn = screen.getByRole('button', { name: /donate \$12\.50/i })
    expect(donateBtn).toHaveTextContent('Donate $12.50')
    expect(screen.getByText(/prefilled amount/i)).toBeInTheDocument()

    expect(screen.getAllByRole('listitem')).toHaveLength(champions.length)
    expect(screen.getByText('Ezreal')).toBeInTheDocument()

    await user.click(donateBtn)

    expect(openSpy).toHaveBeenCalledWith(
      'https://streamlabs.com/<your-channel>/tip?amount=12.5',
      '_blank',
      'noopener,noreferrer',
    )
  })

  it('ignores invalid donation amounts and falls back to default label', () => {
    getItemSpy.mockImplementation((key: string) => {
      if (key === STORAGE_KEYS.donationAmount) {
        return '-5'
      }
      return null
    })

    renderPage()

    const donateBtn = screen.getByRole('button', { name: /donate to the stream/i })
    expect(donateBtn).toHaveTextContent('Donate')
    expect(screen.queryByText(/prefilled amount/i)).not.toBeInTheDocument()
  })
})
