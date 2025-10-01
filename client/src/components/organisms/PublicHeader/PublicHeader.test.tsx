import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import PublicHeader from './PublicHeader'

describe('PublicHeader', () => {
  it('renders main heading', () => {
    render(<PublicHeader />)
    expect(screen.getByRole('heading', { name: 'Champ Select' })).toBeInTheDocument()
  })
})
