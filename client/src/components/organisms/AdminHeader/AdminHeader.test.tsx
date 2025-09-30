import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AdminHeader from './AdminHeader'
import { describe, expect, it, vi } from 'vitest'

describe('AdminHeader', () => {
  it('renders the admin title', () => {
    render(<AdminHeader />)
    expect(screen.getByRole('heading', { name: 'Champ Select Admin', level: 1 })).toBeInTheDocument()
  })

  it('renders share link controls when a link is provided', async () => {
    const user = userEvent.setup()
    const onCopy = vi.fn()
    render(<AdminHeader shareLink="https://example.com/champ-select/1" onCopyShareLink={onCopy} />)

    expect(screen.getByText('Viewer Link')).toBeInTheDocument()
    const input = screen.getByLabelText(/viewer link/i) as HTMLInputElement
    expect(input.value).toBe('https://example.com/champ-select/1')

    const button = screen.getByRole('button', { name: /copy link/i })
    await user.click(button)
    expect(onCopy).toHaveBeenCalled()
  })

  it('shows feedback text when copy succeeds', () => {
    render(
      <AdminHeader
        shareLink="https://example.com/champ-select/1"
        shareLinkStatus="copied"
        onCopyShareLink={() => {}}
      />,
    )

    expect(screen.getByText(/link copied/i)).toBeInTheDocument()
  })
})
