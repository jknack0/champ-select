import { useState } from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import DonationControls from './DonationControls'

describe('DonationControls', () => {
  it('allows editing the donation amount and saving', async () => {
    const user = userEvent.setup()
    const handleSave = vi.fn()

    const Wrapper = () => {
      const [amount, setAmount] = useState('10')
      return (
        <DonationControls
          amount={amount}
          onAmountChange={setAmount}
          onSave={handleSave}
          isInvalid={false}
        />
      )
    }

    render(<Wrapper />)

    const input = screen.getByLabelText('Current Donation Amount') as HTMLInputElement
    expect(input.value).toBe('10')

    await user.clear(input)
    await user.type(input, '25.5')
    expect(input.value).toBe('25.5')

    await user.click(screen.getByRole('button', { name: 'Save Amount' }))
    expect(handleSave).toHaveBeenCalledTimes(1)
  })

  it('displays validation messaging when invalid', () => {
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
    expect(screen.getByLabelText('Current Donation Amount')).toHaveAttribute('aria-describedby', 'donation-error')
  })
})






