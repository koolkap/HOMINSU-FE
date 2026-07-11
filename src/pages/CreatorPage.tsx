import { BarChart3, Boxes, ChevronRight, CloudUpload, Film, LayoutGrid, Search, Settings2, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import ImageWithSkeleton from '../components/ImageWithSkeleton'
import { getMockCategories, getMockContentItems } from '../data/mockData'
import { useDisplayData } from '../hooks/useDisplayData'
import { appLanguage } from '../i18n'

export default function CreatorPage() {
  const { i18n, t } = useTranslation()
  const language = appLanguage(i18n.resolvedLanguage)
  const contentItems = useMemo(() => getMockContentItems(language), [language])
  const categories = useMemo(() => getMockCategories(language), [language])
  const { data: catalog, loading, isMock } = useDisplayData('content', contentItems)
  const { data: catalogCategories } = useDisplayData('catalog/categories', categories)

  return <div className="min-h-screen bg-[#050b18] text-blue-50">
    <header className="border-b border-blue-400/10 bg-[#071225]/90 px-4 py-4 backdrop-blur sm:px-7"><div className="mx-auto flex max-w-[1500px] items-center gap-4"><Link to="/creator" className="flex items-center gap-3 font-black tracking-tight"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500 shadow-[0_0_28px_rgba(59,130,246,.45)]"><Boxes size={19} /></span><span>VR <span className="text-blue-400">STUDIO</span></span></Link><label className="relative ml-auto hidden w-full max-w-md md:block"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300/40" size={17} /><input placeholder={t('creator.search')} className="w-full rounded-full border border-blue-300/10 bg-blue-950/50 py-2.5 pl-11 pr-4 text-sm outline-none focus:border-blue-400/50" /></label><button className="rounded-full bg-blue-500 px-4 py-2.5 text-xs font-extrabold text-white hover:bg-blue-400"><CloudUpload className="mr-2 inline" size={15} />{t('creator.newContent')}</button></div></header>
    <div className="mx-auto grid max-w-[1500px] lg:grid-cols-[220px_1fr]">
      <aside className="hidden min-h-[calc(100vh-74px)] border-r border-blue-400/10 p-5 lg:block"><p className="px-3 text-[10px] font-black tracking-[0.2em] text-blue-300/40">{t('creator.workspace').toUpperCase()}</p><nav className="mt-3 space-y-1 text-sm font-bold"><a className="flex items-center gap-3 rounded-xl bg-blue-500/15 px-3 py-3 text-blue-300"><LayoutGrid size={17} />{t('creator.catalog')}</a><a className="flex items-center gap-3 rounded-xl px-3 py-3 text-blue-200/55 hover:bg-blue-500/10"><Film size={17} />{t('creator.projects')}</a><a className="flex items-center gap-3 rounded-xl px-3 py-3 text-blue-200/55 hover:bg-blue-500/10"><BarChart3 size={17} />{t('creator.insights')}</a><a className="flex items-center gap-3 rounded-xl px-3 py-3 text-blue-200/55 hover:bg-blue-500/10"><Settings2 size={17} />{t('creator.settings')}</a></nav><div className="mt-12 rounded-2xl border border-blue-400/15 bg-gradient-to-br from-blue-500/20 to-cyan-400/5 p-4"><Sparkles className="text-cyan-300" size={20} /><p className="mt-3 text-sm font-extrabold">Creator Pro</p><p className="mt-1 text-xs leading-5 text-blue-200/50">{t('creator.proDescription')}</p></div></aside>
      <main className="min-w-0 px-4 py-7 sm:px-7 lg:py-10"><section className="relative overflow-hidden rounded-[2rem] border border-blue-300/10 bg-gradient-to-br from-blue-600/25 via-blue-950/20 to-cyan-400/5 p-7 sm:p-10"><div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-blue-400/20 blur-3xl" /><p className="text-xs font-black tracking-[0.2em] text-cyan-300">{t('creator.catalogEyebrow').toUpperCase()}</p><h1 className="relative mt-3 max-w-2xl text-3xl font-black leading-tight sm:text-5xl">{t('creator.headlineLine1')}<br />{t('creator.headlineLine2')}</h1><p className="relative mt-4 max-w-lg text-sm leading-6 text-blue-100/60">{t('creator.description')}</p></section>
        <div className="scroll-row mt-6 flex gap-2 overflow-x-auto">{catalogCategories.map((category, index) => <button key={category.id} className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold ${index === 0 ? 'bg-blue-500 text-white' : 'border border-blue-300/10 bg-blue-950/50 text-blue-100/60'}`}>{category.label}</button>)}</div>
        <div className="mb-4 mt-9 flex items-end justify-between"><div><p className="text-[10px] font-bold tracking-[0.18em] text-blue-400">{t('creator.explore').toUpperCase()}</p><h2 className="mt-1 text-xl font-black">{t('creator.projectCatalog')}</h2></div><span className="text-xs text-blue-200/40">{loading ? t('creator.syncing') : t('creator.projectCount', { count: catalog.length })}{isMock && ` · ${t('common.offlinePreview')}`}</span></div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">{catalog.map((item) => <Link key={item.id} to={`/content/${item.id}`} className="group overflow-hidden rounded-2xl border border-blue-300/10 bg-[#0a1730] transition hover:-translate-y-1 hover:border-blue-400/40"><ImageWithSkeleton seed={item.imageSeed} src={item.imageUrl} alt={item.title} rounded="rounded-none" className="aspect-[4/3]" /><div className="p-4"><p className="text-[10px] font-black text-cyan-400">{t('creator.readyToRemix').toUpperCase()}</p><h3 className="mt-1 line-clamp-1 text-sm font-extrabold">{item.title}</h3><div className="mt-3 flex items-center text-xs text-blue-200/40"><span>{item.provider}</span><ChevronRight className="ml-auto transition group-hover:translate-x-1" size={15} /></div></div></Link>)}</div>
      </main>
    </div>
  </div>
}
