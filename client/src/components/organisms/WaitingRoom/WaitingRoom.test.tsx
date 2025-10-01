import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import WaitingRoom from './WaitingRoom'

describe('WaitingRoom', () => {
  it('shows connection status and amount message', () => {
    render(<WaitingRoom amountLabel="" connected lastEventAt="2025-01-01T12:00:00.000Z" />)

    expect(screen.getByText('Waiting for a matching donation.')).toBeInTheDocument()
    expect(screen.getByText('We will unlock the picker as soon as a  donation arrives.')).toBeInTheDocument()
    expect(screen.getByText('Socket Connected')).toBeInTheDocument()
    expect(screen.getByText(/Last event/)).toBeInTheDocument()
  })
})
