import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { DonationControls } from '../../molecules'
import { ChampionList, AdminHeader } from '../../organisms'
import { AdminLayout } from '../../templates'
import { useAuth } from '../../../context/AuthContext'
import type { Champion } from '../../../types/champion'
import {
  fetchRosters,
  fetchChampions,
  createRoster,
  updateRosterOrder,
  removeChampionFromRoster,
  fetchDonationSettings,
  upsertDonationSettings,
  type DonationSettingsDto,
} from '../../../lib/endpoints'

const DEFAULT_ROSTER_NAME = 'Stream Default'
const DEFAULT_CHAMPION_IDS = ['ahri', 'leesin', 'amumu', 'yasuo', 'lillia']

type AdminState = {
  rosterId: number | null
  champions: Champion[]
  donationSettings: DonationSettingsDto | null
  loading: boolean
  error: string | null
  savingDonation: boolean
  donationAmount: string
  donationValidationError: string
  shareLinkStatus: 'idle' | 'copied' | 'error'
}

const reorder = (list: Champion[], startIndex: number, endIndex: number) => {
  const next = [...list]
  const [removed] = next.splice(startIndex, 1)
  next.splice(endIndex, 0, removed)
  return next
}

const normalizeChampions = (incoming: Champion[]): Champion[] =>
  incoming
    .filter((champ) => champ.isActive !== false)
    .map((champ) => ({
      id: champ.id,
      name: champ.name,
      imageUrl: champ.imageUrl,
      role: champ.role ?? null,
      tags: champ.tags ?? [],
      isActive: champ.isActive,
      position: champ.position,
    }))

