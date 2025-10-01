import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import SelectBadge from './SelectBadge'
import styles from './SelectBadge.module.css'

describe('SelectBadge', () => {
  it('renders badge text', () => {
    render(<SelectBadge>Ready</SelectBadge>)
    expect(screen.getByText('Ready')).toBeInTheDocument()
  })

  it('applies tone modifier', () => {
    render(<SelectBadge tone="info">Info</SelectBadge>)
    const badge = screen.getByText('Info')
    expect(badge).toHaveClass(styles.info)
  })
})
