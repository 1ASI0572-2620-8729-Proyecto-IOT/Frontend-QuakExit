import { createContext, useContext, useEffect, useMemo, useState } from 'react'

import { locales, translations, type Locale, type TranslationDictionary } from './translations'

type I18nContextValue = {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: keyof TranslationDictionary) => string
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined)

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    const savedLocale = typeof window !== 'undefined' ? window.localStorage.getItem('quakexit-locale') : null

    if (savedLocale && locales.includes(savedLocale as Locale)) {
      return savedLocale as Locale
    }

    return 'es'
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('quakexit-locale', locale)
    }
  }, [locale])

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale: setLocaleState,
      t: (key) => translations[locale][key],
    }),
    [locale],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const context = useContext(I18nContext)

  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider')
  }

  return context
}
