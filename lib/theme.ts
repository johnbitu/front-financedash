export const THEME_VALUES = [
  'tema-bom',
  'dark',
  'green-dark',
  'light',
  'green-light',
] as const

export type ThemeValue = (typeof THEME_VALUES)[number]

export type ThemeLabel = 'TemaBom' | 'Dark' | 'Verde-Dark' | 'Light' | 'Verde-Light'

export type ThemeOption = {
  value: ThemeValue
  label: ThemeLabel
}

export const THEME_OPTIONS: ThemeOption[] = [
  { value: 'tema-bom', label: 'TemaBom' },
  { value: 'dark', label: 'Dark' },
  { value: 'green-dark', label: 'Verde-Dark' },
  { value: 'light', label: 'Light' },
  { value: 'green-light', label: 'Verde-Light' },
]

export const DEFAULT_THEME: ThemeValue = 'tema-bom'
