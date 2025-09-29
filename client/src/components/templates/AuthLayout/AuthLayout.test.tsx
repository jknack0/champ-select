import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import AuthLayout from './AuthLayout'

describe('AuthLayout', () => {
  it('wraps children in a centered container', () => {
    render(
      <AuthLayout>
        <div data-testid="auth-child">Hello</div>
      </AuthLayout>,
    )
    expect(screen.getByTestId('auth-child')).toBeInTheDocument()
  })
})
