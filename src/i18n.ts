import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import ko from './locales/ko.json'

export type AppLanguage = 'ko' | 'en'

const STORAGE_KEY = 'homeinsu_locale'

function getInitialLanguage(): AppLanguage {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved === 'ko' || saved === 'en') return saved
  return (navigator.languages?.[0] || navigator.language).toLowerCase().startsWith('en') ? 'en' : 'ko'
}

export function appLanguage(language = i18n.resolvedLanguage || i18n.language): AppLanguage {
  return language.toLowerCase().startsWith('en') ? 'en' : 'ko'
}

export function intlLocale(language = i18n.resolvedLanguage || i18n.language) {
  return appLanguage(language) === 'en' ? 'en-US' : 'ko-KR'
}

function updateDocument(language: string) {
  const active = appLanguage(language)
  localStorage.setItem(STORAGE_KEY, active)
  document.documentElement.lang = active
  document.title = i18n.t('meta.title')
}

export const i18nReady = i18n.use(initReactI18next).init({
  resources: { ko: { translation: ko }, en: { translation: en } },
  lng: getInitialLanguage(),
  fallbackLng: 'ko',
  supportedLngs: ['ko', 'en'],
  interpolation: { escapeValue: false },
  initAsync: false,
})

i18n.on('languageChanged', updateDocument)
void i18nReady.then(() => updateDocument(i18n.language))

export default i18n
