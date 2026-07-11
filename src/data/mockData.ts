import i18n, { type AppLanguage } from '../i18n'
import type { Category, ContentItem, Device, LiveItem, PointPackage, UserProfile, Wallet } from '../types'

function translate(language: AppLanguage) {
  return i18n.getFixedT(language)
}

export function getMockCategories(language: AppLanguage): Category[] {
  const t = translate(language)
  return ['all', 'subscribe', 'travel', 'game', 'music', 'edu', 'sports'].map((id) => ({
    id,
    label: t(`mock.categories.${id}`),
  }))
}

export function getMockLiveItems(language: AppLanguage): LiveItem[] {
  const t = translate(language)
  return [
    { id: 'live-1', title: t('mock.live.oneTitle'), channel: t('mock.live.oneChannel'), viewers: 1532, imageSeed: 'santorini-vr' },
    { id: 'live-2', title: t('mock.live.twoTitle'), channel: t('mock.live.twoChannel'), viewers: 4820, imageSeed: 'kpop-vr-concert' },
    { id: 'live-3', title: t('mock.live.threeTitle'), channel: t('mock.live.threeChannel'), viewers: 902, imageSeed: 'seorak-hike' },
    { id: 'live-4', title: t('mock.live.fourTitle'), channel: t('mock.live.fourChannel'), viewers: 655, imageSeed: 'shibuya-night' },
  ]
}

export function getMockContentItems(language: AppLanguage): ContentItem[] {
  const t = translate(language)
  return [
    { id: 'content-1', title: t('mock.content.oneTitle'), provider: t('mock.content.academy'), description: t('mock.content.oneDescription'), rating: 4.4, views: 19000, points: 400, duration: '40:00', imageSeed: 'human-body-vr' },
    { id: 'content-2', title: t('mock.content.twoTitle'), provider: t('mock.content.academy'), description: t('mock.content.twoDescription'), rating: 4.8, views: 45000, points: 300, duration: '25:00', imageSeed: 'dinosaur-vr' },
    { id: 'content-3', title: t('mock.content.threeTitle'), provider: t('mock.content.academy'), description: t('mock.content.threeDescription'), rating: 4.5, views: 12500, points: 350, duration: '20:00', imageSeed: 'egypt-pyramid-vr', isAdult: true },
    { id: 'content-4', title: t('mock.content.fourTitle'), provider: t('mock.content.academy'), description: t('mock.content.fourDescription'), rating: 4.6, views: 31000, points: 300, duration: '30:00', imageSeed: 'solar-system-vr' },
    { id: 'content-5', title: t('mock.content.fiveTitle'), provider: 'DeepSea_VR', description: t('mock.content.fiveDescription'), rating: 4.9, views: 58200, points: 450, duration: '35:00', imageSeed: 'mariana-trench' },
    { id: 'content-6', title: t('mock.content.sixTitle'), provider: t('mock.content.spaceProvider'), description: t('mock.content.sixDescription'), rating: 4.7, views: 27600, points: 500, duration: '15:00', imageSeed: 'iss-docking' },
  ]
}

export function getMockWallet(language: AppLanguage): Wallet {
  const t = translate(language)
  return {
    balance: 2350,
    currency: 'P',
    transactions: [
      { id: 'tx-1', label: t('mock.transactions.unlock'), amount: -400, createdAt: '2026-07-09T12:00:00+09:00' },
      { id: 'tx-2', label: t('mock.transactions.mission'), amount: 500, createdAt: '2026-07-07T12:00:00+09:00' },
    ],
  }
}

export const pointPackages: PointPackage[] = [
  { id: 'point-1000', points: 1000, price: 10000 },
  { id: 'point-3000', points: 3300, price: 30000, bonus: 300 },
  { id: 'point-5000', points: 5700, price: 50000, bonus: 700 },
]

export function getMockProfile(language: AppLanguage): UserProfile {
  return { id: 'user-demo', name: translate(language)('mock.profileName'), email: 'minsu@example.com', role: 'Explorer', joinedAt: '2025-11-18' }
}

export function getMockDevices(language: AppLanguage): Device[] {
  const t = translate(language)
  return [
    { id: 'vr-01', name: 'HMD Station 01', location: t('mock.locations.gangnam'), status: 'online', lastSync: t('mock.lastSeen.now') },
    { id: 'vr-02', name: 'HMD Station 02', location: t('mock.locations.gangnam'), status: 'warning', lastSync: t('mock.lastSeen.minutes') },
    { id: 'vr-03', name: 'HMD Station 03', location: t('mock.locations.seongsu'), status: 'offline', lastSync: t('mock.lastSeen.hours') },
  ]
}
