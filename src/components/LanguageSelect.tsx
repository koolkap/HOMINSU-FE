import { Check, ChevronDown, Languages } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { appLanguage, type AppLanguage } from '../i18n'

const languages: AppLanguage[] = ['ko', 'en']

export default function LanguageSelect() {
  const { i18n, t } = useTranslation()
  const language = appLanguage(i18n.resolvedLanguage)
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('pointerdown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [open])

  const selectLanguage = async (nextLanguage: AppLanguage) => {
    await i18n.changeLanguage(nextLanguage)
    setOpen(false)
  }

  return (
    <div ref={rootRef} className="relative ml-1 shrink-0">
      <button
        type="button"
        aria-label={t('language.label')}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="language-control flex h-7 items-center gap-1 rounded-full border border-mist-100/10 bg-mist-100/5 px-2 text-[10px] font-bold tracking-normal text-mist-300 transition hover:border-mist-100/25 hover:text-mist-100"
      >
        <Languages size={12} aria-hidden="true" />
        <span>{t(`language.${language}`)}</span>
        <ChevronDown size={11} aria-hidden="true" className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div role="listbox" aria-label={t('language.label')} className="absolute right-0 top-[calc(100%+0.4rem)] z-[80] min-w-28 overflow-hidden rounded-xl border border-mist-100/15 bg-ink-950 p-1 shadow-card">
          {languages.map((item) => {
            const selected = item === language
            return <button
              key={item}
              type="button"
              role="option"
              aria-selected={selected}
              onClick={() => void selectLanguage(item)}
              className={`language-control flex w-full items-center rounded-lg px-2.5 py-2 text-left text-xs font-bold tracking-normal transition ${selected ? 'bg-mist-100/10 text-mist-100' : 'text-mist-400 hover:bg-mist-100/5 hover:text-mist-100'}`}
            >
              {t(`language.${item}`)}
              {selected && <Check size={13} className="ml-auto text-emerald-400" aria-hidden="true" />}
            </button>
          })}
        </div>
      )}
    </div>
  )
}
