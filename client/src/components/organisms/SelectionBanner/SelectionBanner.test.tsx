import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import SelectionBanner from './SelectionBanner'

describe('SelectionBanner', () => {
  it('renders selected champion details', () => {
    render(
      <SelectionBanner
        selection={{ id: 'ahri', name: 'Ahri', img: '', selectedAt: '2025-01-01T15:30:00.000Z' }}
      />,
    )

    expect(screen.getByText('You locked in:')).toBeInTheDocument()
    expect(screen.getByText('Ahri')).toBeInTheDocument()
  })
})
