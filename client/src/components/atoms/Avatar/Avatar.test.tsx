import { fireEvent, render, screen } from '@testing-library/react'
import Avatar from './Avatar'
import { describe, expect, it } from 'vitest'

describe('Avatar', () => {
  it('renders the champion image with alt text', () => {
    render(<Avatar name="Ahri" src="/ahri.png" />)

    const avatarImage = screen.getByRole('img', { name: 'Ahri' })
    expect(avatarImage).toBeInTheDocument()
    expect(avatarImage).toHaveAttribute('src', '/ahri.png')
  })

  it('falls back to initials when the image fails to load', () => {
    render(<Avatar name="Ahri" src="/broken.png" />)

    const image = screen.getByRole('img', { name: 'Ahri' }) as HTMLImageElement
    fireEvent.error(image)

    expect(screen.getByText('AH')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Ahri' })).toHaveTextContent('AH')
  })
})




