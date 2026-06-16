import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

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

const NAV_LINKS = [
  { label: 'Opportunities', to: '/opportunities' },
  { label: 'Courses',       to: '/courses' },
  { label: 'For Students',  to: null },
  { label: 'About',         to: null },
]

export default function Navbar({ session, profile, onLoginClick, onSignOut }) {
  const [open, setOpen] = useState(false)
  const { pathname }    = useLocation()

  const user        = session?.user
  const displayName = user?.email?.split('@')[0] ?? ''
  const isAdmin     = profile?.role === 'admin'

  return (
    <nav className="bg-surface/80 backdrop-blur-xl sticky top-0 z-50 border-b border-outline-variant/10">
      <div className="flex justify-between items-center w-full px-6 max-w-desktop mx-auto h-20">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <LogoMark />
          <span className="text-xl font-bold text-on-surface">Mentoria Hub</span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(({ label, to }) => {
            const active = to && pathname === to
            const cls = `text-sm font-medium transition-colors duration-200 ${
              active ? 'text-primary border-b-2 border-primary pb-0.5' : 'text-on-surface-variant hover:text-primary'
            }`
            return to
              ? <Link key={label} to={to} className={cls}>{label}</Link>
              : <a key={label} href="#" className={cls}>{label}</a>
          })}
        </div>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <>
              {isAdmin && (
                <Link to="/admin" className={`text-sm font-medium transition-colors ${pathname === '/admin' ? 'text-primary' : 'text-on-surface-variant hover:text-primary'}`}>
                  Admin
                </Link>
              )}
              <Link to="/dashboard" className="text-sm text-on-surface-variant hover:text-primary transition-colors">
                Hi, <span className="text-on-surface font-medium">{displayName}</span>
              </Link>
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
          {NAV_LINKS.map(({ label, to }) =>
            to
              ? <Link key={label} to={to} onClick={() => setOpen(false)} className="block text-sm font-medium text-on-surface-variant hover:text-primary transition-colors">{label}</Link>
              : <a key={label} href="#" className="block text-sm font-medium text-on-surface-variant hover:text-primary transition-colors">{label}</a>
          )}
          <div className="flex items-center gap-4 pt-2">
            {user ? (
              <>
                {isAdmin && (
                  <Link to="/admin" onClick={() => setOpen(false)} className="text-sm font-semibold text-tertiary">Admin</Link>
                )}
                <Link to="/dashboard" onClick={() => setOpen(false)} className="text-sm text-on-surface-variant hover:text-primary transition-colors">{displayName}</Link>
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
