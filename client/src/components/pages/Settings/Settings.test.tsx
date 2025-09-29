import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import Settings from './Settings'

const STORAGE_KEYS = {
  streamlabsUrl: 'champ-select-admin:streamlabsUrl',
  streamlabsToken: 'champ-select-admin:streamlabsToken',
} as const

describe('Settings page', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    window.localStorage.clear()
  })

  it('prefills values from localStorage', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key: string) => {
      if (key === STORAGE_KEYS.streamlabsUrl) {
        return 'https://streamlabs.com/my-channel/tip'
      }
      if (key === STORAGE_KEYS.streamlabsToken) {
        return 'abc123'
      }
      return null
    })

    render(<Settings />)

    expect(screen.getByLabelText(/streamlabs url/i)).toHaveValue('https://streamlabs.com/my-channel/tip')
    expect(screen.getByLabelText(/streamlabs token/i)).toHaveValue('abc123')
  })

  it('validates inputs and persists settings', async () => {
    const user = userEvent.setup()
    const getItem = vi.spyOn(Storage.prototype, 'getItem').mockReturnValue('')
    const setItem = vi.spyOn(Storage.prototype, 'setItem')

    render(<Settings />)

    const urlInput = screen.getByLabelText(/streamlabs url/i)
    const tokenInput = screen.getByLabelText(/streamlabs token/i)
    const saveButton = screen.getByRole('button', { name: /save settings/i })

    await user.clear(urlInput)
    await user.type(urlInput, 'https://streamlabs.com/my-channel/tip')
    await user.clear(tokenInput)
    await user.type(tokenInput, 'token-123')

    await user.click(saveButton)

    expect(setItem).toHaveBeenCalledWith(STORAGE_KEYS.streamlabsUrl, 'https://streamlabs.com/my-channel/tip')
    expect(setItem).toHaveBeenCalledWith(STORAGE_KEYS.streamlabsToken, 'token-123')
    expect(screen.getByText(/settings saved/i)).toBeInTheDocument()
    expect(getItem).toHaveBeenCalled()
  })

  it('shows validation errors for invalid input', async () => {
    const user = userEvent.setup()
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue('')
    const setItem = vi.spyOn(Storage.prototype, 'setItem')

    render(<Settings />)

    const saveButton = screen.getByRole('button', { name: /save settings/i })
    await user.click(saveButton)

    expect(screen.getByText(/streamlabs url is required/i)).toBeInTheDocument()
    expect(screen.getByText(/streamlabs token is required/i)).toBeInTheDocument()
    expect(setItem).not.toHaveBeenCalled()
  })
})
