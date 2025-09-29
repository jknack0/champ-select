import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import Popover from './Popover'

describe('Popover', () => {
  it('does not render when open is false', () => {
    const onClose = vi.fn()
    const { container } = render(
      <div>
        <button>anchor</button>
        <Popover open={false} onClose={onClose}>
          <div>content</div>
        </Popover>
      </div>,
    )
    expect(container.textContent).not.toContain('content')
  })

  it('renders children when open', () => {
    const onClose = vi.fn()
    render(
      <div>
        <button>anchor</button>
        <Popover open onClose={onClose}>
          <div>content</div>
        </Popover>
      </div>,
    )
    expect(screen.getByText('content')).toBeInTheDocument()
  })

  it('closes on Escape and outside click', () => {
    const onClose = vi.fn()
    render(
      <div>
        <button>anchor</button>
        <Popover open onClose={onClose}>
          <div>content</div>
        </Popover>
      </div>,
    )

    // escape
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalled()

    // outside click
    onClose.mockReset()
    fireEvent.mouseDown(document.body)
    expect(onClose).toHaveBeenCalled()
  })
})
