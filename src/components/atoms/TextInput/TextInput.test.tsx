import { describe, expect, it } from 'vitest'
import { useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TextInput from './TextInput'

describe('TextInput', () => {
  it('links the label and input and propagates changes', async () => {
    const Wrapper = () => {
      const [value, setValue] = useState('45')
      return (
        <TextInput
          id="donation"
          label="Donation Amount"
          value={value}
          onChange={setValue}
          placeholder="e.g. 12.50"
        />
      )
    }

    const user = userEvent.setup()
    render(<Wrapper />)

    const input = screen.getByLabelText('Donation Amount') as HTMLInputElement
    expect(input.value).toBe('45')

    await user.clear(input)
    expect(input.value).toBe('')

    await user.type(input, '50')
    expect(input.value).toBe('50')
  })

  it('sets aria-invalid when requested', () => {
    render(
      <TextInput
        id="donation"
        label="Donation Amount"
        value=""
        onChange={() => {}}
        ariaInvalid
        ariaDescribedBy="error-id"
      />,
    )

    const input = screen.getByLabelText('Donation Amount')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAttribute('aria-describedby', 'error-id')
  })
})

