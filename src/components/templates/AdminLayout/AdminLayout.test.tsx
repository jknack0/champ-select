import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import AdminLayout from './AdminLayout'

describe('AdminLayout', () => {
  it('renders each provided slot', () => {
    render(
      <AdminLayout
        header={<header data-testid="header-slot">Header</header>}
        donation={<div data-testid="donation-slot">Donation</div>}
        championList={<div data-testid="list-slot">List</div>}
      />,
    )

    expect(screen.getByTestId('header-slot')).toHaveTextContent('Header')
    expect(screen.getByTestId('donation-slot')).toHaveTextContent('Donation')
    expect(screen.getByTestId('list-slot')).toHaveTextContent('List')
  })
})

