import { useMemo, useState } from 'react'
import { ChevronLeft, Eye, LockKeyhole, Play, Radio, Sparkles, Volume2 } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
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
import { contentItems, categories as mockCategories, liveItems } from '../data/mockData'
import { useDisplayData } from '../hooks/useDisplayData'
import { unlockContent } from '../lib/api'
import type { ContentItem } from '../types'

export function HomePage({ onLogin }: { onLogin: () => void }) {
  const [activeCategory, setActiveCategory] = useState('all')
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
  return <header className="sticky top-0 z-30 border-b border-white/5 bg-ink-950/90 px-4 py-4 backdrop-blur-md sm:px-6">
    <div className="mx-auto flex max-w-6xl items-center gap-3">
      <Link to="/" aria-label="홈으로" className="rounded-full bg-white/5 p-2 text-mist-300 hover:text-white"><ChevronLeft size={20} /></Link>
      <h1 className="font-display text-lg font-extrabold text-white">{title}</h1>
      <Link to="/profile" className="ml-auto text-xs font-bold text-mist-300 hover:text-white">MY</Link>
    </div>
  </header>
}

export function LivePage() {
  const { data: live, loading, isMock } = useDisplayData('live', liveItems)
  return <div className="min-h-screen bg-ink-950 pb-24 text-mist-100">
    <ConsumerHeader title="라이브" />
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <div className="mb-6 overflow-hidden rounded-3xl border border-signal/20 bg-gradient-to-br from-signal/25 via-ink-900 to-ink-950 p-6 sm:p-9">
        <div className="flex items-center gap-2 text-xs font-extrabold tracking-[0.2em] text-signal"><Radio size={15} /> LIVE NOW</div>
        <h2 className="mt-3 max-w-xl text-2xl font-extrabold text-white sm:text-4xl">지금 이 순간을<br />360°로 만나보세요.</h2>
        <p className="mt-3 text-sm text-mist-300">{loading ? '라이브 채널을 불러오는 중...' : `${live.length}개 채널이 방송 중입니다.`}{isMock && ' · 오프라인 미리보기'}</p>
      </div>
      <div className="grid grid-cols-1 gap-x-5 gap-y-7 sm:grid-cols-2 lg:grid-cols-3">
        {live.map((item) => <LiveCard key={item.id} item={item} />)}
      </div>
    </main>
    <BottomNav />
  </div>
}

export function ShortsPage() {
  const { data: items } = useDisplayData('content', contentItems)
  return <div className="min-h-screen bg-black pb-20 text-white md:pb-0">
    <div className="scroll-row h-[calc(100vh-2.25rem)] snap-y snap-mandatory overflow-y-auto">
      {items.slice(0, 5).map((item, index) => <section key={item.id} className="relative mx-auto h-full max-w-md snap-start overflow-hidden bg-ink-900 md:my-4 md:h-[calc(100vh-4.25rem)] md:rounded-[2rem]">
        <ImageWithSkeleton seed={`${item.imageSeed}-vertical`} src={item.imageUrl} alt={item.title} width={720} height={1280} rounded="rounded-none" className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/35" />
        <div className="absolute left-4 right-4 top-4 flex items-center justify-between"><Link to="/" className="rounded-full bg-black/35 p-2 backdrop-blur"><ChevronLeft /></Link><span className="text-sm font-black tracking-[0.2em]">SHORTS</span><span className="rounded-full bg-signal px-2 py-1 text-[10px] font-bold">{index + 1}/{Math.min(items.length, 5)}</span></div>
        <div className="absolute bottom-8 left-5 right-16"><p className="text-xs font-bold text-signal">@{item.provider}</p><h2 className="mt-2 text-xl font-extrabold">{item.title}</h2><Link to={`/content/${item.id}`} className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-extrabold text-black"><Play size={14} fill="currentColor" /> 전체 보기</Link></div>
        <div className="absolute bottom-10 right-4 flex flex-col items-center gap-5 text-xs"><Volume2 /><div className="flex flex-col items-center"><Eye /><span className="mt-1">{item.views}</span></div><Sparkles /></div>
      </section>)}
    </div>
    <BottomNav />
  </div>
}

