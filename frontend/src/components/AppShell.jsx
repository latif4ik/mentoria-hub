import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTheme } from '../hooks/useTheme'

const NAV = [
  { to: '/dashboard',     icon: 'grid_view',             label: 'Dashboard'     },
  { to: '/opportunities', icon: 'emoji_events',           label: 'Opportunities' },
  { to: '/courses',       icon: 'school',                 label: 'Courses'       },
]
const ADMIN_NAV = { to: '/admin', icon: 'admin_panel_settings', label: 'Admin' }

function NavItem({ item, active, onClick }) {
  return (
    <Link
      to={item.to}
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
        active
          ? 'bg-primary/15 text-primary'
          : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
      }`}
    >
      <span
        className="material-symbols-outlined text-[22px] shrink-0"
        style={active ? { fontVariationSettings: "'FILL' 1" } : {}}
      >
        {item.icon}
      </span>
      <span>{item.label}</span>
    </Link>
  )
}

function SidebarContent({ displayName, isAdmin, pathname, onClose, onSignOut, dark, onToggle }) {
  const items = [...NAV, ...(isAdmin ? [ADMIN_NAV] : [])]
  const initial = displayName?.[0]?.toUpperCase() ?? '?'

  return (
    <div className="flex flex-col h-full">

      {/* Logo */}
      <div className="px-5 h-16 flex items-center gap-3 border-b border-outline-variant/10 shrink-0">
        <div className="h-8 w-8 rounded-lg gradient-btn flex items-center justify-center shrink-0">
          <svg viewBox="0 0 40 40" width="20" height="20" fill="none">
            <path d="M8 30V12l12 10 12-10v18" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="20" cy="10" r="3" fill="white"/>
          </svg>
        </div>
        <span className="text-base font-bold text-on-surface">Mentoria Hub</span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {items.map(item => {
          const active = item.to === '/dashboard'
            ? pathname === '/dashboard'
            : pathname.startsWith(item.to)
          return <NavItem key={item.to} item={item} active={active} onClick={onClose} />
        })}
      </nav>

      {/* User + sign out */}
      <div className="px-3 pb-4 pt-3 border-t border-outline-variant/10 space-y-0.5 shrink-0">
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div className="w-8 h-8 rounded-full gradient-btn flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-white">{initial}</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-on-surface truncate">{displayName}</p>
            {isAdmin && <p className="text-[11px] text-tertiary font-semibold">Admin</p>}
          </div>
        </div>
        <button
          onClick={onToggle}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all duration-150"
        >
          <span className="material-symbols-outlined text-[22px] shrink-0">
            {dark ? 'light_mode' : 'dark_mode'}
          </span>
          {dark ? 'Light mode' : 'Dark mode'}
        </button>
        <button
          onClick={onSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-on-surface-variant hover:bg-surface-container-high hover:text-error transition-all duration-150"
        >
          <span className="material-symbols-outlined text-[22px] shrink-0">logout</span>
          Sign Out
        </button>
      </div>

    </div>
  )
}

export default function AppShell({ session, profile, onSignOut, children }) {
  const [open, setOpen]  = useState(false)
  const { pathname }     = useLocation()
  const { dark, toggle } = useTheme()

  const displayName = session?.user?.email?.split('@')[0] ?? ''
  const isAdmin     = profile?.role === 'admin'

  const sidebarProps = {
    displayName,
    isAdmin,
    pathname,
    onSignOut,
    onClose:   () => setOpen(false),
    dark,
    onToggle:  toggle,
  }

  return (
    <div className="flex h-screen bg-surface overflow-hidden">

      {/* ── Desktop sidebar ───────────────────────────────────── */}
      <aside className="hidden lg:flex w-56 flex-col bg-surface-container border-r border-outline-variant/10 shrink-0">
        <SidebarContent {...sidebarProps} onClose={() => {}} />
      </aside>

      {/* ── Mobile sidebar overlay ────────────────────────────── */}
      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-64 flex flex-col bg-surface-container border-r border-outline-variant/10 lg:hidden shadow-2xl">
            <SidebarContent {...sidebarProps} />
          </aside>
        </>
      )}

      {/* ── Main content ──────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Mobile top bar */}
        <header className="lg:hidden flex items-center gap-3 px-4 h-14 border-b border-outline-variant/10 bg-surface/80 backdrop-blur shrink-0">
          <button onClick={() => setOpen(true)} className="text-on-surface-variant hover:text-on-surface transition-colors">
            <span className="material-symbols-outlined text-[26px]">menu</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-md gradient-btn flex items-center justify-center">
              <svg viewBox="0 0 40 40" width="16" height="16" fill="none">
                <path d="M8 30V12l12 10 12-10v18" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="20" cy="10" r="3" fill="white"/>
              </svg>
            </div>
            <span className="text-sm font-bold text-on-surface">Mentoria Hub</span>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>

      </div>
    </div>
  )
}
