import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import AuthActions from './AuthActions'

describe('AuthActions', () => {
  it('calls onSubmit on click', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()

    render(<AuthActions primaryText="Sign In" onSubmit={onSubmit} />)

    await user.click(screen.getByRole('button', { name: 'Sign In' }))
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })

  it('shows secondary content', () => {
    render(<AuthActions primaryText="Continue" onSubmit={() => {}} secondary={<span>Help</span>} />)
    expect(screen.getByText('Help')).toBeInTheDocument()
  })
})
