import { render, screen } from '@testing-library/react'
import Heading from './Heading'
import { describe, expect, it } from 'vitest'

describe('Heading', () => {
  it('renders the correct semantic level', () => {
    render(<Heading level={2}>Section Title</Heading>)
    expect(screen.getByRole('heading', { name: 'Section Title', level: 2 })).toBeInTheDocument()
  })

  it('allows custom class names', () => {
    render(
      <Heading level={3} className="custom">
        Custom Heading
      </Heading>,
    )

    const heading = screen.getByRole('heading', { name: 'Custom Heading', level: 3 })
    expect(heading).toHaveClass('custom', { exact: false })
  })
})




