import { useMemo, useState } from 'react'
import { ChevronLeft, Eye, LockKeyhole, Play, Radio, Sparkles, Volume2 } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import BottomNav from '../components/BottomNav'
import CategoryTabs from '../components/CategoryTabs'
import ContentCard from '../components/ContentCard'
import ContentGrid from '../components/ContentGrid'
import Hero from '../components/Hero'
import ImageWithSkeleton from '../components/ImageWithSkeleton'
import LiveCard from '../components/LiveCard'
import LiveSection from '../components/LiveSection'
import PromoBanner from '../components/PromoBanner'
import TopBar from '../components/TopBar'
import { getMockCategories, getMockContentItems, getMockLiveItems } from '../data/mockData'
import { useDisplayData } from '../hooks/useDisplayData'
import { unlockContent } from '../lib/api'
import type { ContentItem } from '../types'
import { appLanguage, intlLocale } from '../i18n'

export function HomePage({ onLogin }: { onLogin: () => void }) {
  const { i18n } = useTranslation()
  const language = appLanguage(i18n.resolvedLanguage)
  const [activeCategory, setActiveCategory] = useState('all')
  const mockCategories = useMemo(() => getMockCategories(language), [language])
  const contentItems = useMemo(() => getMockContentItems(language), [language])
  const liveItems = useMemo(() => getMockLiveItems(language), [language])
  const { data: categories } = useDisplayData('catalog/categories', mockCategories)
  const { data: content } = useDisplayData('content', contentItems)
  const { data: live } = useDisplayData('live', liveItems)

  return <div className="min-h-screen bg-ink-950 text-mist-100">
    <TopBar onLoginClick={onLogin} />
    <main>
      <Hero />
      <PromoBanner />
      <CategoryTabs active={activeCategory} onChange={setActiveCategory} categories={categories} />
      <LiveSection items={live} />
      <ContentGrid items={content} />
    </main>
    <BottomNav />
  </div>
}

function ConsumerHeader({ title }: { title: string }) {
  const { t } = useTranslation()
  return <header className="sticky top-0 z-30 border-b border-white/5 bg-ink-950/90 px-4 py-4 backdrop-blur-md sm:px-6">
    <div className="mx-auto flex max-w-6xl items-center gap-3">
      <Link to="/" aria-label={t('common.backHome')} className="rounded-full bg-white/5 p-2 text-mist-300 hover:text-white"><ChevronLeft size={20} /></Link>
      <h1 className="font-display text-lg font-extrabold text-white">{title}</h1>
      <Link to="/profile" className="ml-auto text-xs font-bold text-mist-300 hover:text-white">MY</Link>
    </div>
  </header>
}

export function LivePage() {
  const { i18n, t } = useTranslation()
  const language = appLanguage(i18n.resolvedLanguage)
  const liveItems = useMemo(() => getMockLiveItems(language), [language])
  const { data: live, loading, isMock } = useDisplayData('live', liveItems)
  return <div className="min-h-screen bg-ink-950 pb-24 text-mist-100">
    <ConsumerHeader title={t('livePage.title')} />
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <div className="mb-6 overflow-hidden rounded-3xl border border-signal/20 bg-gradient-to-br from-signal/25 via-ink-900 to-ink-950 p-6 sm:p-9">
        <div className="flex items-center gap-2 text-xs font-extrabold tracking-[0.2em] text-signal"><Radio size={15} /> {t('catalog.liveNow').toUpperCase()}</div>
        <h2 className="mt-3 max-w-xl text-2xl font-extrabold text-white sm:text-4xl">{t('livePage.headlineLine1')}<br />{t('livePage.headlineLine2')}</h2>
        <p className="mt-3 text-sm text-mist-300">{loading ? t('livePage.loading') : t('common.channelCount', { count: live.length })}{isMock && ` · ${t('common.offlinePreview')}`}</p>
      </div>
      <div className="grid grid-cols-1 gap-x-5 gap-y-7 sm:grid-cols-2 lg:grid-cols-3">
        {live.map((item) => <LiveCard key={item.id} item={item} />)}
      </div>
    </main>
    <BottomNav />
  </div>
}

export function ShortsPage() {
  const { i18n, t } = useTranslation()
  const language = appLanguage(i18n.resolvedLanguage)
  const contentItems = useMemo(() => getMockContentItems(language), [language])
  const { data: items } = useDisplayData('content', contentItems)
  const numberFormat = new Intl.NumberFormat(intlLocale(language), { notation: 'compact', maximumFractionDigits: 1 })
  return <div className="min-h-screen bg-black pb-20 text-white md:pb-0">
    <div className="scroll-row h-[calc(100vh-2.25rem)] snap-y snap-mandatory overflow-y-auto">
      {items.slice(0, 5).map((item, index) => <section key={item.id} className="relative mx-auto h-full max-w-md snap-start overflow-hidden bg-ink-900 md:my-4 md:h-[calc(100vh-4.25rem)] md:rounded-[2rem]">
        <ImageWithSkeleton seed={`${item.imageSeed}-vertical`} src={item.imageUrl} alt={item.title} width={720} height={1280} rounded="rounded-none" className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/35" />
        <div className="absolute left-4 right-4 top-4 flex items-center justify-between"><Link to="/" aria-label={t('shorts.back')} className="rounded-full bg-black/35 p-2 backdrop-blur"><ChevronLeft /></Link><span className="text-sm font-black tracking-[0.2em]">SHORTS</span><span className="rounded-full bg-signal px-2 py-1 text-[10px] font-bold">{index + 1}/{Math.min(items.length, 5)}</span></div>
        <div className="absolute bottom-8 left-5 right-16"><p className="text-xs font-bold text-signal">@{item.provider}</p><h2 className="mt-2 text-xl font-extrabold">{item.title}</h2><Link to={`/content/${item.id}`} className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-extrabold text-black"><Play size={14} fill="currentColor" /> {t('shorts.viewFull')}</Link></div>
        <div className="absolute bottom-10 right-4 flex flex-col items-center gap-5 text-xs"><Volume2 /><div className="flex flex-col items-center"><Eye /><span className="mt-1">{numberFormat.format(item.views)}</span></div><Sparkles /></div>
      </section>)}
    </div>
    <BottomNav />
  </div>
}

