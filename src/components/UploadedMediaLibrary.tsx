import { ExternalLink, Film, Image as ImageIcon, LoaderCircle, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { intlLocale } from '../i18n'
import type { StorageUpload } from '../lib/api'

type Props = {
  items: StorageUpload[]
  loading: boolean
  error: string
  deletingId: number | null
  onRetry: () => void
  onDelete: (id: number) => void
}

function fileSize(bytes: number) {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function UploadedMediaLibrary({ items, loading, error, deletingId, onRetry, onDelete }: Props) {
  const { i18n, t } = useTranslation()
  const [confirmId, setConfirmId] = useState<number | null>(null)
  const dateFormat = new Intl.DateTimeFormat(intlLocale(i18n.resolvedLanguage), { dateStyle: 'medium' })

  return <section className="my-8" aria-labelledby="uploaded-media-title">
    <div className="mb-4 flex items-end justify-between gap-4">
      <div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-pulse">{t('creator.myLibrary')}</p><h2 id="uploaded-media-title" className="mt-1 text-xl font-black">{t('creator.uploadedMedia')}</h2></div>
      <span className="text-xs text-mist-500">{t('creator.uploadCount', { count: items.length })}</span>
    </div>
    {loading && <div className="flex min-h-32 items-center justify-center rounded-2xl border border-mist-100/10 bg-ink-900 text-sm text-mist-500"><LoaderCircle className="mr-2 animate-spin" size={17} />{t('creator.libraryLoading')}</div>}
    {!loading && error && <div className="rounded-2xl border border-red-400/20 bg-red-500/10 p-5 text-sm text-red-200" role="alert"><p>{error}</p><button type="button" onClick={onRetry} className="mt-3 font-black underline underline-offset-4">{t('creator.retry')}</button></div>}
    {!loading && !error && items.length === 0 && <div className="rounded-2xl border border-dashed border-mist-100/20 bg-ink-900 p-8 text-center"><Film className="mx-auto text-mist-500" /><p className="mt-3 text-sm font-bold text-mist-300">{t('creator.libraryEmpty')}</p></div>}
    {!loading && !error && items.length > 0 && <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{items.map((item) => <article key={item.id} className="overflow-hidden rounded-2xl border border-mist-100/10 bg-ink-900">
      <div className="aspect-video bg-black">{item.media_kind === 'video' ? <video src={item.url} controls playsInline preload="metadata" className="h-full w-full object-cover" /> : <img src={item.url} alt={item.title} loading="lazy" className="h-full w-full object-cover" />}</div>
      <div className="p-4">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider"><span className="inline-flex items-center gap-1 text-pulse">{item.media_kind === 'video' ? <Film size={12} /> : <ImageIcon size={12} />}{t(`creator.${item.media_kind}`)}</span>{item.is_showcase_ready && <span className="rounded-full bg-emerald-400/10 px-2 py-1 text-emerald-500">{t('creator.onMemberHome')}</span>}</div>
        <h3 className="mt-2 truncate text-sm font-extrabold" title={item.original_name}>{item.title}</h3>
        <p className="mt-1 text-xs text-mist-500">{fileSize(item.size_bytes)} · {dateFormat.format(new Date(item.created_at))}</p>
        <div className="mt-4 flex items-center gap-2"><a href={item.url} target="_blank" rel="noreferrer" className="rounded-lg border border-mist-100/15 px-3 py-2 text-xs font-bold text-mist-300 hover:border-signal/40 hover:text-signal"><ExternalLink className="mr-1 inline" size={13} />{t('creator.openMedia')}</a>{confirmId === item.id ? <><button type="button" disabled={deletingId === item.id} onClick={() => onDelete(item.id)} className="ml-auto rounded-lg bg-red-500 px-3 py-2 text-xs font-black text-white disabled:opacity-50">{deletingId === item.id ? t('creator.deleting') : t('creator.confirmDelete')}</button><button type="button" onClick={() => setConfirmId(null)} className="rounded-lg px-2 py-2 text-xs text-mist-500">{t('creator.cancelDelete')}</button></> : <button type="button" onClick={() => setConfirmId(item.id)} className="ml-auto rounded-lg p-2 text-mist-500 hover:bg-red-500/10 hover:text-red-500" aria-label={t('creator.delete')}><Trash2 size={16} /></button>}</div>
      </div>
    </article>)}</div>}
  </section>
}