const ChampSelectAdmin = () => {
  const [state, setState] = useState<AdminState>({
    rosterId: null,
    champions: [],
    donationSettings: null,
    loading: true,
    error: null,
    savingDonation: false,
    donationAmount: '',
    donationValidationError: '',
    shareLinkStatus: 'idle',
  })

  const { user } = useAuth()
  const copyTimeoutRef = useRef<number | null>(null)

  const shareLink = useMemo(() => {
    if (!user || typeof window === 'undefined') {
      return ''
    }
    return `${window.location.origin}/champ-select/${user.id}`
  }, [user])

  const loadInitialData = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }))

    try {
      const [rosters, donation] = await Promise.all([fetchRosters(), fetchDonationSettings().catch(() => null)])
      let activeRoster = rosters.find((roster) => roster.isPublic) ?? rosters[0] ?? null

      if (!activeRoster) {
        const availableChampions = await fetchChampions()
        const seededChampionIds = availableChampions
          .filter((champ) => champ.isActive)
          .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
          .map((champ) => champ.id)

        const championIds = seededChampionIds.length > 0 ? seededChampionIds : DEFAULT_CHAMPION_IDS
        activeRoster = await createRoster({
          name: DEFAULT_ROSTER_NAME,
          championIds,
          isPublic: true,
        })
      }

      setState({
        rosterId: activeRoster.id,
        champions: normalizeChampions(activeRoster.champions as Champion[]),
        donationSettings: donation ?? null,
        loading: false,
        error: null,
        savingDonation: false,
        donationAmount:
          donation?.defaultAmount != null && Number.isFinite(donation.defaultAmount)
            ? String(donation.defaultAmount)
            : '',
        donationValidationError: '',
        shareLinkStatus: 'idle',
      })
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load admin data.',
      }))
    }
  }, [])

  useEffect(() => {
    void loadInitialData()
  }, [loadInitialData])

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current != null && typeof window !== 'undefined') {
        window.clearTimeout(copyTimeoutRef.current)
        copyTimeoutRef.current = null
      }
    }
  }, [])

  const handleCopyShareLink = useCallback(async () => {
    if (!shareLink) {
      return
    }

    try {
      const canUseClipboard = typeof navigator !== 'undefined' && navigator.clipboard?.writeText
      if (canUseClipboard) {
        await navigator.clipboard.writeText(shareLink)
      } else if (typeof document !== 'undefined') {
        const textarea = document.createElement('textarea')
        textarea.value = shareLink
        textarea.setAttribute('readonly', '')
        textarea.style.position = 'absolute'
        textarea.style.left = '-9999px'
        document.body.appendChild(textarea)
        textarea.select()
        const successful = document.execCommand('copy')
        document.body.removeChild(textarea)
        if (!successful) {
          throw new Error('Copy command was unsuccessful')
        }
      } else {
        throw new Error('Clipboard API not available')
      }

      setState((prev) => ({ ...prev, shareLinkStatus: 'copied' }))

      if (copyTimeoutRef.current != null && typeof window !== 'undefined') {
        window.clearTimeout(copyTimeoutRef.current)
        copyTimeoutRef.current = null
      }
      if (typeof window !== 'undefined') {
        copyTimeoutRef.current = window.setTimeout(() => {
          setState((current) => ({ ...current, shareLinkStatus: 'idle' }))
          copyTimeoutRef.current = null
        }, 2000)
      }
    } catch (error) {
      console.error('Failed to copy viewer link', error)
      setState((prev) => ({ ...prev, shareLinkStatus: 'error' }))
    }
  }, [shareLink])

  const handleRemove = useCallback(
    (id: string) => {
      setState((prev) => {
        if (!prev.rosterId) {
          return prev
        }
        const previousChampions = prev.champions
        const updatedChampions = previousChampions.filter((champ) => champ.id !== id)

        void removeChampionFromRoster(prev.rosterId, id)
          .then((response) => {
            setState((current) => ({
              ...current,
              champions: normalizeChampions(response.champions as Champion[]),
              error: null,
            }))
          })
          .catch((error) => {
            console.error('Failed to remove champion from roster', error)
            setState((current) => ({
              ...current,
              champions: previousChampions,
              error: 'Failed to remove champion. Please try again.',
            }))
          })

        return { ...prev, champions: updatedChampions }
      })
    },
    [],
  )

  const handleReorder = useCallback(
    (fromIndex: number, toIndex: number) => {
      setState((prev) => {
        if (!prev.rosterId) {
          return prev
        }

        const previousChampions = prev.champions
        const reordered = reorder(previousChampions, fromIndex, toIndex)

        void updateRosterOrder(prev.rosterId, reordered.map((champ) => champ.id))
          .then((response) => {
            setState((current) => ({
              ...current,
              champions: normalizeChampions(response.champions as Champion[]),
              error: null,
            }))
          })
          .catch((error) => {
            console.error('Failed to update roster order', error)
            setState((current) => ({
              ...current,
              champions: previousChampions,
              error: 'Failed to reorder champions. Please try again.',
            }))
          })

        return { ...prev, champions: reordered }
      })
    },
    [],
  )

  const handleAmountChange = useCallback((value: string) => {
    setState((prev) => ({
      ...prev,
      donationAmount: value,
      donationValidationError: '',
    }))
  }, [])

  const handleSaveDonation = useCallback(() => {
    setState((prev) => {
      const normalized = prev.donationAmount.trim()
      if (normalized.length === 0) {
        return {
          ...prev,
          donationValidationError: 'Donation amount is required.',
        }
      }
      const numericValue = Number(normalized)
      if (Number.isNaN(numericValue) || numericValue < 0) {
        return {
          ...prev,
          donationValidationError: 'Enter a valid non-negative number.',
        }
      }

      const payload: Partial<DonationSettingsDto> = {
        streamlabsUrl: prev.donationSettings?.streamlabsUrl ?? null,
        defaultAmount: numericValue,
        currency: prev.donationSettings?.currency ?? 'USD',
      }

      void upsertDonationSettings(payload)
        .then((response) => {
          setState((current) => ({
            ...current,
            donationSettings: response,
            donationAmount: response.defaultAmount != null ? String(response.defaultAmount) : '',
            donationValidationError: '',
            savingDonation: false,
          }))
        })
        .catch((error) => {
          console.error('Failed to save donation settings', error)
          setState((current) => ({
            ...current,
            savingDonation: false,
            donationValidationError: 'Failed to save donation settings. Please try again.',
          }))
        })

      return { ...prev, savingDonation: true, donationValidationError: '' }
    })
  }, [])

  const donationErrorId = 'donation-amount-error'

  const header = (
    <AdminHeader
      shareLink={shareLink}
      shareLinkStatus={state.shareLinkStatus}
      onCopyShareLink={shareLink ? handleCopyShareLink : undefined}
    />
  )

  const donationControls = (
    <DonationControls
      amount={state.donationAmount}
      onAmountChange={handleAmountChange}
      onSave={handleSaveDonation}
      isInvalid={Boolean(state.donationValidationError)}
      errorId={state.donationValidationError ? donationErrorId : undefined}
      errorMessage={state.donationValidationError || undefined}
      isSaving={state.savingDonation}
    />
  )

  if (state.loading) {
    return (
      <AdminLayout
        header={header}
        donation={donationControls}
        championList={<div>Loading roster…</div>}
      />
    )
  }

  if (state.error) {
    return (
      <AdminLayout
        header={header}
        donation={donationControls}
        championList={<div>{state.error}</div>}
      />
    )
  }

  return (
    <AdminLayout
      header={header}
      donation={donationControls}
      championList={<ChampionList champs={state.champions} onReorder={handleReorder} onRemove={handleRemove} />}
    />
  )
}

export default ChampSelectAdmin
