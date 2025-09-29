import { render, screen } from '@testing-library/react'
import AdminLayout from './AdminLayout'
import { describe, expect, it } from 'vitest'

describe('AdminLayout', () => {
  it('renders provided slots in order', () => {
    render(
      <AdminLayout
        header={<div data-testid="header-slot">Header</div>}
        donation={<div data-testid="donation-slot">Donation</div>}
        championList={<div data-testid="list-slot">List</div>}
      />,
    )

    expect(screen.getByTestId('header-slot')).toHaveTextContent('Header')
    expect(screen.getByTestId('donation-slot')).toHaveTextContent('Donation')
    expect(screen.getByTestId('list-slot')).toHaveTextContent('List')
  })
})




