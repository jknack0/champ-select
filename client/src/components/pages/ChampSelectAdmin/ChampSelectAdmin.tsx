import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Card, Heading, Button, InlineError } from '../../atoms'
import { DonationControls } from '../../molecules'
import { ChampionList, AdminHeader } from '../../organisms'
import { AdminLayout } from '../../templates'
import styles from './ChampSelectAdmin.module.css'
import { useAuth } from '../../../context/AuthContext'
import type { Champion } from '../../../types/champion'
import {
  fetchRosters,
  createRoster,
  updateRosterOrder,
  removeChampionFromRoster,
  fetchDonationSettings,
  upsertDonationSettings,
  addChampionToRoster,
  fetchChampionCatalog,
  type ChampionDto,
  type DonationSettingsDto,
} from '../../../lib/endpoints'

const DEFAULT_ROSTER_NAME = 'Stream Default'

type ShareStatus = 'idle' | 'copied' | 'error'

type ShareLinkConfig = {
  label: string
  url: string
  status: ShareStatus
  onCopy?: () => void
}

type AdminState = {
  rosterId: number | null
  champions: Champion[]
  donationSettings: DonationSettingsDto | null
  loading: boolean
  error: string | null
  savingDonation: boolean
  donationAmount: string
  donationValidationError: string
  shareStatuses: Record<'viewer' | 'overlay', ShareStatus>
}

