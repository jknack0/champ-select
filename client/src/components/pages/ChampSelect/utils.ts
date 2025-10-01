import type { Champion, Selection } from './types'

export const parseValidAmount = (raw: string): number | null => {
  if (typeof raw !== 'string') {
    return null
  }
  const trimmed = raw.trim()
  if (!trimmed) {
    return null
  }
  const sanitized = trimmed.replace(/\$/g, '').replace(/,/g, '')
  if (!/^\d*(?:\.\d{0,2})?$/.test(sanitized)) {
    return null
  }
  const parsed = Number(sanitized)
  if (!Number.isFinite(parsed) || parsed < 0) {
    return null
  }
  return parsed
}

export const formatAmount = (value: number): string => `$${value.toFixed(2)}`

export const amountsEqual = (a: string, b: string): boolean => {
  const aValue = parseValidAmount(a)
  const bValue = parseValidAmount(b)
  if (aValue === null || bValue === null) {
    return false
  }
  return Math.round(aValue * 100) === Math.round(bValue * 100)
}

const adaptChampion = (candidate: Record<string, unknown>): Champion | null => {
  const id = typeof candidate.id === 'string' ? candidate.id : null
  const name = typeof candidate.name === 'string' ? candidate.name : null
  const imgSource =
    typeof candidate.img === 'string' && candidate.img.trim()
      ? candidate.img.trim()
      : typeof candidate.imageUrl === 'string' && candidate.imageUrl.trim()
        ? candidate.imageUrl.trim()
        : ''

  if (!id || !name) {
    return null
  }

  return { id, name, img: imgSource }
}

export const parseChampionList = (value: unknown): Champion[] => {
  if (!Array.isArray(value)) {
    return []
  }
  const seen = new Set<string>()
  const list: Champion[] = []

  value.forEach((item) => {
    if (item && typeof item === 'object') {
      const champion = adaptChampion(item as Record<string, unknown>)
      if (champion && !seen.has(champion.id)) {
        list.push(champion)
        seen.add(champion.id)
      }
    }
  })

  return list
}

export const readChampionsFromStorage = (storageKey: string, fallback: Champion[]): Champion[] => {
  if (typeof window === 'undefined') {
    return fallback
  }
  try {
    const raw = window.localStorage.getItem(storageKey)
    if (!raw) {
      return fallback
    }
    const parsed = JSON.parse(raw)
    const champions = parseChampionList(parsed)
    return champions.length ? champions : fallback
  } catch (error) {
    console.warn('Failed to read champions from storage', error)
    return fallback
  }
}

export const readStringFromStorage = (storageKey: string): string => {
  if (typeof window === 'undefined') {
    return ''
  }
  try {
    const stored = window.localStorage.getItem(storageKey)
    return typeof stored === 'string' ? stored : ''
  } catch (error) {
    console.warn(`Failed to read ${storageKey} from storage`, error)
    return ''
  }
}

export const readSelectionFromStorage = (storageKey: string): Selection | null => {
  if (typeof window === 'undefined') {
    return null
  }
  try {
    const raw = window.localStorage.getItem(storageKey)
    if (!raw) {
      return null
    }
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed === 'object') {
      const id = typeof parsed.id === 'string' ? parsed.id : null
      const name = typeof parsed.name === 'string' ? parsed.name : null
      const img = typeof parsed.img === 'string' ? parsed.img : ''
      const selectedAt = typeof parsed.selectedAt === 'string' ? parsed.selectedAt : new Date().toISOString()
      if (id && name) {
        return { id, name, img, selectedAt }
      }
    }
    return null
  } catch (error) {
    console.warn('Failed to read selected champion from storage', error)
    return null
  }
}

export const extractDonationAmount = (payload: unknown): string | null => {
  const queue: unknown[] = [payload]
  const seen = new WeakSet<object>()

  while (queue.length) {
    const current = queue.shift()

    if (current === null || current === undefined) {
      continue
    }

    if (typeof current === 'string') {
      if (parseValidAmount(current) !== null) {
        return current
      }
      continue
    }

    if (typeof current === 'number') {
      return current.toString()
    }

    if (Array.isArray(current)) {
      current.forEach((item) => queue.push(item))
      continue
    }

    if (typeof current === 'object') {
      if (seen.has(current as object)) {
        continue
      }
      seen.add(current as object)
      const objectValue = current as Record<string, unknown>
      const directAmount = objectValue.amount
      if (typeof directAmount === 'string' && parseValidAmount(directAmount) !== null) {
        return directAmount
      }
      if (typeof directAmount === 'number') {
        return directAmount.toString()
      }
      const formattedAmount = objectValue.formatted_amount
      if (typeof formattedAmount === 'string' && parseValidAmount(formattedAmount) !== null) {
        return formattedAmount
      }
      if ('data' in objectValue) {
        queue.push(objectValue.data)
      }
      if ('message' in objectValue) {
        queue.push(objectValue.message)
      }
      if ('messages' in objectValue) {
        queue.push(objectValue.messages)
      }
      if ('event' in objectValue) {
        queue.push(objectValue.event)
      }
      if ('payload' in objectValue) {
        queue.push(objectValue.payload)
      }
      if ('body' in objectValue) {
        queue.push(objectValue.body)
      }
    }
  }

  return null
}
