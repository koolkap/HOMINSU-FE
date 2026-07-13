import { Check, Monitor, Moon, Palette, Sun, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  appearancePreferences,
  applyTheme,
  colorSchemes,
  readStoredTheme,
  type AppearancePreference,
  type ColorSchemeId,
  writeStoredTheme,
} from '../theme'

const appearanceIcons = {
  light: Sun,
  dark: Moon,
  system: Monitor,
}

export default function ColorThemeSelector() {
  const { t } = useTranslation()
  const initialTheme = useRef(readStoredTheme()).current
  const [open, setOpen] = useState(false)
  const [appearance, setAppearance] = useState<AppearancePreference>(initialTheme.appearance)
  const [colorScheme, setColorScheme] = useState<ColorSchemeId>(initialTheme.colorScheme)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    applyTheme(appearance, colorScheme)
    writeStoredTheme(appearance, colorScheme)

    if (appearance !== 'system') return
    const mediaQuery = window.matchMedia('(prefers-color-scheme: light)')
    const syncSystemAppearance = () => applyTheme(appearance, colorScheme)
    mediaQuery.addEventListener('change', syncSystemAppearance)
    return () => mediaQuery.removeEventListener('change', syncSystemAppearance)
  }, [appearance, colorScheme])

  useEffect(() => {
    const syncStoredTheme = () => {
      const storedTheme = readStoredTheme()
      setAppearance(storedTheme.appearance)
      setColorScheme(storedTheme.colorScheme)
    }
    window.addEventListener('storage', syncStoredTheme)
    return () => window.removeEventListener('storage', syncStoredTheme)
  }, [])

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

  return <div ref={rootRef} className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] left-3 z-[55] md:bottom-auto md:left-4 md:top-1/2 md:-translate-y-1/2">
    <button
      type="button"
      aria-label={t('theme.open')}
      aria-expanded={open}
      aria-controls="color-theme-panel"
      onClick={() => setOpen((current) => !current)}
      className="flex h-11 w-11 items-center justify-center rounded-full border border-mist-100/15 bg-ink-900/95 text-signal shadow-card backdrop-blur transition hover:scale-105 hover:border-signal/40"
    >
      <Palette size={19} aria-hidden="true" />
    </button>

    {open && <section
      id="color-theme-panel"
      role="dialog"
      aria-labelledby="color-theme-title"
      className="absolute bottom-0 left-[calc(100%+0.5rem)] w-[min(19rem,calc(100vw-4.75rem))] overflow-hidden rounded-3xl border border-mist-100/15 bg-ink-900/95 text-mist-100 shadow-card backdrop-blur-xl md:bottom-auto md:top-1/2 md:-translate-y-1/2"
    >
      <div className="flex items-start gap-4 border-b border-mist-100/10 px-5 py-4">
        <div>
          <h2 id="color-theme-title" className="font-display text-base font-extrabold">{t('theme.title')}</h2>
          <p className="mt-1 text-xs leading-5 text-mist-500">{t('theme.description')}</p>
        </div>
        <button type="button" aria-label={t('theme.close')} onClick={() => setOpen(false)} className="ml-auto rounded-full p-1.5 text-mist-500 transition hover:bg-mist-100/10 hover:text-mist-100">
          <X size={16} aria-hidden="true" />
        </button>
      </div>

      <div className="p-4">
        <p className="mb-2 px-1 text-[10px] font-black uppercase tracking-[0.18em] text-mist-500">{t('theme.appearance')}</p>
        <div className="grid grid-cols-3 gap-1 rounded-2xl bg-ink-800 p-1" role="group" aria-label={t('theme.appearance')}>
          {appearancePreferences.map((option) => {
            const Icon = appearanceIcons[option]
            const selected = appearance === option
            return <button
              key={option}
              type="button"
              aria-pressed={selected}
              onClick={() => setAppearance(option)}
              className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl px-2 text-[10px] font-bold transition ${selected ? 'bg-ink-900 text-signal shadow-sm' : 'text-mist-500 hover:text-mist-100'}`}
            >
              <Icon size={15} aria-hidden="true" />
              {t(`theme.${option}`)}
            </button>
          })}
        </div>

        <p className="mb-2 mt-5 px-1 text-[10px] font-black uppercase tracking-[0.18em] text-mist-500">{t('theme.combinations')}</p>
        <div className="grid gap-2" role="radiogroup" aria-label={t('theme.combinations')}>
          {colorSchemes.map((scheme) => {
            const selected = colorScheme === scheme.id
            return <button
              key={scheme.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => setColorScheme(scheme.id)}
              className={`flex items-center gap-3 rounded-2xl border px-3 py-3 text-left transition ${selected ? 'border-signal/45 bg-signal/10' : 'border-mist-100/10 bg-ink-850 hover:border-mist-100/20'}`}
            >
              <span className="relative h-9 w-12 shrink-0" aria-hidden="true">
                <span className="absolute left-0 top-0 h-9 w-9 rounded-full border-2 border-ink-850" style={{ backgroundColor: scheme.primary }} />
                <span className="absolute right-0 top-0 h-9 w-9 rounded-full border-2 border-ink-850" style={{ backgroundColor: scheme.secondary }} />
              </span>
              <span className="min-w-0">
                <span className="block text-xs font-extrabold">{t(`theme.schemes.${scheme.id}.name`)}</span>
                <span className="mt-0.5 block truncate text-[10px] text-mist-500">{t(`theme.schemes.${scheme.id}.description`)}</span>
              </span>
              {selected && <span className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-signal text-white"><Check size={13} strokeWidth={3} aria-hidden="true" /></span>}
            </button>
          })}
        </div>
      </div>
    </section>}
  </div>
}
