import type { Champion } from './types'

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
