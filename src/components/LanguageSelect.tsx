import { Languages } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { appLanguage, type AppLanguage } from '../i18n'

export default function LanguageSelect() {
  const { i18n, t } = useTranslation()
  const language = appLanguage(i18n.resolvedLanguage)

  return (
    <label className="ml-1 flex shrink-0 items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 text-mist-300 focus-within:border-white/30 focus-within:text-white">
      <Languages size={12} aria-hidden="true" />
      <span className="sr-only">{t('language.label')}</span>
      <select
        aria-label={t('language.label')}
        value={language}
        onChange={(event) => void i18n.changeLanguage(event.target.value as AppLanguage)}
        className="h-7 cursor-pointer appearance-none bg-transparent pr-1 text-[10px] font-bold tracking-normal text-inherit outline-none"
      >
        <option value="ko" className="bg-black text-white">{t('language.ko')}</option>
        <option value="en" className="bg-black text-white">{t('language.en')}</option>
      </select>
    </label>
  )
}
