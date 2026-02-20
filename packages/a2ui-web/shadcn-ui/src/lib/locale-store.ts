import type { StoreApi } from 'zustand'
import { createStore } from 'zustand'
import type { Locale } from './i18n'
import { translations } from './i18n'

export type LocaleState = {
  locale: Locale
  t: (typeof translations)['en']
  setLocale: (locale: Locale) => void
}

export const createLocaleStore = (
  initialLocale: Locale = 'en',
  overrideTranslations?: (typeof translations)[Locale],
): StoreApi<LocaleState> =>
  createStore<LocaleState>((set) => ({
    locale: initialLocale,
    t: overrideTranslations ?? translations[initialLocale] ?? translations.en,
    setLocale: (locale: Locale) =>
      set({
        locale,
        t: overrideTranslations ?? translations[locale] ?? translations.en,
      }),
  }))
