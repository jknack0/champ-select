import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import UserBadge from './UserBadge'

describe('UserBadge', () => {
  it('renders a circular badge with an SVG icon', () => {
    const { container } = render(<UserBadge email="user@example.com" />)
    const badge = container.querySelector('.badge')
    expect(badge).not.toBeNull()
    // svg inside
    expect(badge!.querySelector('svg')).not.toBeNull()
  })
})
