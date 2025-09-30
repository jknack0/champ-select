import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Avatar, Button, Card, Heading } from '../../atoms'
import styles from './ChampSelect.module.css'
import { fetchPublicRoster, type ChampionDto, type DonationSettingsDto } from '../../../lib/endpoints'
import { getRealtimeSocket } from '../../../lib/realtime'

import { useParams } from 'react-router-dom'

const DONATION_URL_FALLBACK = 'https://streamlabs.com/<your-channel>/tip'

const cx = (...values: Array<string | null | undefined | false>) => values.filter(Boolean).join(' ')

const openDonationUrl = (href: string) => {
  if (!href) {
    return
  }
  window.open(href, '_blank', 'noopener,noreferrer')
}

type BodyTextProps = {
  children: ReactNode
  as?: 'p' | 'span'
  tone?: 'default' | 'muted'
  className?: string
}

const BodyText = ({ children, as = 'p', tone = 'default', className }: BodyTextProps) => {
  const Element = as
  return <Element className={cx(styles.body, tone === 'muted' ? styles.bodyMuted : undefined, className)}>{children}</Element>
}

type BadgeProps = {
  children: ReactNode
  tone?: 'default' | 'info'
  className?: string
}

const Badge = ({ children, tone = 'default', className }: BadgeProps) => (
  <span className={cx(styles.badge, tone === 'info' ? styles.badgeInfo : styles.badgeDefault, className)}>{children}</span>
)

type DonationBarProps = {
  amountLabel: string
  donationUrl: string
  buttonLabel: string
  buttonAriaLabel: string
  hasPrefilledAmount: boolean
  isDisabled?: boolean
}

const DonationBar = ({ amountLabel, donationUrl, buttonLabel, buttonAriaLabel, hasPrefilledAmount, isDisabled }: DonationBarProps) => (
  <Card className={styles.donationCard}>
    <div className={styles.donation}>
      <div className={styles.donationMeta}>
        <div className={styles.donationHeader}>
          <Heading level={2}>Support the stream</Heading>
          {hasPrefilledAmount ? <Badge tone="info">{amountLabel}</Badge> : null}
        </div>
        <BodyText tone="muted">Keep Champ Select open to every summoner by tipping what feels right.</BodyText>
        {hasPrefilledAmount ? (
          <div className={styles.donationPrefill}>
            <BodyText as="span" tone="muted">
              Prefilled amount
            </BodyText>
            <Badge>{amountLabel}</Badge>
          </div>
        ) : null}
      </div>
      <div className={styles.donationAction}>
        <Button onClick={() => openDonationUrl(donationUrl)} ariaLabel={buttonAriaLabel} disabled={isDisabled}>
          {buttonLabel}
        </Button>
      </div>
    </div>
  </Card>
)

type ChampionListItemProps = {
  champ: ChampionDto
}

const ChampionListItem = ({ champ }: ChampionListItemProps) => (
  <li className={styles.championListItem}>
    <Avatar name={champ.name} src={champ.imageUrl} />
    <div className={styles.championDetails}>
      <Heading level={3} className={styles.championName}>
        {champ.name}
      </Heading>
      <BodyText as="span" tone="muted" className={styles.championId}>
        #{champ.id}
      </BodyText>
    </div>
  </li>
)

type ChampionListProps = {
  champs: ChampionDto[]
}

const ChampionList = ({ champs }: ChampionListProps) => (
  <Card className={styles.championList}>
    <ul className={styles.championListItems}>
      {champs.map((champ) => (
        <ChampionListItem key={champ.id} champ={champ} />
      ))}
    </ul>
  </Card>
)

const PublicHeader = () => (
  <div className={styles.header}>
    <Heading level={1} className={styles.pageTitle}>
      Champ Select
    </Heading>
    <BodyText tone="muted">Browse the current roster and cheer on your favorite champion.</BodyText>
  </div>
)

type PublicLayoutProps = {
  header: ReactNode
  donationBar: ReactNode
  championList: ReactNode
}

const PublicLayout = ({ header, donationBar, championList }: PublicLayoutProps) => (
  <div className={styles.page}>
    <div className={styles.container}>
      <div className={styles.template}>
        {header}
        {donationBar}
        {championList}
      </div>
    </div>
  </div>
)

type RosterState = {
  champions: ChampionDto[]
  donationSettings: DonationSettingsDto | null
  loading: boolean
  error: string | null
}