export function ContentDetailPage() {
  const { i18n, t } = useTranslation()
  const language = appLanguage(i18n.resolvedLanguage)
  const contentItems = useMemo(() => getMockContentItems(language), [language])
  const locale = intlLocale(language)
  const { id = '' } = useParams()
  const fallback = useMemo<ContentItem>(() => contentItems.find((item) => item.id === id) || { ...contentItems[0], id, title: t('detail.fallbackTitle') }, [contentItems, id, t])
  const { data: item, loading, isMock } = useDisplayData(`content/${encodeURIComponent(id)}`, fallback)
  const [unlocked, setUnlocked] = useState(Boolean(item.unlocked))
  const [pending, setPending] = useState<string | null>(null)
  const [error, setError] = useState('')

  const handleUnlock = async (method: string) => {
    setPending(method)
    setError('')
    try {
      await unlockContent(id, method)
      setUnlocked(true)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : t('detail.unlockFailed'))
    } finally {
      setPending(null)
    }
  }

  return <div className="min-h-screen bg-ink-950 pb-20 text-mist-100">
    <ConsumerHeader title={t('detail.title')} />
    <main className="mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-8">
      <div className="relative aspect-video overflow-hidden rounded-2xl bg-black sm:rounded-[2rem]">
        <ImageWithSkeleton seed={item.imageSeed} src={item.imageUrl} alt={item.title} width={1280} height={720} rounded="rounded-none" className="absolute inset-0 h-full w-full opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center">
          {unlocked ? <button aria-label={t('detail.play')} className="flex h-16 w-16 items-center justify-center rounded-full bg-signal shadow-glow"><Play className="ml-1" fill="currentColor" /></button> : <div className="text-center"><span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-black/45 backdrop-blur"><LockKeyhole /></span><p className="mt-3 text-sm font-bold">{t('detail.previewEnded')}</p></div>}
        </div>
        <span className="absolute bottom-4 left-4 rounded bg-black/50 px-2 py-1 text-xs">{t('detail.preview').toUpperCase()} 00:30</span>
      </div>
      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_340px]">
        <div><div className="flex gap-2 text-xs font-bold text-signal"><span>8K VR</span><span>·</span><span>{item.duration}</span>{isMock && <span>· {t('common.offlinePreview').toUpperCase()}</span>}</div><h1 className="mt-2 text-2xl font-extrabold text-white sm:text-4xl">{loading ? t('common.loading') : item.title}</h1><p className="mt-2 text-sm text-mist-300">{item.provider} · {t('common.rating', { rating: new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(item.rating) })} · {t('common.views', { count: new Intl.NumberFormat(locale).format(item.views) })}</p><p className="mt-6 max-w-2xl leading-7 text-mist-300">{item.description || t('detail.defaultDescription')}</p></div>
        {!unlocked && <aside className="rounded-3xl border border-white/10 bg-ink-900 p-5"><p className="text-xs font-bold text-mist-500">{t('detail.unlock')}</p><p className="mt-2 text-3xl font-black text-white">{new Intl.NumberFormat(locale).format(item.points)}P</p><div className="mt-5 space-y-2"><button disabled={pending !== null} onClick={() => handleUnlock('points')} className="w-full rounded-xl bg-signal py-3 text-sm font-extrabold disabled:opacity-50">{pending === 'points' ? t('common.processing') : t('detail.watchPoints')}</button><button disabled={pending !== null} onClick={() => handleUnlock('ad')} className="w-full rounded-xl border border-white/15 bg-white/5 py-3 text-sm font-bold disabled:opacity-50">{pending === 'ad' ? t('detail.checkingAd') : t('detail.watchAd')}</button><button disabled={pending !== null} onClick={() => handleUnlock('cash')} className="w-full rounded-xl border border-white/15 bg-white/5 py-3 text-sm font-bold disabled:opacity-50">{pending === 'cash' ? t('detail.paying') : t('detail.cash')}</button></div>{error && <p role="alert" className="mt-3 rounded-lg bg-signal/10 p-3 text-xs text-red-300">{error}</p>}<Link to="/points" className="mt-4 block text-center text-xs font-bold text-mist-500 hover:text-white">{t('detail.topup')}</Link></aside>}
        {unlocked && <aside className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-5 text-sm font-bold text-emerald-300">{t('detail.unlocked')}</aside>}
      </div>
      <section className="mt-12"><h2 className="mb-4 text-lg font-extrabold">{t('detail.recommended')}</h2><div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">{contentItems.slice(1, 5).map((content) => <ContentCard key={content.id} item={content} />)}</div></section>
    </main>
    <BottomNav />
  </div>
}
