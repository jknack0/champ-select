import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import FormField from './FormField'

describe('FormField', () => {
  it('renders label and updates value', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()

    render(
      <FormField
        id="email"
        label="Email"
        value=""
        onChange={handleChange}
        type="email"
      />,
    )

    const input = screen.getByLabelText('Email') as HTMLInputElement
    expect(input.value).toBe('')

    await user.type(input, 'a')
    expect(handleChange).toHaveBeenCalled()
  })

  it('displays an error with aria wiring', () => {
    render(
      <FormField
        id="email"
        label="Email"
        value=""
        onChange={() => {}}
        type="email"
        error="Required"
      />,
    )

    const input = screen.getByLabelText('Email')
    expect(screen.getByText('Required')).toBeInTheDocument()
    expect(input).toHaveAttribute('aria-invalid', 'true')
  })
})
