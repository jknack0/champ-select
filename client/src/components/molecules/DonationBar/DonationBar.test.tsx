import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import DonationBar from './DonationBar'

describe('DonationBar', () => {
  it('renders donation messaging and triggers click', async () => {
    const handleDonate = vi.fn()
    const user = userEvent.setup()

    render(
      <DonationBar
        amountLabel=""
        donationUrl="https://example.com"
        hasPrefilledAmount
        onDonateClick={handleDonate}
      />,
    )

    expect(screen.getByText('Support the stream')).toBeInTheDocument()
    expect(screen.getByText('Prefilled ')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Donate ' }))
    expect(handleDonate).toHaveBeenCalledTimes(1)
  })
})
