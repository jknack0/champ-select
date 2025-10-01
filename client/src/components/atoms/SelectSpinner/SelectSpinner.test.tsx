import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import SelectSpinner from './SelectSpinner'

describe('SelectSpinner', () => {
  it('renders with status role', () => {
    render(<SelectSpinner />)
    const spinner = screen.getByRole('status', { name: 'Loading' })
    expect(spinner).toBeInTheDocument()
  })
})
