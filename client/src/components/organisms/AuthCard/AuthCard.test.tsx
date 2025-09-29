import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import AuthCard from './AuthCard'

describe('AuthCard', () => {
  it('renders title and children inside a card', () => {
    render(
      <AuthCard title="Welcome">
        <div>Child content</div>
      </AuthCard>,
    )

    expect(screen.getByRole('heading', { name: 'Welcome', level: 2 })).toBeInTheDocument()
    expect(screen.getByText('Child content')).toBeInTheDocument()
  })
})
