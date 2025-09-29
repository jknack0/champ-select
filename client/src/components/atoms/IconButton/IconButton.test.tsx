import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import IconButton from './IconButton'

describe('IconButton', () => {
  it('announces label and handles clicks', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()

    render(<IconButton ariaLabel="Remove champion" icon="×" onClick={handleClick} />)

    const button = screen.getByRole('button', { name: 'Remove champion' })
    expect(button).toHaveTextContent('×')

    await user.click(button)
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})






