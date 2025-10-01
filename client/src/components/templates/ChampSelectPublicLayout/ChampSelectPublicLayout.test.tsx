import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import ChampSelectPublicLayout from './ChampSelectPublicLayout'

describe('ChampSelectPublicLayout', () => {
  it('renders provided regions', () => {
    render(
      <ChampSelectPublicLayout
        header={<header>Header</header>}
        donationBar={<div>Donation</div>}
        main={<main>Main</main>}
        selectionBanner={<div>Banner</div>}
      />,
    )

    expect(screen.getByText('Header')).toBeInTheDocument()
    expect(screen.getByText('Donation')).toBeInTheDocument()
    expect(screen.getByText('Main')).toBeInTheDocument()
    expect(screen.getByText('Banner')).toBeInTheDocument()
  })
})
