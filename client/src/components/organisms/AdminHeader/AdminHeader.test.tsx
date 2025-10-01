import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AdminHeader from './AdminHeader'
import { describe, expect, it, vi } from 'vitest'

const viewerUrl = 'https://example.com/champ-select?ownerId=1'
const overlayUrl = 'https://example.com/overlay?ownerId=1'

describe('AdminHeader', () => {
  it('renders the admin title', () => {
    render(<AdminHeader />)
    expect(screen.getByRole('heading', { name: 'Champ Select Admin', level: 1 })).toBeInTheDocument()
  })

  it('renders share link controls and handles copy actions', async () => {
    const user = userEvent.setup()
    const onCopyViewer = vi.fn()
    const onCopyOverlay = vi.fn()

    render(
      <AdminHeader
        shareLinks={[
          {
            label: 'Viewer Link',
            url: viewerUrl,
            status: 'idle',
            onCopy: onCopyViewer,
          },
          {
            label: 'Overlay Link',
            url: overlayUrl,
            status: 'idle',
            onCopy: onCopyOverlay,
          },
        ]}
      />,
    )

    expect(screen.getByLabelText(/viewer link/i)).toHaveValue(viewerUrl)
    expect(screen.getByLabelText(/overlay link/i)).toHaveValue(overlayUrl)

    const copyButtons = screen.getAllByRole('button', { name: /copy link/i })
    await user.click(copyButtons[0])
    await user.click(copyButtons[1])

    expect(onCopyViewer).toHaveBeenCalled()
    expect(onCopyOverlay).toHaveBeenCalled()
  })

  it('shows feedback text when a copy succeeds', () => {
    render(
      <AdminHeader
        shareLinks={[
          {
            label: 'Viewer Link',
            url: viewerUrl,
            status: 'copied',
          },
        ]}
      />,
    )

    expect(screen.getByText(/link copied/i)).toBeInTheDocument()
  })
})

