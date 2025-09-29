import { FormEvent, useMemo, useState } from 'react'
import { Button, Card, Heading, InlineError, TextInput } from '../../atoms'
import styles from './Settings.module.css'

const STORAGE_KEYS = {
  streamlabsUrl: 'champ-select-admin:streamlabsUrl',
  streamlabsToken: 'champ-select-admin:streamlabsToken',
} as const

const isBrowser = typeof window !== 'undefined'

const readSetting = (key: string): string => {
  if (!isBrowser) {
    return ''
  }
  try {
    return window.localStorage.getItem(key) ?? ''
  } catch {
    return ''
  }
}

const persistSetting = (key: string, value: string) => {
  if (!isBrowser) {
    return
  }
  window.localStorage.setItem(key, value)
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

type TouchedState = {
  url?: boolean
  token?: boolean
}

const useSettingsState = () => {
  const [streamlabsUrl, setStreamlabsUrl] = useState<string>(() => readSetting(STORAGE_KEYS.streamlabsUrl))
  const [streamlabsToken, setStreamlabsToken] = useState<string>(() => readSetting(STORAGE_KEYS.streamlabsToken))
  return {
    streamlabsUrl,
    setStreamlabsUrl,
    streamlabsToken,
    setStreamlabsToken,
  }
}

const Settings = () => {
  const { streamlabsUrl, setStreamlabsUrl, streamlabsToken, setStreamlabsToken } = useSettingsState()
  const [touched, setTouched] = useState<TouchedState>({})
  const [status, setStatus] = useState<'idle' | 'saved'>('idle')

  const errors = useMemo(() => {
    return {
      url: touched.url ? validateUrl(streamlabsUrl) : undefined,
      token: touched.token ? validateToken(streamlabsToken) : undefined,
    }
  }, [streamlabsToken, streamlabsUrl, touched])

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

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    setTouched({ url: true, token: true })

    const urlError = validateUrl(streamlabsUrl)
    const tokenError = validateToken(streamlabsToken)

    if (urlError || tokenError) {
      return
    }

    persistSetting(STORAGE_KEYS.streamlabsUrl, streamlabsUrl.trim())
    persistSetting(STORAGE_KEYS.streamlabsToken, streamlabsToken.trim())
    setStatus('saved')
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
              <p className={styles.sectionCopy}>Configure the tip URL and access token shared with Champ Select.</p>
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
              {errors.token ? <InlineError id="streamlabs-token-error">{errors.token}</InlineError> : null}
            </div>
            <div className={styles.actions}>
              <Button type="submit">Save Settings</Button>
              {status === 'saved' ? (
                <p className={styles.success} role="status">
                  Settings saved.
                </p>
              ) : null}
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}

export default Settings
