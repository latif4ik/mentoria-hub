import { useState, useEffect, useMemo } from 'react'
import { supabase } from '../supabaseClient'

// ─── Color maps ───────────────────────────────────────────────
const CATEGORY_COLOR = {
  'Competition':   '#95ccff',
  'Scholarship':   '#41e7be',
  'Internship':    '#ffb960',
  'Summer School': '#d4a0ff',
  'Olympiad':      '#2e9be6',
}

// ─── Helpers ──────────────────────────────────────────────────
function getDaysLeft(deadline) {
  return Math.ceil((new Date(deadline) - new Date()) / 86400000)
}

function DeadlineBadge({ deadline }) {
  const days = getDaysLeft(deadline)
  const date = new Date(deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  if (days < 0)  return <span className="text-xs text-outline">Closed</span>
  if (days === 0) return <span className="text-xs font-bold text-error flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">schedule</span>Closes today!</span>
  if (days <= 3)  return <span className="text-xs font-bold text-error flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">schedule</span>{days}d left</span>
  if (days <= 7)  return <span className="text-xs font-semibold text-tertiary flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">schedule</span>{days}d left</span>
  return <span className="text-xs text-on-surface-variant">{date}</span>
}

// ─── Card ─────────────────────────────────────────────────────
function OpportunityCard({ opp, isSaved, onToggleSave }) {
  const days = getDaysLeft(opp.deadline)
  const isCritical = days >= 0 && days <= 3
  const color = CATEGORY_COLOR[opp.category] || '#95ccff'

  return (
    <div className={`level-1-card rounded-2xl flex flex-col overflow-hidden transition-all duration-200 hover:-translate-y-1 ${isCritical ? 'ring-1 ring-error/30' : ''}`}>

      {/* Urgency banner */}
      {isCritical && (
        <div className="bg-error/8 border-b border-error/15 px-4 py-1.5 flex items-center gap-1.5">
          <span className="material-symbols-outlined text-error text-[15px]">warning</span>
          <span className="text-xs font-semibold text-error">
            {days === 0 ? 'Closes today!' : `Closing in ${days} day${days !== 1 ? 's' : ''}!`}
          </span>
        </div>
      )}

      <div className="p-5 flex flex-col flex-1">
        {/* Tags */}
        <div className="flex items-center gap-2 flex-wrap mb-3">
          <span
            className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
            style={{ color, backgroundColor: color + '18', border: `1px solid ${color}35` }}
          >
            {opp.category}
          </span>
          <span className="text-[11px] text-on-surface-variant bg-surface-variant/40 px-2.5 py-0.5 rounded-full border border-outline-variant/20">
            {opp.format}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-[15px] font-semibold text-on-surface leading-snug mb-1 line-clamp-2">{opp.title}</h3>
        <p className="text-xs text-on-surface-variant mb-3">{opp.direction}</p>

        {/* Description */}
        <p className="text-sm text-on-surface-variant leading-relaxed line-clamp-3 flex-1 mb-4">
          {opp.description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-outline-variant/10 pt-3 gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="material-symbols-outlined text-[15px] text-outline shrink-0">calendar_today</span>
            <DeadlineBadge deadline={opp.deadline} />
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onToggleSave(opp.id)}
              className="transition-transform hover:scale-110 active:scale-95"
              aria-label={isSaved ? 'Unsave' : 'Save'}
            >
              <span
                className="material-symbols-outlined text-[22px] transition-colors"
                style={{
                  color: isSaved ? '#ffb4ab' : '#89919c',
                  fontVariationSettings: isSaved ? "'FILL' 1" : "'FILL' 0",
                }}
              >favorite</span>
            </button>
            <button className="text-xs font-semibold flex items-center gap-0.5 hover:opacity-70 transition-opacity" style={{ color: '#2e9be6' }}>
              Apply
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="level-1-card rounded-2xl p-5 space-y-3 animate-pulse">
      <div className="flex gap-2">
        <div className="h-5 w-20 bg-surface-container-high rounded-full" />
        <div className="h-5 w-14 bg-surface-container-high rounded-full" />
      </div>
      <div className="h-5 w-3/4 bg-surface-container-high rounded" />
      <div className="h-3 w-1/3 bg-surface-container-high rounded" />
      <div className="space-y-2">
        <div className="h-3 w-full bg-surface-container-high rounded" />
        <div className="h-3 w-5/6 bg-surface-container-high rounded" />
        <div className="h-3 w-4/6 bg-surface-container-high rounded" />
      </div>
      <div className="pt-3 border-t border-outline-variant/10 flex justify-between">
        <div className="h-4 w-16 bg-surface-container-high rounded" />
        <div className="h-4 w-12 bg-surface-container-high rounded" />
      </div>
    </div>
  )
}

// ─── Filter chip ──────────────────────────────────────────────
function Chip({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150 whitespace-nowrap ${
        active
          ? 'bg-primary/15 border-primary text-primary'
          : 'border-outline-variant/40 text-on-surface-variant hover:border-outline hover:text-on-surface'
      }`}
    >
      {label}
    </button>
  )
}

const CATEGORIES = ['Competition', 'Scholarship', 'Internship', 'Summer School', 'Olympiad']
const DIRECTIONS = ['STEM', 'Business', 'Finance', 'Coding', 'Science', 'Social Impact']
const FORMATS    = ['Online', 'Offline', 'Hybrid']

// ─── Page ─────────────────────────────────────────────────────
export default function OpportunitiesPage({ session, onLoginRequired }) {
  const [opportunities, setOpportunities] = useState([])
  const [saved, setSaved]                 = useState(new Set())
  const [loading, setLoading]             = useState(true)
  const [search, setSearch]               = useState('')
  const [filters, setFilters]             = useState({ category: '', direction: '', format: '' })

  useEffect(() => {
    supabase.from('opportunities').select('*').order('deadline')
      .then(({ data }) => { setOpportunities(data || []); setLoading(false) })
  }, [])

  useEffect(() => {
    if (!session) { setSaved(new Set()); return }
    supabase.from('saved_opportunities').select('opportunity_id')
      .eq('user_id', session.user.id)
      .then(({ data }) => setSaved(new Set((data || []).map(r => r.opportunity_id))))
  }, [session])

  async function toggleSave(oppId) {
    if (!session) { onLoginRequired(); return }
    const wasSaved = saved.has(oppId)
    // Optimistic UI
    setSaved(prev => { const n = new Set(prev); wasSaved ? n.delete(oppId) : n.add(oppId); return n })
    if (wasSaved) {
      await supabase.from('saved_opportunities').delete()
        .eq('user_id', session.user.id).eq('opportunity_id', oppId)
    } else {
      await supabase.from('saved_opportunities')
        .insert({ user_id: session.user.id, opportunity_id: oppId })
    }
  }

  function toggleFilter(key, val) {
    setFilters(f => ({ ...f, [key]: f[key] === val ? '' : val }))
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return opportunities.filter(o => {
      if (filters.category  && o.category  !== filters.category)  return false
      if (filters.direction && o.direction !== filters.direction)  return false
      if (filters.format    && o.format    !== filters.format)     return false
      if (!q) return true
      return (
        o.title.toLowerCase().includes(q) ||
        o.description?.toLowerCase().includes(q) ||
        o.tags.some(t => t.toLowerCase().includes(q))
      )
    })
  }, [opportunities, filters, search])

  const hasFilters = filters.category || filters.direction || filters.format || search

  return (
    <main className="max-w-desktop mx-auto px-6 py-12">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-on-surface">Opportunities</h1>
          <p className="text-on-surface-variant mt-1.5">Competitions, scholarships, internships and more — all in one place.</p>
        </div>
        <div className="relative w-full sm:w-72 shrink-0">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px] pointer-events-none">search</span>
          <input
            type="text"
            placeholder="Search opportunities…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-surface-container border border-outline-variant rounded-xl pl-10 pr-4 py-2.5 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="glass-panel rounded-2xl p-4 mb-6 space-y-3">
        <div className="flex items-start gap-3 flex-wrap">
          <span className="text-xs font-semibold text-on-surface-variant pt-1.5 w-16 shrink-0">Category</span>
          <div className="flex gap-2 flex-wrap flex-1">
            {CATEGORIES.map(c => <Chip key={c} label={c} active={filters.category === c} onClick={() => toggleFilter('category', c)} />)}
          </div>
        </div>
        <div className="flex items-start gap-3 flex-wrap">
          <span className="text-xs font-semibold text-on-surface-variant pt-1.5 w-16 shrink-0">Field</span>
          <div className="flex gap-2 flex-wrap flex-1">
            {DIRECTIONS.map(d => <Chip key={d} label={d} active={filters.direction === d} onClick={() => toggleFilter('direction', d)} />)}
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs font-semibold text-on-surface-variant w-16 shrink-0">Format</span>
          <div className="flex gap-2 flex-wrap flex-1">
            {FORMATS.map(f => <Chip key={f} label={f} active={filters.format === f} onClick={() => toggleFilter('format', f)} />)}
          </div>
          {hasFilters && (
            <button
              onClick={() => { setFilters({ category: '', direction: '', format: '' }); setSearch('') }}
              className="text-xs font-medium text-on-surface-variant hover:text-error transition-colors flex items-center gap-1 ml-auto"
            >
              <span className="material-symbols-outlined text-[14px]">close</span>
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Count */}
      {!loading && (
        <p className="text-sm text-on-surface-variant mb-5">
          {filtered.length} {filtered.length === 1 ? 'opportunity' : 'opportunities'} found
        </p>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          : filtered.length > 0
            ? filtered.map(opp => (
                <OpportunityCard
                  key={opp.id}
                  opp={opp}
                  isSaved={saved.has(opp.id)}
                  onToggleSave={toggleSave}
                />
              ))
            : (
              <div className="col-span-full flex flex-col items-center justify-center py-24 text-center gap-3">
                <span className="material-symbols-outlined text-[48px] text-outline">search_off</span>
                <p className="text-on-surface font-medium">No opportunities match your filters</p>
                <p className="text-sm text-on-surface-variant">Try removing a filter or clearing the search</p>
              </div>
            )
        }
      </div>

    </main>
  )
}
