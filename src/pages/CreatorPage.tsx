import { BarChart3, Boxes, CheckCircle2, ChevronRight, CloudUpload, ExternalLink, FileVideo, Film, LayoutGrid, LoaderCircle, Search, Settings2, Sparkles } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import ImageWithSkeleton from '../components/ImageWithSkeleton'
import { getMockCategories, getMockContentItems } from '../data/mockData'
import { useDisplayData } from '../hooks/useDisplayData'
import { appLanguage } from '../i18n'
import { MAX_UPLOAD_BYTES, uploadStorageFile, type StorageUpload } from '../lib/api'

const ACCEPTED_MEDIA = 'image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime'

function formatFileSize(bytes: number) {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function CreatorPage() {
  const { i18n, t } = useTranslation()
  const { user } = useAuth()
  const language = appLanguage(i18n.resolvedLanguage)
  const contentItems = useMemo(() => getMockContentItems(language), [language])
  const categories = useMemo(() => getMockCategories(language), [language])
  const { data: catalog, loading, isMock } = useDisplayData('content', contentItems)
  const { data: catalogCategories } = useDisplayData('catalog/categories', categories)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const [upload, setUpload] = useState<StorageUpload | null>(null)

  const canUpload = user?.role === 'operator' || user?.role === 'admin'

  const openFilePicker = () => {
    if (!canUpload) {
      setError(t('creator.permission'))
      return
    }
    fileInputRef.current?.click()
  }

  const selectFile = (file: File | undefined) => {
    setUpload(null)
    setProgress(0)
    if (!file) return
    if (file.size > MAX_UPLOAD_BYTES) {
      setSelectedFile(null)
      setError(t('creator.tooLarge'))
      return
    }
    setError('')
    setSelectedFile(file)
  }

  const startUpload = async () => {
    if (!selectedFile || uploading) return
    setUploading(true)
    setError('')
    setUpload(null)
    setProgress(0)
    try {
      setUpload(await uploadStorageFile(selectedFile, setProgress))
      setSelectedFile(null)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : t('creator.failed'))
    } finally {
      setUploading(false)
    }
  }

  return <div className="min-h-screen bg-[#050b18] text-blue-50">
    <input
      ref={fileInputRef}
      type="file"
      accept={ACCEPTED_MEDIA}
      className="sr-only"
      onChange={(event) => {
        selectFile(event.target.files?.[0])
        event.target.value = ''
      }}
    />
    <header className="border-b border-blue-400/10 bg-[#071225]/90 px-4 py-4 backdrop-blur sm:px-7">
      <div className="mx-auto flex max-w-[1500px] items-center gap-4">
        <Link to="/creator" className="flex items-center gap-3 font-black tracking-tight"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500 shadow-[0_0_28px_rgba(59,130,246,.45)]"><Boxes size={19} /></span><span>VR <span className="text-blue-400">STUDIO</span></span></Link>
        <label className="relative ml-auto hidden w-full max-w-md md:block"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300/40" size={17} /><input placeholder={t('creator.search')} className="w-full rounded-full border border-blue-300/10 bg-blue-950/50 py-2.5 pl-11 pr-4 text-sm outline-none focus:border-blue-400/50" /></label>
        <button type="button" onClick={openFilePicker} disabled={uploading} className="rounded-full bg-blue-500 px-4 py-2.5 text-xs font-extrabold text-white hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-50"><CloudUpload className="mr-2 inline" size={15} />{t('creator.newContent')}</button>
      </div>
    </header>
    <div className="mx-auto grid max-w-[1500px] lg:grid-cols-[220px_1fr]">
      <aside className="hidden min-h-[calc(100vh-74px)] border-r border-blue-400/10 p-5 lg:block"><p className="px-3 text-[10px] font-black tracking-[0.2em] text-blue-300/40">{t('creator.workspace').toUpperCase()}</p><nav className="mt-3 space-y-1 text-sm font-bold"><a className="flex items-center gap-3 rounded-xl bg-blue-500/15 px-3 py-3 text-blue-300"><LayoutGrid size={17} />{t('creator.catalog')}</a><a className="flex items-center gap-3 rounded-xl px-3 py-3 text-blue-200/55 hover:bg-blue-500/10"><Film size={17} />{t('creator.projects')}</a><a className="flex items-center gap-3 rounded-xl px-3 py-3 text-blue-200/55 hover:bg-blue-500/10"><BarChart3 size={17} />{t('creator.insights')}</a><a className="flex items-center gap-3 rounded-xl px-3 py-3 text-blue-200/55 hover:bg-blue-500/10"><Settings2 size={17} />{t('creator.settings')}</a></nav><div className="mt-12 rounded-2xl border border-blue-400/15 bg-gradient-to-br from-blue-500/20 to-cyan-400/5 p-4"><Sparkles className="text-cyan-300" size={20} /><p className="mt-3 text-sm font-extrabold">Creator Pro</p><p className="mt-1 text-xs leading-5 text-blue-200/50">{t('creator.proDescription')}</p></div></aside>
      <main className="min-w-0 px-4 py-7 sm:px-7 lg:py-10">
        {(selectedFile || error || upload) && <section className="mb-6 overflow-hidden rounded-2xl border border-blue-300/15 bg-[#0a1730] p-5 shadow-[0_18px_70px_rgba(2,132,199,.08)]" aria-live="polite">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-500/15 text-cyan-300">{upload ? <CheckCircle2 size={23} /> : <FileVideo size={23} />}</div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-300">{upload ? t('creator.success') : t('creator.selected')}</p>
              <p className="mt-1 truncate text-sm font-extrabold">{upload?.original_name || selectedFile?.name}</p>
              <p className="mt-1 text-xs text-blue-200/45">{upload ? formatFileSize(upload.size) : selectedFile ? formatFileSize(selectedFile.size) : t('creator.maxSize')}</p>
            </div>
            {selectedFile && <button type="button" onClick={startUpload} disabled={uploading} className="rounded-xl bg-cyan-400 px-5 py-3 text-xs font-black text-blue-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60">{uploading ? <><LoaderCircle className="mr-2 inline animate-spin" size={15} />{t('creator.uploading', { progress })}</> : t('creator.uploadNow')}</button>}
            {upload && <a href={upload.url} target="_blank" rel="noreferrer" className="rounded-xl bg-cyan-400 px-5 py-3 text-center text-xs font-black text-blue-950 transition hover:bg-cyan-300">{t('creator.openFile')}<ExternalLink className="ml-2 inline" size={14} /></a>}
          </div>
          {uploading && <div className="mt-4 h-2 overflow-hidden rounded-full bg-blue-950" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-300 transition-[width]" style={{ width: `${progress}%` }} /></div>}
          {error && <p className="mt-4 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-200" role="alert">{error}</p>}
          {(upload || error) && !uploading && <button type="button" onClick={openFilePicker} className="mt-4 text-xs font-bold text-blue-300 underline decoration-blue-400/30 underline-offset-4 hover:text-cyan-300">{t('creator.chooseAnother')}</button>}
        </section>}
        <section className="relative overflow-hidden rounded-[2rem] border border-blue-300/10 bg-gradient-to-br from-blue-600/25 via-blue-950/20 to-cyan-400/5 p-7 sm:p-10"><div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-blue-400/20 blur-3xl" /><p className="text-xs font-black tracking-[0.2em] text-cyan-300">{t('creator.catalogEyebrow').toUpperCase()}</p><h1 className="relative mt-3 max-w-2xl text-3xl font-black leading-tight sm:text-5xl">{t('creator.headlineLine1')}<br />{t('creator.headlineLine2')}</h1><p className="relative mt-4 max-w-lg text-sm leading-6 text-blue-100/60">{t('creator.description')}</p><button type="button" onClick={openFilePicker} className="relative mt-6 rounded-full border border-cyan-300/30 bg-cyan-300/10 px-5 py-3 text-xs font-black text-cyan-200 transition hover:bg-cyan-300/20"><CloudUpload className="mr-2 inline" size={16} />{t('creator.uploadFile')}</button><p className="relative mt-3 text-[11px] text-blue-200/40">{t('creator.maxSize')}</p></section>
        <div className="scroll-row mt-6 flex gap-2 overflow-x-auto">{catalogCategories.map((category, index) => <button key={category.id} className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold ${index === 0 ? 'bg-blue-500 text-white' : 'border border-blue-300/10 bg-blue-950/50 text-blue-100/60'}`}>{category.label}</button>)}</div>
        <div className="mb-4 mt-9 flex items-end justify-between"><div><p className="text-[10px] font-bold tracking-[0.18em] text-blue-400">{t('creator.explore').toUpperCase()}</p><h2 className="mt-1 text-xl font-black">{t('creator.projectCatalog')}</h2></div><span className="text-xs text-blue-200/40">{loading ? t('creator.syncing') : t('creator.projectCount', { count: catalog.length })}{isMock && ` · ${t('common.offlinePreview')}`}</span></div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">{catalog.map((item) => <Link key={item.id} to={`/content/${item.id}`} className="group overflow-hidden rounded-2xl border border-blue-300/10 bg-[#0a1730] transition hover:-translate-y-1 hover:border-blue-400/40"><ImageWithSkeleton seed={item.imageSeed} src={item.imageUrl} alt={item.title} rounded="rounded-none" className="aspect-[4/3]" /><div className="p-4"><p className="text-[10px] font-black text-cyan-400">{t('creator.readyToRemix').toUpperCase()}</p><h3 className="mt-1 line-clamp-1 text-sm font-extrabold">{item.title}</h3><div className="mt-3 flex items-center text-xs text-blue-200/40"><span>{item.provider}</span><ChevronRight className="ml-auto transition group-hover:translate-x-1" size={15} /></div></div></Link>)}</div>
      </main>
    </div>
  </div>
}
