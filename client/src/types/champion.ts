export type Champion = {
  id: string
  name: string
  imageUrl: string
  role: string | null
  tags: string[]
  isActive: boolean
  position?: number
}
