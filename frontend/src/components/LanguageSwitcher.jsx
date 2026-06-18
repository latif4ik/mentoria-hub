import { useLocale } from '../i18n/LocaleContext'

const LANGS = [
  { code: 'en', label: 'EN' },
  { code: 'ru', label: 'RU' },
  { code: 'kk', label: 'KZ' },
]

export default function LanguageSwitcher({ compact = false }) {
  const { locale, setLocale } = useLocale()

  return (
    <div className={`flex ${compact ? 'gap-0.5' : 'gap-1'}`}>
      {LANGS.map(({ code, label }) => (
        <button
          key={code}
          onClick={() => setLocale(code)}
          className={`text-xs font-semibold px-2.5 py-1.5 rounded transition-colors ${
            locale === code
              ? 'bg-primary/15 text-primary'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
