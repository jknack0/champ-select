export type Champion = {
  id: string
  name: string
  img: string
}

export type Selection = {
  id: string
  name: string
  img: string
  selectedAt: string
}

export type ViewState = 'idle' | 'waiting' | 'picker'
