import { render, screen } from '@testing-library/react'
import InlineError from './InlineError'
import { describe, expect, it } from 'vitest'

describe('InlineError', () => {
  it('renders error text with given id', () => {
    render(<InlineError id="error-id">Something went wrong</InlineError>)

    const error = screen.getByText('Something went wrong')
    expect(error).toHaveAttribute('id', 'error-id')
  })
})




