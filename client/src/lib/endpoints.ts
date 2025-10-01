import { apiFetch } from './api'

export type ChampionDto = {
  id: string
  name: string
  imageUrl: string
  role: string | null
  tags: string[]
  isActive: boolean
  position?: number
  createdAt?: string
  updatedAt?: string
}

export type PublicRosterResponse = {
  roster: {
    id: number
    name: string
    isPublic: boolean
    createdAt: string
    updatedAt: string
  }
  champions: ChampionDto[]
  donationSettings: {
    streamlabsUrl: string | null
    defaultAmount: number | null
    currency: string
    streamlabsToken: string | null
  } | null
}

export type DonationSettingsDto = {
  streamlabsUrl: string | null
  defaultAmount: number | null
  currency: string
}

export type RosterDto = {
  id: number
  name: string
  isPublic: boolean
  createdAt: string
  updatedAt: string
  champions: ChampionDto[]
}

export type StreamlabsStatusDto = {
  hasCredentials: boolean
  tokenExpiresAt: string | null
}

export const fetchPublicRoster = (ownerUserId?: string | number) => {
  const normalizedOwnerId = ownerUserId != null ? String(ownerUserId).trim() : ''
  const query = normalizedOwnerId ? `?ownerUserId=${encodeURIComponent(normalizedOwnerId)}` : ''
  return apiFetch<PublicRosterResponse>(`/rosters/public${query}`)
}

export const fetchChampions = () => apiFetch<ChampionDto[]>('/champions')

export const fetchChampionCatalog = () => apiFetch<ChampionDto[]>('/champions/catalog')

export const fetchDonationSettings = () => apiFetch<DonationSettingsDto>('/settings/donation')

export const upsertDonationSettings = (payload: Partial<DonationSettingsDto>) =>
  apiFetch<DonationSettingsDto>('/settings/donation', {
    method: 'PUT',
    body: JSON.stringify(payload),
  })

export const fetchStreamlabsStatus = () => apiFetch<StreamlabsStatusDto>('/settings/streamlabs')

export const upsertStreamlabsCredentials = (payload: {
  accessToken: string
  refreshToken?: string | null
  tokenExpiresAt?: string | null
}) =>
  apiFetch<StreamlabsStatusDto>('/settings/streamlabs', {
    method: 'PUT',
    body: JSON.stringify(payload),
  })

export const deleteStreamlabsCredentials = () =>
  apiFetch<void>('/settings/streamlabs', { method: 'DELETE' })

export const fetchRosters = () => apiFetch<RosterDto[]>('/rosters')

export const createRoster = (payload: {
  name: string
  championIds: string[]
  isPublic?: boolean
}) =>
  apiFetch<RosterDto>('/rosters', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

export const updateRoster = (id: number, payload: { name?: string; isPublic?: boolean }) =>
  apiFetch<RosterDto>(`/rosters/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })

export const updateRosterOrder = (id: number, championIds: string[]) =>
  apiFetch<{ id: number; champions: ChampionDto[] }>(`/rosters/${id}/order`, {
    method: 'PUT',
    body: JSON.stringify({ championIds }),
  })

export const addChampionToRoster = (id: number, championId: string, position?: number) =>
  apiFetch<{ champions: ChampionDto[] }>(`/rosters/${id}/champions`, {
    method: 'POST',
    body: JSON.stringify({ championId, position }),
  })

export const removeChampionFromRoster = (id: number, championId: string) =>
  apiFetch<{ champions: ChampionDto[] }>(`/rosters/${id}/champions/${championId}`, {
    method: 'DELETE',
  })

export const deleteRoster = (id: number) =>
  apiFetch<void>(`/rosters/${id}`, { method: 'DELETE' })
