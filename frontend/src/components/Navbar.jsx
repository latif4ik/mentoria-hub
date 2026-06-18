import { useState } from 'react'
import { useTheme } from '../hooks/useTheme'
import { useLocale } from '../i18n/LocaleContext'
import LanguageSwitcher from './LanguageSwitcher'
import LogoMark from './LogoMark'

export default function Navbar({ onLoginClick }) {
  const [open, setOpen]  = useState(false)
  const { dark, toggle } = useTheme()
  const { t } = useLocale()

  return (
    <nav className="bg-surface/80 backdrop-blur-xl sticky top-0 z-50 border-b border-outline-variant/10">
      <div className="flex justify-between items-center w-full px-6 max-w-desktop mx-auto h-20">

        {/* Logo */}
        <div className="flex items-center gap-3">
          <LogoMark size={36} />
          <span className="text-xl font-bold text-on-surface">Mentoria Hub</span>
        </div>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-4">
          <button onClick={toggle} className="text-on-surface-variant hover:text-on-surface transition-colors p-1.5 rounded-lg hover:bg-surface-container" aria-label="Toggle theme">
            <span className="material-symbols-outlined text-[22px]">{dark ? 'light_mode' : 'dark_mode'}</span>
          </button>
          <LanguageSwitcher />
          <button
            onClick={onLoginClick}
            className="text-sm font-medium text-on-surface hover:text-primary transition-colors"
          >
            {t('auth.signIn')}
          </button>
          <button
            onClick={onLoginClick}
            className="gradient-btn text-sm font-semibold text-white px-6 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
          >
            {t('auth.signUp')}
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-on-surface"
          onClick={() => setOpen(v => !v)}
          aria-label="Toggle menu"
        >
          <span className="material-symbols-outlined text-[28px]">
            {open ? 'close' : 'menu'}
          </span>
        </button>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="md:hidden bg-surface border-t border-outline-variant/10 px-6 py-5">
          <div className="flex items-center gap-4">
            <button
              onClick={() => { setOpen(false); onLoginClick() }}
              className="text-sm font-medium text-on-surface"
            >
              {t('auth.signIn')}
            </button>
            <button
              onClick={() => { setOpen(false); onLoginClick() }}
              className="gradient-btn text-sm font-semibold text-white px-6 py-2.5 rounded-lg"
            >
              {t('auth.signUp')}
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}
