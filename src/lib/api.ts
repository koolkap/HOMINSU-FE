import type { Category, ContentItem, Device, LiveItem, LoginResult, PointPackage, UserProfile, Wallet } from '../types'
import i18n, { intlLocale } from '../i18n'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://hominsu-be-production.up.railway.app/api/v1').replace(/\/$/, '')

type Envelope<T> = { data: T }

export const MAX_UPLOAD_BYTES = 50 * 1024 * 1024

export type StorageUpload = {
  id: number
  bucket: string
  path: string
  url: string
  original_name: string
  title: string
  content_type: string
  size: number
  size_bytes: number
  media_kind: 'image' | 'video'
  provider: 's3' | 'supabase'
  is_showcase_ready: boolean
  storage_state: 'ready' | 'cleanup_required'
  created_at: string
}

export type ShowcaseMedia = Pick<StorageUpload, 'id' | 'title' | 'url' | 'content_type' | 'size_bytes' | 'created_at'>

export class ApiError extends Error {
  status: number

  constructor(message: string, status = 0) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = localStorage.getItem('homeinsu_token')
  let response: Response

  try {
    response = await fetch(`${API_BASE_URL}/${path.replace(/^\//, '')}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init?.headers,
      },
    })
  } catch {
    throw new ApiError(i18n.t('api.unreachable'))
  }

  if (response.status === 204) return undefined as T

  let payload: Envelope<T> | { message?: string; error?: string | { message?: string } } | undefined
  try {
    payload = (await response.json()) as Envelope<T> | { message?: string; error?: string | { message?: string } }
  } catch {
    payload = undefined
  }

  if (!response.ok) {
    const details = payload as { message?: string; error?: string | { message?: string } } | undefined
    const errorMessage = typeof details?.error === 'string' ? details.error : details?.error?.message
    throw new ApiError(details?.message || errorMessage || i18n.t('api.failed', { status: response.status }), response.status)
  }

  if (!payload || !('data' in payload)) {
    throw new ApiError(i18n.t('api.invalid'), response.status)
  }

  return payload.data
}

export async function getDisplayData<T>(path: string, fallback: T): Promise<{ data: T; isMock: boolean }> {
  try {
    const data = await request<unknown>(path)
    return { data: normalizeDisplayData(path, data) as T, isMock: false }
  } catch {
    return { data: fallback, isMock: true }
  }
}

export async function login(email: string, password: string) {
  const response = await request<{ access_token: string; user: Record<string, unknown> }>('auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  const result: LoginResult = {
    accessToken: response.access_token,
    user: normalizeProfile(response.user),
  }
  localStorage.setItem('homeinsu_token', response.access_token)
  return result
}

export async function getCurrentUser() {
  return normalizeProfile(await request<Record<string, unknown>>('me'))
}

export function unlockContent(id: string, method: string) {
  return request<{ unlocked: boolean }>(`content/${encodeURIComponent(id)}/unlock`, {
    method: 'POST',
    body: JSON.stringify({ method }),
  })
}

export function createTopup(packageId: string) {
  return request<{ transaction_id: number; wallet: Record<string, unknown> }>('wallet/topups', {
    method: 'POST',
    body: JSON.stringify({
      package_id: Number(packageId),
      reference: `web-${crypto.randomUUID()}`,
    }),
  })
}

export function runDeviceAction(deviceIds: string[], action: string) {
  return request<{ accepted: number }>('operator/devices/actions', {
    method: 'POST',
    body: JSON.stringify({ device_ids: deviceIds.map(Number), action }),
  })
}

export function syncDevices(deviceIds: string[]) {
  return request<{ synced: number }>('operator/sync', {
    method: 'POST',
    body: JSON.stringify({ device_ids: deviceIds.map(Number), payload: { source: 'operator_console' } }),
  })
}

export function uploadStorageFile(file: File, onProgress: (percentage: number) => void): Promise<StorageUpload> {
  if (file.size > MAX_UPLOAD_BYTES) {
    return Promise.reject(new ApiError(i18n.t('creator.tooLarge'), 413))
  }

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    const token = localStorage.getItem('homeinsu_token')
    const form = new FormData()
    form.append('file', file)

    xhr.open('POST', `${API_BASE_URL}/storage/upload`)
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`)
    xhr.responseType = 'json'

    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100))
    })
    xhr.addEventListener('error', () => reject(new ApiError(i18n.t('api.unreachable'))))
    xhr.addEventListener('load', () => {
      const payload = xhr.response as Envelope<StorageUpload> | { message?: string; error?: string | { message?: string } } | null
      if (xhr.status < 200 || xhr.status >= 300) {
        const details = payload as { message?: string; error?: string | { message?: string } } | null
        const errorMessage = typeof details?.error === 'string' ? details.error : details?.error?.message
        reject(new ApiError(details?.message || errorMessage || i18n.t('api.failed', { status: xhr.status }), xhr.status))
        return
      }
      if (!payload || !('data' in payload)) {
        reject(new ApiError(i18n.t('api.invalid'), xhr.status))
        return
      }
      onProgress(100)
      resolve(payload.data)
    })
    xhr.send(form)
  })
}

