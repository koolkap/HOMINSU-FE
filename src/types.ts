export interface LiveItem {
  id: string
  title: string
  channel: string
  viewers: number
  imageSeed: string
}

export interface ContentItem {
  id: string
  title: string
  provider: string
  rating: number
  views: number
  points: number
  duration: string
  imageSeed: string
  isAdult?: boolean
}

export interface Category {
  id: string
  label: string
}
