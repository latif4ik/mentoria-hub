import { useState } from 'react'
import { useTheme } from '../hooks/useTheme'

function LogoMark() {
  return (
    <div className="h-9 w-9 rounded-lg gradient-btn flex items-center justify-center shrink-0">
      <svg viewBox="0 0 40 40" width="22" height="22" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 30V12l12 10 12-10v18" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="20" cy="10" r="3" fill="white"/>
      </svg>
    </div>
  )
}

export default function Navbar({ onLoginClick }) {
  const [open, setOpen]  = useState(false)
  const { dark, toggle } = useTheme()

  return (
    <nav className="bg-surface/80 backdrop-blur-xl sticky top-0 z-50 border-b border-outline-variant/10">
      <div className="flex justify-between items-center w-full px-6 max-w-desktop mx-auto h-20">

        {/* Logo */}
        <div className="flex items-center gap-3">
          <LogoMark />
          <span className="text-xl font-bold text-on-surface">Mentoria Hub</span>
        </div>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-4">
          <button onClick={toggle} className="text-on-surface-variant hover:text-on-surface transition-colors p-1.5 rounded-lg hover:bg-surface-container" aria-label="Toggle theme">
            <span className="material-symbols-outlined text-[22px]">{dark ? 'light_mode' : 'dark_mode'}</span>
          </button>
          <button
            onClick={onLoginClick}
            className="text-sm font-medium text-on-surface hover:text-primary transition-colors"
          >
            Log in
          </button>
          <button
            onClick={onLoginClick}
            className="gradient-btn text-sm font-semibold text-white px-6 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
          >
            Join Mentoria
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
              Log in
            </button>
            <button
              onClick={() => { setOpen(false); onLoginClick() }}
              className="gradient-btn text-sm font-semibold text-white px-6 py-2.5 rounded-lg"
            >
              Join Mentoria
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}
