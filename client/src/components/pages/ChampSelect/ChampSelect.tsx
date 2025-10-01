import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { io, type Socket } from 'socket.io-client'
import { fetchPublicRoster } from '../../../lib/endpoints'
import DonationBar from '../../molecules/DonationBar/DonationBar'
import ChampionGrid from '../../organisms/ChampionGrid/ChampionGrid'
import WaitingRoom from '../../organisms/WaitingRoom/WaitingRoom'
import PublicHeader from '../../organisms/PublicHeader/PublicHeader'
import SelectionBanner from '../../organisms/SelectionBanner/SelectionBanner'
import ChampSelectPublicLayout from '../../templates/ChampSelectPublicLayout/ChampSelectPublicLayout'
import './ChampSelect.css'
import type { Champion, Selection, ViewState } from './types'
import {
  amountsEqual,
  extractDonationAmount,
  formatAmount,
  parseValidAmount,
} from './utils'

const INITIAL_CHAMPIONS: Champion[] = [
  { id: 'ahri', name: 'Ahri', img: 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Ahri_0.jpg' },
  { id: 'akali', name: 'Akali', img: 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Akali_0.jpg' },
  { id: 'ashe', name: 'Ashe', img: 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Ashe_0.jpg' },
  { id: 'ekko', name: 'Ekko', img: 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Ekko_0.jpg' },
  { id: 'jinx', name: 'Jinx', img: 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Jinx_0.jpg' },
  { id: 'lux', name: 'Lux', img: 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Lux_0.jpg' },
  { id: 'thresh', name: 'Thresh', img: 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Thresh_0.jpg' },
  { id: 'vayne', name: 'Vayne', img: 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Vayne_0.jpg' },
]

const DONATION_URL_BASE = 'https://streamlabs.com/<your-channel>/tip'
const STREAMLABS_SOCKET_URL = 'https://sockets.streamlabs.com'

const CHANNEL_NAME = 'champ-select:channel'

type StreamlabsSocketEvent = {
  ['for']?: string | null
  type?: string | null
  message?: unknown
}
// Page

const ChampSelect = () => {
  const [champs, setChamps] = useState<Champion[]>(INITIAL_CHAMPIONS)
  const [donationAmount, setDonationAmount] = useState<string>('')
  const [streamlabsUrl, setStreamlabsUrl] = useState<string>('')
  const [streamlabsToken, setStreamlabsToken] = useState<string>('')
  const [selectedChampion, setSelectedChampion] = useState<Selection | null>(null)
  const [view, setView] = useState<ViewState>('idle')
  const [socketConnected, setSocketConnected] = useState(false)
  const [lastEventAt, setLastEventAt] = useState<string | undefined>(undefined)

  const socketRef = useRef<Socket | null>(null)
  const broadcastRef = useRef<BroadcastChannel | null>(null)
  const donationAmountRef = useRef<string>(donationAmount)

  useEffect(() => {
    donationAmountRef.current = donationAmount
  }, [donationAmount])

  useEffect(() => {
    let cancelled = false

    const resolveOwnerId = () => {
      if (typeof window === 'undefined') {
        return null
      }
      const params = new URLSearchParams(window.location.search)
      const value = params.get('ownerId')
      return value && value.trim() ? value.trim() : null
    }

    const loadRoster = async () => {
      try {
        const ownerId = resolveOwnerId()
        const response = await fetchPublicRoster(ownerId ?? undefined)
        if (cancelled) {
          return
        }

        const nextChamps = Array.isArray(response.champions)
          ? response.champions.reduce<Champion[]>((acc, champ) => {
              if (champ?.id && champ?.name) {
                acc.push({
                  id: champ.id,
                  name: champ.name,
                  img: champ.imageUrl,
                })
              }
              return acc
            }, [])
          : []

        setChamps(nextChamps)

        const defaultAmount = response.donationSettings?.defaultAmount
        if (typeof defaultAmount === 'number' && Number.isFinite(defaultAmount)) {
          const amountString = defaultAmount.toString()
          setDonationAmount(amountString)
          donationAmountRef.current = amountString
        }

        const remoteUrl = response.donationSettings?.streamlabsUrl?.trim()
        if (remoteUrl) {
          setStreamlabsUrl(remoteUrl)
        }

        const remoteToken = response.donationSettings?.streamlabsToken?.trim()
        if (typeof remoteToken === 'string') {
          setStreamlabsToken(remoteToken)
        }
      } catch (error) {
        if (!cancelled) {
          console.warn('Failed to load public roster', error)
        }
      }
    }

    void loadRoster()

    return () => {
      cancelled = true
    }
  }, [])
  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    if (typeof BroadcastChannel === 'undefined') {
      return
    }
    const channel = new BroadcastChannel(CHANNEL_NAME)
    broadcastRef.current = channel

    const handleMessage = (event: MessageEvent) => {
      const data = event.data
      if (!data || typeof data !== 'object') {
        return
      }
      if (data.type === 'SELECTION_UPDATED') {
        const payload = data.payload as { selectedChampion?: Selection }
        if (payload && payload.selectedChampion) {
          setSelectedChampion(payload.selectedChampion)
          setView('idle')
        }
      }
    }

    channel.addEventListener('message', handleMessage)

    return () => {
      channel.removeEventListener('message', handleMessage)
      channel.close()
      broadcastRef.current = null
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const socketToken = streamlabsToken.trim()

    if (!socketToken) {
      setSocketConnected(false)
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
      }
      return
    }

    let cancelled = false
    let cleanupSocket: (() => void) | null = null

    const startConnection = () => {
      if (cancelled) {
        return
      }

      const socket = io(STREAMLABS_SOCKET_URL, {
        transports: ['websocket'],
        query: { token: socketToken },
      })

      socketRef.current = socket

      const handleConnect = () => setSocketConnected(true)
      const handleDisconnect = () => setSocketConnected(false)
      const handleConnectError = (error: Error) => {
        console.warn('Streamlabs socket connection error', error)
        handleDisconnect()
      }
      const handleDonationMessage = (payload: unknown) => {
        const amount = extractDonationAmount(payload)
        if (!amount) {
          return
        }
        const targetAmount = donationAmountRef.current
        if (targetAmount && amountsEqual(amount, targetAmount)) {
          setView('picker')
          setLastEventAt(new Date().toISOString())
        }
      }

      const handleStreamlabsEvent = (eventData: unknown) => {
        if (!eventData || typeof eventData !== 'object') {
          return
        }

        const event = eventData as StreamlabsSocketEvent
        const target = event['for'] ?? 'streamlabs'
        const { type, message } = event

        if ((!event['for'] || target === 'streamlabs') && type === 'donation') {
          const payloads: unknown[] = Array.isArray(message)
            ? message
            : message !== undefined
              ? [message]
              : []
          if (!payloads.length) {
            payloads.push(eventData)
          }
          payloads.forEach((entry) => {
            handleDonationMessage(entry)
          })
          return
        }

        if (target === 'twitch_account') {
          const payloads: unknown[] = Array.isArray(message)
            ? message
            : message !== undefined
              ? [message]
              : []
          if (!payloads.length) {
            payloads.push(eventData)
          }
          switch (type) {
            case 'follow':
            case 'subscription': {
              payloads.forEach((entry) => {
                console.log('Streamlabs event', type, entry)
              })
              break
            }
            default: {
              payloads.forEach((entry) => {
                console.log('Streamlabs event', type, entry)
              })
              break
            }
          }
        }
      }

      socket.on('connect', handleConnect)
      socket.on('disconnect', handleDisconnect)
      socket.on('connect_error', handleConnectError)
      socket.on('error', handleConnectError)
      socket.on('event', handleStreamlabsEvent)

      cleanupSocket = () => {
        socket.off('connect', handleConnect)
        socket.off('disconnect', handleDisconnect)
        socket.off('connect_error', handleConnectError)
        socket.off('error', handleConnectError)
        socket.off('event', handleStreamlabsEvent)
        socket.disconnect()
        if (socketRef.current === socket) {
          socketRef.current = null
        }
      }
    }

    const timeoutId = window.setTimeout(startConnection, 0)

    return () => {
      cancelled = true
      window.clearTimeout(timeoutId)
      if (cleanupSocket) {
        cleanupSocket()
      }
    }
  }, [streamlabsToken])

  const amountValue = useMemo(() => parseValidAmount(donationAmount), [donationAmount])
  const amountLabel = amountValue !== null ? formatAmount(amountValue) : ''
  const hasPrefilledAmount = amountValue !== null
  const sanitizedStreamlabsUrl = streamlabsUrl.trim()
  const donationBase = sanitizedStreamlabsUrl || DONATION_URL_BASE
  const donationUrl = useMemo(() => {
    if (!hasPrefilledAmount) {
      return donationBase
    }
    const trimmed = donationAmount.trim()
    return `${donationBase}?amount=${encodeURIComponent(trimmed)}`
  }, [donationAmount, donationBase, hasPrefilledAmount])

  const handleDonateClick = useCallback(() => {
    if (typeof window === 'undefined') {
      return
    }
    const url = donationUrl
    window.open(url, '_blank', 'noopener')
    setView('waiting')
  }, [donationUrl])

  const broadcastSelection = useCallback((selection: Selection) => {
    const message = {
      type: 'SELECTION_UPDATED',
      payload: { selectedChampion: selection },
    }

    if (broadcastRef.current) {
      broadcastRef.current.postMessage(message)
      return
    }

    if (typeof BroadcastChannel !== 'undefined') {
      const channel = new BroadcastChannel(CHANNEL_NAME)
      channel.postMessage(message)
      channel.close()
    }
  }, [])

  const handlePickChampion = useCallback(
    (champion: Champion) => {
      const selection: Selection = {
        id: champion.id,
        name: champion.name,
        img: champion.img,
        selectedAt: new Date().toISOString(),
      }
      setSelectedChampion(selection)
      setView('idle')
      broadcastSelection(selection)
    },
    [broadcastSelection],
  )

  const mainContent = useMemo(() => {
    if (view === 'waiting') {
      return <WaitingRoom amountLabel={amountLabel} connected={socketConnected} lastEventAt={lastEventAt} />
    }

    if (view === 'picker') {
      return (
        <ChampionGrid
          champs={champs}
          mode="pick"
          onPick={handlePickChampion}
          selectedChampionId={selectedChampion?.id ?? null}
        />
      )
    }

    return (
      <ChampionGrid
        champs={champs}
        mode="view"
        selectedChampionId={selectedChampion?.id ?? null}
      />
    )
  }, [amountLabel, champs, handlePickChampion, lastEventAt, selectedChampion, socketConnected, view])

  const selectionBanner = selectedChampion ? <SelectionBanner selection={selectedChampion} /> : undefined

  return (
    <div className="champ-select-page">
      <ChampSelectPublicLayout
        header={<PublicHeader />}
        selectionBanner={selectionBanner}
        donationBar={
          <DonationBar
            amountLabel={amountLabel}
            donationUrl={donationUrl}
            onDonateClick={handleDonateClick}
            hasPrefilledAmount={hasPrefilledAmount}
          />
        }
        main={mainContent}
      />
    </div>
  )
}

export default ChampSelect







































