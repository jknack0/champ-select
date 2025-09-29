import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import Heading from './Heading'

describe('Heading', () => {
  it('renders the correct heading level', () => {
    render(<Heading level={2}>Section Title</Heading>)

    const heading = screen.getByRole('heading', { name: 'Section Title', level: 2 })
    expect(heading.tagName.toLowerCase()).toBe('h2')
  })

  it('applies additional class names', () => {
    render(
      <Heading level={3} className="custom">
        Custom Heading
      </Heading>,
    )

    const heading = screen.getByRole('heading', { name: 'Custom Heading', level: 3 })
    expect(heading).toHaveClass('custom', { exact: false })
  })
})

