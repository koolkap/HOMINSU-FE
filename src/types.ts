export interface LiveItem {
  id: string
  title: string
  channel: string
  viewers: number
  imageSeed: string
  imageUrl?: string
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
  imageUrl?: string
  isAdult?: boolean
  description?: string
  previewUrl?: string
  unlocked?: boolean
}

export interface Category {
  id: string
  label: string
}

export interface Wallet {
  balance: number
  currency?: string
  transactions?: Array<{ id: string; label: string; amount: number; createdAt: string }>
}

export interface PointPackage {
  id: string
  points: number
  price: number
  bonus?: number
}

export interface UserProfile {
  id: string
  name: string
  email: string
  role?: string
  avatarUrl?: string
  joinedAt?: string
}

export interface Device {
  id: string
  name: string
  location: string
  status: 'online' | 'offline' | 'warning' | string
  lastSync?: string
  model?: string
  firmware?: string
  battery?: number
  ipAddress?: string
}

export interface LoginResult {
  token?: string
  accessToken?: string
  user?: UserProfile
}
