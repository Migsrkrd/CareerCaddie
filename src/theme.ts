import type { ColorSchemePreference } from './types'

/** Legacy key — matches STORAGE_KEYS.settings in App.tsx */
const SETTINGS_STORAGE_KEY = 'hirehunter.settings'

export function resolveEffectiveTheme(
  preference: ColorSchemePreference,
): 'light' | 'dark' {
  if (preference === 'light' || preference === 'dark') {
    return preference
  }
  if (typeof window === 'undefined') {
    return 'light'
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function applyThemeToDocument(effective: 'light' | 'dark'): void {
  document.documentElement.setAttribute('data-theme', effective)
}

export function readStoredColorSchemePreference(): ColorSchemePreference {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY)
    if (!raw) {
      return 'system'
    }
    const parsed = JSON.parse(raw) as { colorScheme?: ColorSchemePreference }
    if (
      parsed.colorScheme === 'light' ||
      parsed.colorScheme === 'dark' ||
      parsed.colorScheme === 'system'
    ) {
      return parsed.colorScheme
    }
  } catch {
    /* ignore */
  }
  return 'system'
}

/** Call before React render to reduce theme flash on load. */
export function bootstrapThemeFromStorage(): void {
  const pref = readStoredColorSchemePreference()
  applyThemeToDocument(resolveEffectiveTheme(pref))
}
