import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import Settings from './Settings'
import {
  fetchDonationSettings,
  upsertDonationSettings,
  fetchStreamlabsStatus,
  upsertStreamlabsCredentials,
  deleteStreamlabsCredentials,
} from '../../../lib/endpoints'

vi.mock('../../../lib/endpoints', () => ({
  fetchDonationSettings: vi.fn(),
  upsertDonationSettings: vi.fn(),
  fetchStreamlabsStatus: vi.fn(),
  upsertStreamlabsCredentials: vi.fn(),
  deleteStreamlabsCredentials: vi.fn(),
}))

const fetchDonationSettingsMock = vi.mocked(fetchDonationSettings)
const upsertDonationSettingsMock = vi.mocked(upsertDonationSettings)
const fetchStreamlabsStatusMock = vi.mocked(fetchStreamlabsStatus)
const upsertStreamlabsCredentialsMock = vi.mocked(upsertStreamlabsCredentials)
const deleteStreamlabsCredentialsMock = vi.mocked(deleteStreamlabsCredentials)

describe('Settings page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fetchDonationSettingsMock.mockResolvedValue({ streamlabsUrl: null, defaultAmount: null, currency: 'USD' })
    fetchStreamlabsStatusMock.mockResolvedValue({ hasCredentials: false, tokenExpiresAt: null })
    upsertDonationSettingsMock.mockResolvedValue({
      streamlabsUrl: 'https://streamlabs.com/my-channel/tip',
      defaultAmount: null,
      currency: 'USD',
    })
    upsertStreamlabsCredentialsMock.mockResolvedValue({ hasCredentials: true, tokenExpiresAt: null })
    deleteStreamlabsCredentialsMock.mockResolvedValue(undefined)
  })

  it('prefills existing settings from the API', async () => {
    fetchDonationSettingsMock.mockResolvedValueOnce({
      streamlabsUrl: 'https://streamlabs.com/my-channel/tip',
      defaultAmount: 12.5,
      currency: 'USD',
    })
    fetchStreamlabsStatusMock.mockResolvedValueOnce({ hasCredentials: true, tokenExpiresAt: null })

    render(<Settings />)

    const urlInput = await screen.findByLabelText(/streamlabs url/i)
    expect(urlInput).toHaveValue('https://streamlabs.com/my-channel/tip')

    const tokenInput = screen.getByLabelText(/streamlabs token/i)
    expect(tokenInput).toHaveValue('')
    expect(screen.getByText(/token is already saved/i)).toBeInTheDocument()
  })

  it('validates inputs and saves settings', async () => {
    const user = userEvent.setup()

    render(<Settings />)

    const urlInput = await screen.findByLabelText(/streamlabs url/i)
    const tokenInput = screen.getByLabelText(/streamlabs token/i)
    const saveButton = screen.getByRole('button', { name: /save settings/i })

    await user.clear(urlInput)
    await user.type(urlInput, 'https://streamlabs.com/my-channel/tip')
    await user.type(tokenInput, 'token-123')

    await user.click(saveButton)

    await waitFor(() => {
      expect(upsertDonationSettingsMock).toHaveBeenCalledWith({
        streamlabsUrl: 'https://streamlabs.com/my-channel/tip',
        defaultAmount: null,
        currency: 'USD',
      })
      expect(upsertStreamlabsCredentialsMock).toHaveBeenCalledWith({ accessToken: 'token-123' })
      expect(screen.getByText(/settings saved/i)).toBeInTheDocument()
    })
  })

  it('shows validation errors for missing fields', async () => {
    const user = userEvent.setup()

    render(<Settings />)

    const saveButton = await screen.findByRole('button', { name: /save settings/i })
    await user.click(saveButton)

    expect(screen.getByText(/streamlabs url is required/i)).toBeInTheDocument()
    expect(screen.getByText(/streamlabs token is required/i)).toBeInTheDocument()
    expect(upsertDonationSettingsMock).not.toHaveBeenCalled()
    expect(upsertStreamlabsCredentialsMock).not.toHaveBeenCalled()
  })

  it('allows removing stored credentials', async () => {
    const user = userEvent.setup()
    fetchStreamlabsStatusMock.mockResolvedValueOnce({ hasCredentials: true, tokenExpiresAt: null })

    render(<Settings />)

    const removeButton = await screen.findByRole('button', { name: /remove token/i })
    await user.click(removeButton)

    expect(deleteStreamlabsCredentialsMock).toHaveBeenCalled()
  })
})


