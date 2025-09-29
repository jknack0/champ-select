import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import SignupForm from './SignupForm'

describe('SignupForm', () => {
  it('submits email and password values', async () => {
    const user = userEvent.setup()
    const handleSubmit = vi.fn()

    render(<SignupForm onSubmit={handleSubmit} />)

    const email = screen.getByLabelText('Email') as HTMLInputElement
    const password = screen.getByLabelText('Password') as HTMLInputElement

    await user.type(email, 'new@user.com')
    await user.type(password, 'secret')
    await user.click(screen.getByRole('button', { name: 'Sign Up' }))

    expect(handleSubmit).toHaveBeenCalledWith({ email: 'new@user.com', password: 'secret' })
  })
})
