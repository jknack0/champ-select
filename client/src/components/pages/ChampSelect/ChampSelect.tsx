import { useMemo, useState, type ReactNode } from 'react'
import { Avatar, Button, Card, Heading } from '../../atoms'
import type { Champion } from '../../../types/champion'
import styles from './ChampSelect.module.css'

const DONATION_URL_BASE = 'https://streamlabs.com/<your-channel>/tip'

const STORAGE_KEYS = {
  champions: 'champ-select-admin:champions',
  donationAmount: 'champ-select-admin:donationAmount',
} as const

const INITIAL_CHAMPIONS: Champion[] = [
  { id: 'ahri', name: 'Ahri', img: 'https://ddragon.leagueoflegends.com/cdn/14.9.1/img/champion/Ahri.png' },
  { id: 'leesin', name: 'Lee Sin', img: 'https://ddragon.leagueoflegends.com/cdn/14.9.1/img/champion/LeeSin.png' },
  { id: 'amumu', name: 'Amumu', img: 'https://ddragon.leagueoflegends.com/cdn/14.9.1/img/champion/Amumu.png' },
  { id: 'yasuo', name: 'Yasuo', img: 'https://ddragon.leagueoflegends.com/cdn/14.9.1/img/champion/Yasuo.png' },
  { id: 'lillia', name: 'Lillia', img: 'https://ddragon.leagueoflegends.com/cdn/14.9.1/img/champion/Lillia.png' },
]

type ClassValue = string | null | undefined | false

const cx = (...values: ClassValue[]): string => values.filter(Boolean).join(' ')

const isBrowser = typeof window !== 'undefined'

const readLocalStorage = (key: string): string | null => {
  if (!isBrowser) {
    return null
  }
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

const isChampion = (value: unknown): value is Champion => {
  if (typeof value !== 'object' || value === null) {
    return false
  }
  const candidate = value as Record<string, unknown>
  return typeof candidate.id === 'string' && typeof candidate.name === 'string' && typeof candidate.img === 'string'
}

const loadChampions = (): Champion[] => {
  const stored = readLocalStorage(STORAGE_KEYS.champions)
  if (!stored) {
    return INITIAL_CHAMPIONS
  }
  try {
    const parsed = JSON.parse(stored)
    if (Array.isArray(parsed)) {
      const valid = parsed.filter(isChampion)
      return valid.length > 0 ? valid : INITIAL_CHAMPIONS
    }
  } catch {
    // ignore parse errors and fall back to the default list
  }
  return INITIAL_CHAMPIONS
}

const loadDonationAmount = (): string => readLocalStorage(STORAGE_KEYS.donationAmount) ?? ''

type DonationInfo = {
  isValid: boolean
  displayLabel: string
  sanitizedAmount: string
}

const parseDonationAmount = (raw: string): DonationInfo => {
  const trimmed = raw.trim()
  if (trimmed === '') {
    return { isValid: false, displayLabel: '', sanitizedAmount: '' }
  }
  const numeric = Number.parseFloat(trimmed)
  if (!Number.isFinite(numeric) || Number.isNaN(numeric) || numeric < 0) {
    return { isValid: false, displayLabel: '', sanitizedAmount: '' }
  }
  return {
    isValid: true,
    displayLabel: `$${numeric.toFixed(2)}`,
    sanitizedAmount: trimmed,
  }
}

const openDonationUrl = (href: string) => {
  if (!href || !isBrowser) {
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
}

const DonationBar = ({ amountLabel, donationUrl, buttonLabel, buttonAriaLabel, hasPrefilledAmount }: DonationBarProps) => (
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
        <Button onClick={() => openDonationUrl(donationUrl)} ariaLabel={buttonAriaLabel}>
          {buttonLabel}
        </Button>
      </div>
    </div>
  </Card>
)

type ChampionListItemProps = {
  champ: Champion
}

const ChampionListItem = ({ champ }: ChampionListItemProps) => (
  <li className={styles.championListItem}>
    <Avatar name={champ.name} src={champ.img} />
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
  champs: Champion[]
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

const useChampions = (): Champion[] => {
  const [champions] = useState<Champion[]>(() => loadChampions())
  return champions
}

const useDonationInfo = (): DonationInfo => {
  const [rawAmount] = useState<string>(() => loadDonationAmount())
  return useMemo(() => parseDonationAmount(rawAmount), [rawAmount])
}

const buildDonationUrl = (info: DonationInfo): string =>
  info.isValid ? `${DONATION_URL_BASE}?amount=${encodeURIComponent(info.sanitizedAmount)}` : DONATION_URL_BASE

export default function ChampSelect() {
  const champions = useChampions()
  const donationInfo = useDonationInfo()

  const donationUrl = buildDonationUrl(donationInfo)
  const donationButtonLabel = donationInfo.isValid ? `Donate ${donationInfo.displayLabel}` : 'Donate'
  const donationButtonAria = donationInfo.isValid
    ? `Donate ${donationInfo.displayLabel}`
    : 'Donate to the stream'

  return (
    <PublicLayout
      header={<PublicHeader />}
      donationBar={
        <DonationBar
          amountLabel={donationInfo.displayLabel}
          donationUrl={donationUrl}
          buttonLabel={donationButtonLabel}
          buttonAriaLabel={donationButtonAria}
          hasPrefilledAmount={donationInfo.isValid}
        />
      }
      championList={<ChampionList champs={champions} />}
    />
  )
}
