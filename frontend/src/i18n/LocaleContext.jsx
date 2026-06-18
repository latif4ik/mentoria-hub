import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { translations } from './translations'

const LocaleContext = createContext()

export function LocaleProvider({ children }) {
  const [locale, setLocale] = useState(() => localStorage.getItem('locale') || 'en')

  useEffect(() => {
    localStorage.setItem('locale', locale)
  }, [locale])

  const t = useCallback((key) => {
    const keys = key.split('.')
    let val = translations[locale]
    for (const k of keys) {
      val = val?.[k]
      if (val === undefined) return key
    }
    return val
  }, [locale])

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  )
}

export function useLocale() {
  return useContext(LocaleContext)
}
