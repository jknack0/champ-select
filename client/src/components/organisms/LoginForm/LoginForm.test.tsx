import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import LoginForm from './LoginForm'

describe('LoginForm', () => {
  it('submits email and password values', async () => {
    const user = userEvent.setup()
    const handleSubmit = vi.fn()

    render(<LoginForm onSubmit={handleSubmit} />)

    const email = screen.getByLabelText('Email') as HTMLInputElement
    const password = screen.getByLabelText('Password') as HTMLInputElement

    await user.type(email, 'a@b.com')
    await user.type(password, 'secret')
    await user.click(screen.getByRole('button', { name: 'Sign In' }))

    expect(handleSubmit).toHaveBeenCalledWith({ email: 'a@b.com', password: 'secret' })
  })
})