const mapChampionDto = (champion: ChampionDto): Champion => ({
  id: champion.id,
  name: champion.name,
  imageUrl: champion.imageUrl,
  role: champion.role,
  tags: champion.tags ?? [],
  isActive: champion.isActive,
  position: champion.position,
})

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
    shareStatuses: { viewer: 'idle', overlay: 'idle' },
  })

  const [catalog, setCatalog] = useState<Champion[]>([])
  const [catalogLoading, setCatalogLoading] = useState(true)
  const [catalogError, setCatalogError] = useState<string | null>(null)
  const [selectedChampionId, setSelectedChampionId] = useState('')
  const [addingChampion, setAddingChampion] = useState(false)
  const [addChampionError, setAddChampionError] = useState<string | null>(null)
  const [isCatalogOpen, setIsCatalogOpen] = useState(false)

  const { user } = useAuth()
  const copyTimeoutRef = useRef<{ viewer: number | null; overlay: number | null }>({ viewer: null, overlay: null })
  const dropdownRef = useRef<HTMLDivElement | null>(null)

  const viewerLink = useMemo(() => {
    if (!user || typeof window === 'undefined') {
      return ''
    }
    return `${window.location.origin}/champ-select?ownerId=${user.id}`
  }, [user])

  const overlayLink = useMemo(() => {
    if (!user || typeof window === 'undefined') {
      return ''
    }
    return `${window.location.origin}/overlay?ownerId=${user.id}`
  }, [user])

  useEffect(() => {
    if (!user) {
      setCatalog([])
      setCatalogLoading(false)
      return
    }

    let cancelled = false

    const loadCatalog = async () => {
      setCatalogLoading(true)
      try {
        const data = await fetchChampionCatalog()
        if (cancelled) {
          return
        }
        setCatalog(data.map(mapChampionDto))
        setCatalogError(null)
      } catch (error) {
        if (cancelled) {
          return
        }
        const message = error instanceof Error ? error.message : 'Failed to load champion catalog.'
        setCatalogError(message)
      } finally {
        if (!cancelled) {
          setCatalogLoading(false)
        }
      }
    }

    void loadCatalog()

    return () => {
      cancelled = true
    }
  }, [user?.id])

  const loadInitialData = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }))

    try {
      const [rosters, donation] = await Promise.all([fetchRosters(), fetchDonationSettings().catch(() => null)])
      let activeRoster = rosters.find((roster) => roster.isPublic) ?? rosters[0] ?? null

      if (!activeRoster) {
        activeRoster = await createRoster({
          name: DEFAULT_ROSTER_NAME,
          championIds: [],
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
        shareStatuses: { viewer: 'idle', overlay: 'idle' },
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
      if (typeof window === 'undefined') {
        return
      }

      (['viewer', 'overlay'] as const).forEach((key) => {
        const timeoutId = copyTimeoutRef.current[key]
        if (timeoutId != null) {
          window.clearTimeout(timeoutId)
        }
        copyTimeoutRef.current[key] = null
      })
    }
  }, [])

  const handleCopyLink = useCallback(async (target: 'viewer' | 'overlay', link: string) => {
    if (!link) {
      return
    }

    try {
      const canUseClipboard = typeof navigator !== 'undefined' && navigator.clipboard?.writeText
      if (canUseClipboard) {
        await navigator.clipboard.writeText(link)
      } else if (typeof document !== 'undefined') {
        const textarea = document.createElement('textarea')
        textarea.value = link
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

      setState((prev) => ({
        ...prev,
        shareStatuses: { ...prev.shareStatuses, [target]: 'copied' },
      }))

      if (typeof window !== 'undefined') {
        const existing = copyTimeoutRef.current[target]
        if (existing != null) {
          window.clearTimeout(existing)
        }
        copyTimeoutRef.current[target] = window.setTimeout(() => {
          setState((current) => ({
            ...current,
            shareStatuses: { ...current.shareStatuses, [target]: 'idle' },
          }))
          copyTimeoutRef.current[target] = null
        }, 2000)
      }
    } catch (error) {
      console.error('Failed to copy share link', error)
      setState((prev) => ({
        ...prev,
        shareStatuses: { ...prev.shareStatuses, [target]: 'error' },
      }))
    }
  }, [])

  const shareLinks = useMemo<ShareLinkConfig[]>(() => {
    const links: ShareLinkConfig[] = []
    if (viewerLink) {
      links.push({
        label: 'Viewer Link',
        url: viewerLink,
        status: state.shareStatuses.viewer,
        onCopy: () => handleCopyLink('viewer', viewerLink),
      })
    }
    if (overlayLink) {
      links.push({
        label: 'Overlay Link',
        url: overlayLink,
        status: state.shareStatuses.overlay,
        onCopy: () => handleCopyLink('overlay', overlayLink),
      })
    }
    return links
  }, [viewerLink, overlayLink, state.shareStatuses, handleCopyLink])

  const activeCatalog = useMemo(() => catalog.filter((champ) => champ.isActive !== false), [catalog])

  const rosterChampionIds = useMemo(() => new Set(state.champions.map((champ) => champ.id)), [state.champions])

  const availableChampions = useMemo(() => {
    return activeCatalog.filter((champ) => !rosterChampionIds.has(champ.id))
  }, [activeCatalog, rosterChampionIds])

  const selectedChampion = useMemo(
    () => activeCatalog.find((champ) => champ.id === selectedChampionId) ?? null,
    [activeCatalog, selectedChampionId],
  )

  const selectLabel = useMemo(() => {
    if (catalogLoading) {
      return 'Loading champions...';
    }
    if (!state.rosterId) {
      return 'Select a roster to add champions';
    }
    return 'Choose a Champion';
  }, [catalogLoading, state.rosterId, availableChampions])

  const selectDisabled = catalogLoading || addingChampion || !state.rosterId

  useEffect(() => {
    if (selectedChampionId && !availableChampions.some((champ) => champ.id === selectedChampionId)) {
      setSelectedChampionId('')
    }
  }, [selectedChampionId, availableChampions])

  useEffect(() => {
    if (!isCatalogOpen) {
      return
    }
    if (catalogLoading || !state.rosterId) {
      setIsCatalogOpen(false)
    }
  }, [isCatalogOpen, catalogLoading, state.rosterId])

  useEffect(() => {
    if (!isCatalogOpen) {
      return
    }

    const handleClick = (event: MouseEvent) => {
      if (!dropdownRef.current || dropdownRef.current.contains(event.target as Node)) {
        return
      }
      setIsCatalogOpen(false)
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsCatalogOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isCatalogOpen])

  const handleAddChampion = useCallback(() => {
    if (!state.rosterId || !selectedChampionId || rosterChampionIds.has(selectedChampionId)) {
      return
    }

    setAddingChampion(true)
    setAddChampionError(null)

    void addChampionToRoster(state.rosterId, selectedChampionId)
      .then((response) => {
        setState((current) => ({
          ...current,
          champions: normalizeChampions(response.champions as Champion[]),
          error: null,
        }))
        setSelectedChampionId('')
        setIsCatalogOpen(false)
      })
      .catch((error) => {
        console.error('Failed to add champion to roster', error)
        setAddChampionError(error instanceof Error ? error.message : 'Failed to add champion. Please try again.')
      })
      .finally(() => {
        setAddingChampion(false)
      })
  }, [selectedChampionId, state.rosterId, rosterChampionIds])

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

  const header = <AdminHeader shareLinks={shareLinks} />

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

  const manualAddCard = (
    <Card className={styles.addCard}>
      <div className={styles.addHeader}>
        <Heading level={2}>Add a champion</Heading>
        <p className={styles.addCopy}>Select a champion to queue them in the roster order.</p>
      </div>
      <div className={styles.addControls}>
        <div className={styles.selectControl} ref={dropdownRef}>
          <button
            type="button"
            role="combobox"
            className={[
              styles.selectButton,
              isCatalogOpen ? styles.selectButtonOpen : undefined,
              selectDisabled ? styles.selectButtonDisabled : undefined,
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={() => {
              if (selectDisabled) {
                return
              }
              setIsCatalogOpen((prev) => !prev)
            }}
            disabled={selectDisabled}
            aria-haspopup="listbox"
            aria-expanded={isCatalogOpen}
          >
            {selectedChampion ? (
              <span className={styles.selection}>
                <img
                  src={selectedChampion.imageUrl}
                  alt={selectedChampion.name}
                  className={styles.selectionImage}
                />
                <span className={styles.selectionName}>{selectedChampion.name}</span>
              </span>
            ) : (
              <span className={styles.placeholder}>{selectLabel}</span>
            )}
            <span
              className={[styles.chevron, isCatalogOpen ? styles.chevronOpen : undefined]
                .filter(Boolean)
                .join(' ')}
              aria-hidden="true"
            />
          </button>
          {isCatalogOpen ? (
            <div className={styles.dropdown} role="listbox">
              <ul className={styles.optionList}>
                {activeCatalog.map((champ) => {
                  const isDisabled = rosterChampionIds.has(champ.id)
                  return (
                    <li key={champ.id}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={champ.id === selectedChampionId}
                        className={[
                          styles.optionButton,
                          isDisabled ? styles.optionButtonDisabled : undefined,
                          champ.id === selectedChampionId ? styles.optionButtonActive : undefined,
                        ]
                          .filter(Boolean)
                          .join(' ')}
                        onClick={() => {
                          if (isDisabled) {
                            return
                          }
                          setSelectedChampionId(champ.id)
                          setAddChampionError(null)
                          setIsCatalogOpen(false)
                        }}
                        disabled={isDisabled}
                      >
                        <img src={champ.imageUrl} alt={champ.name} className={styles.optionImage} />
                        <span className={styles.optionName}>{champ.name}</span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          ) : null}
        </div>
        <Button
          type="button"
          onClick={handleAddChampion}
          disabled={!selectedChampionId || !state.rosterId || addingChampion || rosterChampionIds.has(selectedChampionId)}
        >
          {addingChampion ? 'Adding...' : 'Add Champion'}
        </Button>
      </div>
      {catalogLoading ? <p className={styles.state}>Loading champion catalog...</p> : null}
      {catalogError ? <InlineError id="catalog-error">{catalogError}</InlineError> : null}
      {addChampionError ? <InlineError id="add-champion-error">{addChampionError}</InlineError> : null}
      {!catalogLoading && !catalogError && availableChampions.length === 0 ? (
        <p className={styles.state}>Every champion in the catalog is already on this roster.</p>
      ) : null}
    </Card>
  )

  const championSection = (
    <div className={styles.championColumn}>
      {manualAddCard}
      <ChampionList champs={state.champions} onReorder={handleReorder} onRemove={handleRemove} />
    </div>
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
      championList={championSection}
    />
  )
}

export default ChampSelectAdmin





























