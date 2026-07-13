export type AppearancePreference = 'light' | 'dark' | 'system'
export type ColorSchemeId = 'berry' | 'ocean' | 'indigo' | 'forest'

export const colorSchemes: ReadonlyArray<{
  id: ColorSchemeId
  primary: string
  secondary: string
}> = [
  { id: 'berry', primary: '#e11d48', secondary: '#7c3aed' },
  { id: 'ocean', primary: '#2563eb', secondary: '#0f766e' },
  { id: 'indigo', primary: '#4f46e5', secondary: '#d97706' },
  { id: 'forest', primary: '#047857', secondary: '#0284c7' },
]

export const appearancePreferences: AppearancePreference[] = ['light', 'dark', 'system']

const APPEARANCE_KEY = 'homeinsu_appearance'
const COLOR_SCHEME_KEY = 'homeinsu_color_scheme'
const defaultAppearance: AppearancePreference = 'system'
const defaultColorScheme: ColorSchemeId = 'berry'

function isAppearance(value: string | null): value is AppearancePreference {
  return appearancePreferences.some((appearance) => appearance === value)
}

function isColorScheme(value: string | null): value is ColorSchemeId {
  return colorSchemes.some((scheme) => scheme.id === value)
}

export function readStoredTheme() {
  try {
    const appearance = localStorage.getItem(APPEARANCE_KEY)
    const colorScheme = localStorage.getItem(COLOR_SCHEME_KEY)
    return {
      appearance: isAppearance(appearance) ? appearance : defaultAppearance,
      colorScheme: isColorScheme(colorScheme) ? colorScheme : defaultColorScheme,
    }
  } catch {
    return { appearance: defaultAppearance, colorScheme: defaultColorScheme }
  }
}

export function writeStoredTheme(appearance: AppearancePreference, colorScheme: ColorSchemeId) {
  try {
    localStorage.setItem(APPEARANCE_KEY, appearance)
    localStorage.setItem(COLOR_SCHEME_KEY, colorScheme)
  } catch {
    // The selected theme still applies when storage is unavailable.
  }
}

export function applyTheme(appearance: AppearancePreference, colorScheme: ColorSchemeId) {
  const resolvedAppearance = appearance === 'system'
    ? (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark')
    : appearance
  const root = document.documentElement
  root.dataset.theme = resolvedAppearance
  root.dataset.appearance = appearance
  root.dataset.colorScheme = colorScheme
  root.style.colorScheme = resolvedAppearance

  document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
    ?.setAttribute('content', resolvedAppearance === 'light' ? '#f8fafc' : '#0a0a0d')
}

export function initializeTheme() {
  const theme = readStoredTheme()
  applyTheme(theme.appearance, theme.colorScheme)
}
