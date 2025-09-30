import type { FormEvent, ReactNode } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { Button, Card, Heading, InlineError, TextInput } from '../../atoms'
import styles from './Settings.module.css'
import {
  fetchDonationSettings,
  upsertDonationSettings,
  fetchStreamlabsStatus,
  upsertStreamlabsCredentials,
  deleteStreamlabsCredentials,
  type DonationSettingsDto,
  type StreamlabsStatusDto,
} from '../../../lib/endpoints'

type TouchedState = {
  url?: boolean
  token?: boolean
}

const validateUrl = (value: string): string | undefined => {
  const trimmed = value.trim()
  if (!trimmed) {
    return 'Streamlabs URL is required.'
  }
  try {
    const parsed = new URL(trimmed)
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return 'Enter a valid URL that begins with http or https.'
    }
  } catch {
    return 'Enter a valid Streamlabs URL.'
  }
  return undefined
}

const validateToken = (value: string): string | undefined => {
  const trimmed = value.trim()
  if (!trimmed) {
    return 'Streamlabs token is required.'
  }
  return undefined
}

const Settings = () => {
  const [streamlabsUrl, setStreamlabsUrl] = useState('')
  const [streamlabsToken, setStreamlabsToken] = useState('')
  const [touched, setTouched] = useState<TouchedState>({})
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [loadError, setLoadError] = useState<string | null>(null)
  const [donationSettings, setDonationSettings] = useState<DonationSettingsDto | null>(null)
  const [streamlabsStatus, setStreamlabsStatus] = useState<StreamlabsStatusDto | null>(null)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        const [donation, creds] = await Promise.all([
          fetchDonationSettings().catch(() => null),
          fetchStreamlabsStatus().catch(() => null),
        ])

        if (cancelled) {
          return
        }

        if (donation) {
          setDonationSettings(donation)
          if (donation.streamlabsUrl) {
            setStreamlabsUrl(donation.streamlabsUrl)
          }
        }
        if (creds) {
          setStreamlabsStatus(creds)
        }
        setLoadError(null)
      } catch (error) {
        if (!cancelled) {
          setLoadError(error instanceof Error ? error.message : 'Failed to load settings.')
        }
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [])

  const errors = useMemo(() => ({
    url: touched.url ? validateUrl(streamlabsUrl) : undefined,
    token: touched.token ? validateToken(streamlabsToken) : undefined,
  }), [streamlabsUrl, streamlabsToken, touched])

  const handleUrlChange = (value: string) => {
    setStreamlabsUrl(value)
    setTouched((prev) => ({ ...prev, url: true }))
    setStatus('idle')
  }

  const handleTokenChange = (value: string) => {
    setStreamlabsToken(value)
    setTouched((prev) => ({ ...prev, token: true }))
    setStatus('idle')
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setTouched({ url: true, token: true })

    const urlError = validateUrl(streamlabsUrl)
    const tokenError = validateToken(streamlabsToken)

    if (urlError || tokenError) {
      return
    }

    setStatus('saving')
    try {
      const payload: Partial<DonationSettingsDto> = {
        streamlabsUrl: streamlabsUrl.trim(),
        defaultAmount: donationSettings?.defaultAmount ?? null,
        currency: donationSettings?.currency ?? 'USD',
      }

      const [updatedDonation, updatedStatus] = await Promise.all([
        upsertDonationSettings(payload),
        upsertStreamlabsCredentials({ accessToken: streamlabsToken.trim() }),
      ])

      setDonationSettings(updatedDonation)
      setStreamlabsStatus(updatedStatus)
      setStreamlabsToken('')
      setStatus('saved')
    } catch (error) {
      console.error('Failed to update settings', error)
      setStatus('error')
    }
  }

  const handleRemoveCredentials = async () => {
    try {
      await deleteStreamlabsCredentials()
      setStreamlabsStatus({ hasCredentials: false, tokenExpiresAt: null })
      setStatus('idle')
    } catch (error) {
      console.error('Failed to delete Streamlabs credentials', error)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <Heading level={1} className={styles.title}>
          Settings
        </Heading>
        <Card className={styles.card}>
          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <div className={styles.sectionHeader}>
              <Heading level={2}>Streamlabs Integration</Heading>
              <p className={styles.sectionCopy}>
                Configure the donation link shared with Champ Select and store your Streamlabs access token.
              </p>
              {loadError ? <InlineError id="settings-load-error">{loadError}</InlineError> : null}
            </div>
            <div className={styles.fieldGroup}>
              <TextInput
                id="streamlabs-url"
                label="Streamlabs URL"
                value={streamlabsUrl}
                onChange={handleUrlChange}
                placeholder="https://streamlabs.com/<your-channel>/tip"
                ariaInvalid={Boolean(errors.url)}
                ariaDescribedBy={errors.url ? 'streamlabs-url-error' : undefined}
              />
              {errors.url ? <InlineError id="streamlabs-url-error">{errors.url}</InlineError> : null}
            </div>
            <div className={styles.fieldGroup}>
              <TextInput
                id="streamlabs-token"
                label="Streamlabs Token"
                value={streamlabsToken}
                onChange={handleTokenChange}
                placeholder="Enter your token"
                type="password"
                ariaInvalid={Boolean(errors.token)}
                ariaDescribedBy={errors.token ? 'streamlabs-token-error' : undefined}
              />
              {streamlabsStatus?.hasCredentials ? (
                <BodyCopy>
                  A token is already saved. Enter a new token to replace it or remove the existing credentials below.
                </BodyCopy>
              ) : null}
              {errors.token ? <InlineError id="streamlabs-token-error">{errors.token}</InlineError> : null}
            </div>
            <div className={styles.actions}>
              <Button type="submit" disabled={status === 'saving'}>
                {status === 'saving' ? 'Saving…' : 'Save Settings'}
              </Button>
              {streamlabsStatus?.hasCredentials ? (
                <Button variant="ghost" type="button" onClick={handleRemoveCredentials}>
                  Remove Token
                </Button>
              ) : null}
              {status === 'saved' ? (
                <p className={styles.success} role="status">
                  Settings saved.
                </p>
              ) : null}
              {status === 'error' ? (
                <InlineError id="settings-error">Failed to save settings. Please try again.</InlineError>
              ) : null}
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}

const BodyCopy = ({ children }: { children: ReactNode }) => (
  <p className={styles.sectionCopy}>{children}</p>
)

export default Settings




