import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import Button from './Button'

describe('Button', () => {
  it('renders children and triggers click handler', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()

    render(
      <Button onClick={handleClick} ariaLabel="Save changes">
        Save
      </Button>,
    )

    const button = screen.getByRole('button', { name: 'Save changes' })
    expect(button).toHaveTextContent('Save')

    await user.click(button)
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('respects the disabled state', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()

    render(
      <Button onClick={handleClick} disabled>
        Disabled
      </Button>,
    )

    const button = screen.getByRole('button', { name: 'Disabled' })
    expect(button).toBeDisabled()

    await user.click(button)
    expect(handleClick).not.toHaveBeenCalled()
  })
})






