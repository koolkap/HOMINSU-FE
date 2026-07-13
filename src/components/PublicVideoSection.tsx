import { Clapperboard, Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { ShowcaseMedia } from '../lib/api'

export default function PublicVideoSection({ items }: { items: ShowcaseMedia[] }) {
  const { t } = useTranslation()
  if (items.length === 0) return null

  return <section className="mx-auto max-w-[1600px] px-4 pb-8 pt-5 sm:px-6 lg:px-10" aria-labelledby="community-vr-title">
    <div className="relative overflow-hidden rounded-[2rem] border border-pulse/20 bg-gradient-to-br from-pulse/10 via-ink-900 to-ink-950 p-5 sm:p-8">
      <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-pulse/15 blur-3xl" />
      <div className="relative mb-5 flex items-end justify-between gap-4"><div><p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-pulse"><Sparkles size={13} />{t('showcase.eyebrow')}</p><h2 id="community-vr-title" className="mt-2 font-display text-2xl font-black text-mist-100 sm:text-3xl">{t('showcase.title')}</h2><p className="mt-2 max-w-2xl text-sm text-mist-300">{t('showcase.description')}</p></div><Clapperboard className="hidden text-pulse/50 sm:block" size={34} /></div>
      <div className="scroll-row relative flex gap-4 overflow-x-auto pb-2 lg:grid lg:grid-cols-3 lg:overflow-visible">{items.map((item) => <article key={item.id} className="w-[280px] shrink-0 overflow-hidden rounded-2xl border border-mist-100/10 bg-ink-950/40 lg:w-auto">
        <video src={item.url} controls playsInline preload="metadata" className="aspect-video w-full bg-black object-cover" />
        <div className="p-4"><p className="text-[10px] font-black uppercase tracking-[0.16em] text-pulse">{t('showcase.creatorUpload')}</p><h3 className="mt-1 truncate text-sm font-extrabold text-mist-100">{item.title}</h3></div>
      </article>)}</div>
    </div>
  </section>
}
