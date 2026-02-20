'use client'

import { createContext, useContext, useRef, type ReactNode } from 'react'
import { useStore } from 'zustand'
import type { StoreApi } from 'zustand'
import type { Locale } from './i18n'
import { createLocaleStore, type LocaleState } from './locale-store'

const LocaleStoreContext = createContext<StoreApi<LocaleState> | null>(null)

type LocaleProviderProps = {
  initialLocale?: Locale
  children: ReactNode
}

export function LocaleProvider({ initialLocale = 'en', children }: LocaleProviderProps) {
  const storeRef = useRef<StoreApi<LocaleState> | null>(null)
  if (!storeRef.current) {
    storeRef.current = createLocaleStore(initialLocale)
  }
  const store = storeRef.current
  return <LocaleStoreContext.Provider value={store}>{children}</LocaleStoreContext.Provider>
}

export function useLocale() {
  const store = useContext(LocaleStoreContext)
  if (!store) {
    throw new Error('useLocale must be used within a LocaleProvider')
  }
  const locale = useStore(store, (s) => s.locale)
  const t = useStore(store, (s) => s.t)
  const setLocale = useStore(store, (s) => s.setLocale)
  return { locale, t, setLocale }
}
