import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import AdminHeader from './AdminHeader'

describe('AdminHeader', () => {
  it('renders the admin title', () => {
    render(<AdminHeader />)
    expect(screen.getByRole('heading', { name: 'Champ Select Admin', level: 1 })).toBeInTheDocument()
  })
})

