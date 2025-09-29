import { useCallback, useState } from 'react'
import type { Champion } from '../../../types/champion'
import { DonationControls } from '../../molecules'
import { ChampionList, AdminHeader } from '../../organisms'
import { AdminLayout } from '../../templates'

const INITIAL_CHAMPIONS: Champion[] = [
  { id: 'ahri', name: 'Ahri', img: 'https://ddragon.leagueoflegends.com/cdn/14.9.1/img/champion/Ahri.png' },
  { id: 'leesin', name: 'Lee Sin', img: 'https://ddragon.leagueoflegends.com/cdn/14.9.1/img/champion/LeeSin.png' },
  { id: 'amumu', name: 'Amumu', img: 'https://ddragon.leagueoflegends.com/cdn/14.9.1/img/champion/Amumu.png' },
  { id: 'yasuo', name: 'Yasuo', img: 'https://ddragon.leagueoflegends.com/cdn/14.9.1/img/champion/Yasuo.png' },
  { id: 'lillia', name: 'Lillia', img: 'https://ddragon.leagueoflegends.com/cdn/14.9.1/img/champion/Lillia.png' },
]

const STORAGE_KEYS = {
  champions: 'champ-select-admin:champions',
  donationAmount: 'champ-select-admin:donationAmount',
} as const

const loadChampions = (): Champion[] => {
  if (typeof window === 'undefined') {
    return INITIAL_CHAMPIONS
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.champions)
    if (!raw) {
      return INITIAL_CHAMPIONS
    }
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      return INITIAL_CHAMPIONS
    }
    const sanitized = parsed.filter(
      (item: Partial<Champion>): item is Champion =>
        typeof item?.id === 'string' && typeof item?.name === 'string' && typeof item?.img === 'string',
    )
    return sanitized.length ? sanitized : INITIAL_CHAMPIONS
  } catch (error) {
    console.error('Failed to load champions from localStorage', error)
    return INITIAL_CHAMPIONS
  }
}

const loadDonationAmount = (): string => {
  if (typeof window === 'undefined') {
    return ''
  }
  try {
    return window.localStorage.getItem(STORAGE_KEYS.donationAmount) ?? ''
  } catch (error) {
    console.error('Failed to load donation amount from localStorage', error)
    return ''
  }
}

const persistChampions = (value: Champion[]) => {
  if (typeof window === 'undefined') {
    return
  }
  window.localStorage.setItem(STORAGE_KEYS.champions, JSON.stringify(value))
}

const persistDonationAmount = (value: string) => {
  if (typeof window === 'undefined') {
    return
  }
  window.localStorage.setItem(STORAGE_KEYS.donationAmount, value)
}

const reorderChampions = (list: Champion[], startIndex: number, endIndex: number) => {
  const updated = [...list]
  const [removed] = updated.splice(startIndex, 1)
  updated.splice(endIndex, 0, removed)
  return updated
}

const ChampSelectAdmin = () => {
  const [champs, setChamps] = useState<Champion[]>(() => loadChampions())
  const [donationAmount, setDonationAmount] = useState<string>(() => loadDonationAmount())
  const [validationError, setValidationError] = useState('')

  const handleRemove = useCallback((id: string) => {
    setChamps((prev) => {
      const next = prev.filter((champ) => champ.id !== id)
      persistChampions(next)
      return next
    })
  }, [])

  const handleReorder = useCallback((fromIndex: number, toIndex: number) => {
    setChamps((prev) => {
      const next = reorderChampions(prev, fromIndex, toIndex)
      persistChampions(next)
      return next
    })
  }, [])

  const handleAmountChange = useCallback((value: string) => {
    setDonationAmount(value)
    if (validationError) {
      setValidationError('')
    }
  }, [validationError])

  const handleSaveDonation = useCallback(() => {
    const normalized = donationAmount.trim()
    if (normalized.length === 0) {
      setValidationError('Donation amount is required.')
      return
    }
    const numericValue = Number(normalized)
    if (Number.isNaN(numericValue) || numericValue < 0) {
      setValidationError('Enter a valid non-negative number.')
      return
    }
    persistDonationAmount(normalized)
    setValidationError('')
    setDonationAmount(normalized)
  }, [donationAmount])

  const donationErrorId = 'donation-amount-error'

  return (
    <AdminLayout
      header={<AdminHeader />}
      donation={
        <DonationControls
          amount={donationAmount}
          onAmountChange={handleAmountChange}
          onSave={handleSaveDonation}
          isInvalid={Boolean(validationError)}
          errorId={validationError ? donationErrorId : undefined}
          errorMessage={validationError || undefined}
        />
      }
      championList={<ChampionList champs={champs} onReorder={handleReorder} onRemove={handleRemove} />}
    />
  )
}

export default ChampSelectAdmin
