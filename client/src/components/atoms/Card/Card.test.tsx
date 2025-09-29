import { render, screen } from '@testing-library/react'
import Card from './Card'
import { describe, expect, it } from 'vitest'

describe('Card', () => {
  it('renders children inside a section element', () => {
    render(<Card className="extra">Card content</Card>)

    const content = screen.getByText('Card content')
    const section = content.closest('section')
    expect(section).not.toBeNull()
    expect(section).toHaveClass('extra', { exact: false })
  })
})




