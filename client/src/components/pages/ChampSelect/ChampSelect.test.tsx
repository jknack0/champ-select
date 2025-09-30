import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ChampSelect from './ChampSelect'
import type { PublicRosterResponse } from '../../../lib/endpoints'

vi.mock('../../../lib/endpoints', () => ({
  fetchPublicRoster: vi.fn(),
}))

const socketMock = {
  on: vi.fn(),
  off: vi.fn(),
}

vi.mock('../../../lib/realtime', () => ({
  getRealtimeSocket: vi.fn(() => socketMock),
}))

import { fetchPublicRoster } from '../../../lib/endpoints'
import { getRealtimeSocket } from '../../../lib/realtime'

const fetchPublicRosterMock = vi.mocked(fetchPublicRoster)
const getRealtimeSocketMock = vi.mocked(getRealtimeSocket)

const baseRosterResponse = (): PublicRosterResponse => ({
  roster: {
    id: 1,
    name: 'Stream Default',
    isPublic: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  champions: [
    {
      id: 'ahri',
      name: 'Ahri',
      imageUrl: 'https://example.com/ahri.png',
      role: null,
      tags: [],
      isActive: true,
      position: 0,
    },
    {
      id: 'leesin',
      name: 'Lee Sin',
      imageUrl: 'https://example.com/leesin.png',
      role: null,
      tags: [],
      isActive: true,
      position: 1,
    },
  ],
  donationSettings: null,
})

const renderPage = (initialEntry = '/champ-select') =>
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/champ-select/:ownerId?" element={<ChampSelect />} />
      </Routes>
    </MemoryRouter>,
  )

describe('ChampSelect page', () => {
  let openSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    fetchPublicRosterMock.mockReset()
    socketMock.on.mockReset()
    socketMock.off.mockReset()
    getRealtimeSocketMock.mockClear()
    openSpy = vi.spyOn(window, 'open') as ReturnType<typeof vi.spyOn>
    openSpy.mockImplementation(() => null)
  })

  afterEach(() => {
    openSpy.mockRestore()
  })

  it('renders champions and default donate button when no amount is set', async () => {
    fetchPublicRosterMock.mockResolvedValueOnce(baseRosterResponse())

    renderPage()

    await waitFor(() => {
      expect(fetchPublicRosterMock).toHaveBeenCalledWith(undefined)
    })

    const heading = await screen.findByRole('heading', { level: 1, name: /champ select/i })
    expect(heading).toBeInTheDocument()

    const donateBtn = screen.getByRole('button', { name: /donate to the stream/i })
    expect(donateBtn).toHaveTextContent('Donate')
    expect(screen.queryByText(/prefilled amount/i)).not.toBeInTheDocument()

    const champions = screen.getAllByRole('listitem')
    expect(champions).toHaveLength(2)
    expect(screen.getByText('Ahri')).toBeInTheDocument()
    expect(screen.getByText('Lee Sin')).toBeInTheDocument()
  })

  it('shows formatted donation amount and opens a prefilled link when clicked', async () => {
    const response = baseRosterResponse()
    response.donationSettings = {
      streamlabsUrl: 'https://streamlabs.com/my-channel/tip',
      defaultAmount: 12.5,
      currency: 'USD',
    }
    fetchPublicRosterMock.mockResolvedValueOnce(response)

    const user = userEvent.setup()

    renderPage()

    const donateBtn = await screen.findByRole('button', { name: /donate \$12\.50/i })
    expect(donateBtn).toHaveTextContent('Donate $12.50')
    expect(screen.getByText(/prefilled amount/i)).toBeInTheDocument()

    await user.click(donateBtn)

    expect(openSpy).toHaveBeenCalledWith(
      'https://streamlabs.com/my-channel/tip?amount=12.5',
      '_blank',
      'noopener,noreferrer',
    )
  })

  it('falls back to generic donate label when amount is invalid', async () => {
    const response = baseRosterResponse()
    response.donationSettings = {
      streamlabsUrl: 'https://streamlabs.com/my-channel/tip',
      defaultAmount: null,
      currency: 'USD',
    }
    fetchPublicRosterMock.mockResolvedValueOnce(response)

    renderPage()

    const donateBtn = await screen.findByRole('button', { name: /donate to the stream/i })
    expect(donateBtn).toHaveTextContent('Donate')
    expect(screen.queryByText(/prefilled amount/i)).not.toBeInTheDocument()
  })

  it('shows an error message when the roster request fails', async () => {
    fetchPublicRosterMock.mockRejectedValueOnce(new Error('No roster found'))

    renderPage()

    await waitFor(() => {
      expect(screen.getByText('No roster found')).toBeInTheDocument()
    })
  })

  it('requests a specific roster when an owner id is present in the path', async () => {
    fetchPublicRosterMock.mockResolvedValueOnce(baseRosterResponse())

    renderPage('/champ-select/42')

    await waitFor(() => {
      expect(fetchPublicRosterMock).toHaveBeenCalledWith('42')
    })
  })
})
