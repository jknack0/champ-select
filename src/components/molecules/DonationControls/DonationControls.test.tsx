import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DonationControls from './DonationControls'

describe('DonationControls', () => {
  it('updates the amount and calls save handler', async () => {
    let latestValue = '10'
    const handleChange = vi.fn((value: string) => {
      latestValue = value
    })
    const handleSave = vi.fn()
    const user = userEvent.setup()

    const { rerender } = render(
      <DonationControls
        amount={latestValue}
        onAmountChange={handleChange}
        onSave={handleSave}
        isInvalid={false}
      />,
    )

    const input = screen.getByLabelText('Current Donation Amount')
    await user.clear(input)
    await user.type(input, '25.5')

    expect(handleChange).toHaveBeenCalled()

    rerender(
      <DonationControls
        amount={latestValue}
        onAmountChange={handleChange}
        onSave={handleSave}
        isInvalid={false}
      />,
    )

    expect(screen.getByLabelText('Current Donation Amount')).toHaveValue('25.5')

    await user.click(screen.getByRole('button', { name: 'Save Amount' }))
    expect(handleSave).toHaveBeenCalledTimes(1)
  })

  it('shows an inline error when invalid', () => {
    render(
      <DonationControls
        amount=""
        onAmountChange={() => {}}
        onSave={() => {}}
        isInvalid
        errorId="donation-error"
        errorMessage="Enter a number"
      />,
    )

    expect(screen.getByText('Enter a number')).toBeInTheDocument()
    const input = screen.getByLabelText('Current Donation Amount')
    expect(input).toHaveAttribute('aria-describedby', 'donation-error')
  })
})

