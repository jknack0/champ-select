import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import UserBadge from './UserBadge'
import styles from './UserBadge.module.css'

describe('UserBadge', () => {
  it('renders a circular badge with an SVG icon', () => {
    const { container } = render(<UserBadge email="user@example.com" />)

    const badge = container.querySelector(`.${styles.badge}`)
    expect(badge).not.toBeNull()

    expect(badge!.querySelector('svg')).not.toBeNull()
    expect(badge!.getAttribute('aria-hidden')).toBe('true')
  })
})