export function listOperatorMedia() {
  return request<StorageUpload[]>('operator/media')
}

export function deleteOperatorMedia(id: number) {
  return request<void>(`operator/media/${id}`, { method: 'DELETE' })
}

export function listShowcaseMedia() {
  return request<ShowcaseMedia[]>('showcase/media')
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? value as Record<string, unknown> : {}
}

function normalizeProfile(value: unknown): UserProfile {
  const item = asRecord(value)
  return {
    id: String(item.id ?? ''),
    name: String(item.display_name ?? item.name ?? 'HOMINSU Member'),
    email: String(item.email ?? ''),
    role: String(item.role ?? 'member'),
  }
}

function normalizeDisplayData(path: string, value: unknown): unknown {
  if (path === 'catalog/categories' && Array.isArray(value)) {
    return value.map((raw): Category => {
      const item = asRecord(raw)
      const id = String(item.slug ?? item.id)
      const translationKey = `mock.categories.${id}`
      return {
        id,
        label: i18n.exists(translationKey) ? i18n.t(translationKey) : String(item.name ?? item.label ?? ''),
      }
    })
  }
  if ((path === 'content' || path.startsWith('content/'))) {
    const normalizeContent = (raw: unknown): ContentItem => {
      const item = asRecord(raw)
      const creator = asRecord(item.creator)
      return {
        id: String(item.id ?? ''),
        title: String(item.title ?? ''),
        provider: String(creator.name ?? item.provider ?? ''),
        rating: Number(item.rating ?? 4.8),
        views: Number(item.views ?? 0),
        points: Number(item.points_price ?? item.points ?? 0),
        duration: String(item.duration ?? '30:00'),
        imageSeed: `content-${String(item.id ?? 'vr')}`,
        imageUrl: item.thumbnail_url ? String(item.thumbnail_url) : undefined,
        description: item.description ? String(item.description) : undefined,
        previewUrl: item.media_url ? String(item.media_url) : undefined,
      }
    }
    return Array.isArray(value) ? value.map(normalizeContent) : normalizeContent(value)
  }
  if (path === 'live' && Array.isArray(value)) {
    return value.map((raw): LiveItem => {
      const item = asRecord(raw)
      const creator = asRecord(item.creator)
      return {
        id: String(item.id ?? ''),
        title: String(item.title ?? ''),
        channel: String(creator.name ?? item.channel ?? ''),
        viewers: Number(item.viewers ?? 0),
        imageSeed: `live-${String(item.id ?? 'vr')}`,
        imageUrl: item.thumbnail_url ? String(item.thumbnail_url) : undefined,
      }
    })
  }
  if (path === 'wallet') {
    const item = asRecord(value)
    return { balance: Number(item.points_balance ?? item.balance ?? 0), currency: 'P' } satisfies Wallet
  }
  if (path === 'wallet/packages' && Array.isArray(value)) {
    return value.map((raw): PointPackage => {
      const item = asRecord(raw)
      return {
        id: String(item.id ?? ''),
        points: Number(item.points ?? 0),
        price: Number(item.price ?? 0),
        bonus: Number(item.bonus_points ?? item.bonus ?? 0),
      }
    })
  }
  if (path === 'me') return normalizeProfile(value)
  if (path === 'operator/devices' && Array.isArray(value)) {
    return value.map((raw): Device => {
      const item = asRecord(raw)
      const venue = asRecord(item.venue)
      return {
        id: String(item.id ?? ''),
        name: String(item.name ?? ''),
        location: String(venue.name ?? item.location ?? ''),
        status: String(item.status ?? 'offline'),
        lastSync: item.last_seen_at
          ? new Intl.DateTimeFormat(intlLocale(), { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(String(item.last_seen_at)))
          : i18n.t('operator.noSync'),
        model: item.headset_model ? String(item.headset_model) : undefined,
        firmware: item.firmware_version ? String(item.firmware_version) : undefined,
        battery: item.battery_level == null ? undefined : Number(item.battery_level),
        ipAddress: item.ip_address ? String(item.ip_address) : undefined,
      }
    })
  }
  return value
}