export function ContentDetailPage() {
  const { id = '' } = useParams()
  const fallback = useMemo<ContentItem>(() => contentItems.find((item) => item.id === id) || { ...contentItems[0], id, title: 'VR 콘텐츠 미리보기' }, [id])
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
      setError(reason instanceof Error ? reason.message : '잠금 해제에 실패했습니다.')
    } finally {
      setPending(null)
    }
  }

  return <div className="min-h-screen bg-ink-950 pb-20 text-mist-100">
    <ConsumerHeader title="콘텐츠 상세" />
    <main className="mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-8">
      <div className="relative aspect-video overflow-hidden rounded-2xl bg-black sm:rounded-[2rem]">
        <ImageWithSkeleton seed={item.imageSeed} src={item.imageUrl} alt={item.title} width={1280} height={720} rounded="rounded-none" className="absolute inset-0 h-full w-full opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center">
          {unlocked ? <button className="flex h-16 w-16 items-center justify-center rounded-full bg-signal shadow-glow"><Play className="ml-1" fill="currentColor" /></button> : <div className="text-center"><span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-black/45 backdrop-blur"><LockKeyhole /></span><p className="mt-3 text-sm font-bold">미리보기 종료 · 잠금 해제 후 계속</p></div>}
        </div>
        <span className="absolute bottom-4 left-4 rounded bg-black/50 px-2 py-1 text-xs">PREVIEW 00:30</span>
      </div>
      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_340px]">
        <div><div className="flex gap-2 text-xs font-bold text-signal"><span>8K VR</span><span>·</span><span>{item.duration}</span>{isMock && <span>· OFFLINE PREVIEW</span>}</div><h1 className="mt-2 text-2xl font-extrabold text-white sm:text-4xl">{loading ? '불러오는 중...' : item.title}</h1><p className="mt-2 text-sm text-mist-300">{item.provider} · 평점 {item.rating} · 조회 {item.views.toLocaleString()}</p><p className="mt-6 max-w-2xl leading-7 text-mist-300">{item.description || '현장감 넘치는 공간 음향과 고화질 360° 영상으로 새로운 세계를 탐험해 보세요. VR 헤드셋과 모바일 모드를 모두 지원합니다.'}</p></div>
        {!unlocked && <aside className="rounded-3xl border border-white/10 bg-ink-900 p-5"><p className="text-xs font-bold text-mist-500">이 콘텐츠 잠금 해제</p><p className="mt-2 text-3xl font-black text-white">{item.points}P</p><div className="mt-5 space-y-2"><button disabled={pending !== null} onClick={() => handleUnlock('points')} className="w-full rounded-xl bg-signal py-3 text-sm font-extrabold disabled:opacity-50">{pending === 'points' ? '처리 중...' : '포인트로 시청'}</button><button disabled={pending !== null} onClick={() => handleUnlock('ad')} className="w-full rounded-xl border border-white/15 bg-white/5 py-3 text-sm font-bold disabled:opacity-50">{pending === 'ad' ? '광고 확인 중...' : '광고 보고 계속 시청'}</button><button disabled={pending !== null} onClick={() => handleUnlock('cash')} className="w-full rounded-xl border border-white/15 bg-white/5 py-3 text-sm font-bold disabled:opacity-50">{pending === 'cash' ? '결제 처리 중...' : '현금 결제'}</button></div>{error && <p role="alert" className="mt-3 rounded-lg bg-signal/10 p-3 text-xs text-red-300">{error}</p>}<Link to="/points" className="mt-4 block text-center text-xs font-bold text-mist-500 hover:text-white">포인트 충전하기</Link></aside>}
        {unlocked && <aside className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-5 text-sm font-bold text-emerald-300">잠금 해제 완료. 플레이 버튼을 눌러 시청하세요.</aside>}
      </div>
      <section className="mt-12"><h2 className="mb-4 text-lg font-extrabold">함께 보면 좋은 콘텐츠</h2><div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">{contentItems.slice(1, 5).map((content) => <ContentCard key={content.id} item={content} />)}</div></section>
    </main>
    <BottomNav />
  </div>
}
