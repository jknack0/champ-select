import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import SelectText from './SelectText'
import styles from './SelectText.module.css'

describe('SelectText', () => {
  it('renders provided content', () => {
    render(<SelectText>Body copy</SelectText>)
    expect(screen.getByText('Body copy')).toBeInTheDocument()
  })

  it('supports muted tone', () => {
    render(<SelectText tone="muted">Muted</SelectText>)
    const element = screen.getByText('Muted')
    expect(element).toHaveClass(styles.muted)
  })
})