const formatAmountLabel = (value: number | null | undefined, currency: string) => {
  if (value == null || Number.isNaN(value)) {
    return ''
  }
  const formatter = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return formatter.format(value)
}

const buildDonationUrl = (settings: DonationSettingsDto | null, fallbackAmount: string) => {
  const base = settings?.streamlabsUrl?.trim() || DONATION_URL_FALLBACK
  if (fallbackAmount) {
    const separator = base.includes('?') ? '&' : '?'
    return `${base}${separator}amount=${encodeURIComponent(fallbackAmount)}`
  }
  return base
}

export default function ChampSelect() {
  const [state, setState] = useState<RosterState>({
    champions: [],
    donationSettings: null,
    loading: true,
    error: null,
  })

  const { ownerId } = useParams<{ ownerId?: string }>()

  useEffect(() => {
    if (typeof document === 'undefined') {
      return
    }

    const previousTitle = document.title
    document.title = 'Champ Select'

    return () => {
      document.title = previousTitle
    }
  }, [])

  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const loadRoster = useCallback(
    async ({ showLoading = false }: { showLoading?: boolean } = {}) => {
      if (showLoading) {
        setState((prev) => ({ ...prev, loading: true, error: null }))
      }

      try {
        const data = await fetchPublicRoster(ownerId ?? undefined)
        if (!isMountedRef.current) {
          return
        }
        setState({
          champions: data.champions.filter((champion) => champion.isActive),
          donationSettings: data.donationSettings,
          loading: false,
          error: null,
        })
      } catch (error) {
        if (!isMountedRef.current) {
          return
        }
        setState({
          champions: [],
          donationSettings: null,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to load roster.',
        })
      }
    },
    [ownerId],
  )

  useEffect(() => {
    void loadRoster({ showLoading: true })
  }, [loadRoster])

  useEffect(() => {
    const socket = getRealtimeSocket()
    const handleRosterChanged = () => {
      void loadRoster()
    }

    socket.on('publicRoster:changed', handleRosterChanged)

    return () => {
      socket.off('publicRoster:changed', handleRosterChanged)
    }
  }, [loadRoster])

  const donationAmountLabel = useMemo(() => {
    if (!state.donationSettings?.defaultAmount) {
      return ''
    }
    return formatAmountLabel(state.donationSettings.defaultAmount, state.donationSettings.currency)
  }, [state.donationSettings])

  const donationUrl = useMemo(() => {
    const amount = state.donationSettings?.defaultAmount ?? null
    const amountString = amount != null && Number.isFinite(amount) ? amount.toString() : ''
    return buildDonationUrl(state.donationSettings, amountString)
  }, [state.donationSettings])

  const donationButtonLabel = donationAmountLabel ? `Donate ${donationAmountLabel}` : 'Donate'
  const donationButtonAria = donationAmountLabel ? `Donate ${donationAmountLabel}` : 'Donate to the stream'

  if (state.loading) {
    return (
      <PublicLayout
        header={<PublicHeader />}
        donationBar={
          <DonationBar
            amountLabel=""
            donationUrl={donationUrl}
            buttonLabel="Donate"
            buttonAriaLabel="Donate to the stream"
            hasPrefilledAmount={false}
            isDisabled
          />
        }
        championList={<Card className={styles.championList}><BodyText tone="muted">Loading roster…</BodyText></Card>}
      />
    )
  }

  if (state.error) {
    return (
      <PublicLayout
        header={<PublicHeader />}
        donationBar={
          <DonationBar
            amountLabel=""
            donationUrl={donationUrl}
            buttonLabel="Donate"
            buttonAriaLabel="Donate to the stream"
            hasPrefilledAmount={false}
            isDisabled
          />
        }
        championList={<Card className={styles.championList}><BodyText tone="muted">{state.error}</BodyText></Card>}
      />
    )
  }

  return (
    <PublicLayout
      header={<PublicHeader />}
      donationBar={
        <DonationBar
          amountLabel={donationAmountLabel}
          donationUrl={donationUrl}
          buttonLabel={donationButtonLabel}
          buttonAriaLabel={donationButtonAria}
          hasPrefilledAmount={Boolean(donationAmountLabel)}
        />
      }
      championList={
        state.champions.length > 0 ? (
          <ChampionList champs={state.champions} />
        ) : (
          <Card className={styles.championList}>
            <BodyText tone="muted">No champions available yet. Check back soon!</BodyText>
          </Card>
        )
      }
    />
  )
}
