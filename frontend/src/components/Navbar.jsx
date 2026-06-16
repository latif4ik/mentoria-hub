import { useState } from 'react'

function LogoMark() {
  return (
    <div className="h-10 w-10 rounded-lg gradient-btn flex items-center justify-center shrink-0">
      <svg viewBox="0 0 40 40" width="26" height="26" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 30V12l12 10 12-10v18" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="20" cy="10" r="3" fill="white"/>
      </svg>
    </div>
  )
}

export default function Navbar({ session, onLoginClick, onSignOut }) {
  const [open, setOpen] = useState(false)

  const user = session?.user
  const displayName = user?.email?.split('@')[0] ?? ''

  return (
    <nav className="bg-surface/80 backdrop-blur-xl sticky top-0 z-50 border-b border-outline-variant/10">
      <div className="flex justify-between items-center w-full px-6 max-w-desktop mx-auto h-20">

        {/* Logo */}
        <div className="flex items-center gap-3">
          <LogoMark />
          <span className="text-xl font-bold text-on-surface">Mentoria Hub</span>
        </div>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-8">
          {[
            { label: 'Opportunities', active: true },
            { label: 'Courses' },
            { label: 'For Students' },
            { label: 'About' },
          ].map(({ label, active }) => (
            <a
              key={label}
              href="#"
              className={`text-sm font-medium transition-colors duration-200 ${
                active
                  ? 'text-primary border-b-2 border-primary pb-0.5'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              {label}
            </a>
          ))}
        </div>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <>
              <span className="text-sm text-on-surface-variant">
                Hi, <span className="text-on-surface font-medium">{displayName}</span>
              </span>
              <button
                onClick={onSignOut}
                className="text-sm font-medium text-on-surface-variant hover:text-error transition-colors"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
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
            </>
          )}
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
        <div className="md:hidden bg-surface border-t border-outline-variant/10 px-6 py-5 space-y-4">
          {['Opportunities', 'Courses', 'For Students', 'About'].map(label => (
            <a
              key={label}
              href="#"
              className="block text-sm font-medium text-on-surface-variant hover:text-primary transition-colors"
            >
              {label}
            </a>
          ))}
          <div className="flex items-center gap-4 pt-2">
            {user ? (
              <>
                <span className="text-sm text-on-surface-variant">{displayName}</span>
                <button onClick={onSignOut} className="text-sm font-medium text-error">
                  Sign Out
                </button>
              </>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
