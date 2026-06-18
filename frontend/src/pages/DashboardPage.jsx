import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { getRecommendations } from '../lib/recommend'
import { useLocale } from '../i18n/LocaleContext'

// ─── Helpers ──────────────────────────────────────────────────
function getDaysLeft(deadline) {
  return Math.ceil((new Date(deadline) - new Date()) / 86400000)
}

function greeting(t) {
  const h = new Date().getHours()
  return h < 12 ? t('dashboard.morning') : h < 17 ? t('dashboard.afternoon') : t('dashboard.evening')
}

const LEVEL_COLOR  = { Beginner: '#41e7be', Intermediate: '#ffb960', Advanced: '#ffb4ab' }
const SUBJECT_ICON = { English: 'menu_book', Physics: 'science', Economics: 'bar_chart', default: 'school' }
const CATEGORY_COLOR = {
  Competition: '#95ccff', Scholarship: '#41e7be', Internship: '#ffb960',
  'Summer School': '#d4a0ff', Olympiad: '#2e9be6',
}

// ─── Stat tile ────────────────────────────────────────────────
function Stat({ icon, value, label, color }) {
  return (
    <div className="level-1-card rounded-2xl p-5 flex items-center gap-4">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: color + '18' }}>
        <span className="material-symbols-outlined text-[22px]" style={{ color }}>{icon}</span>
      </div>
      <div>
        <p className="text-2xl font-bold text-on-surface leading-none">{value}</p>
        <p className="text-xs text-on-surface-variant mt-0.5">{label}</p>
      </div>
    </div>
  )
}

// ─── Course row ───────────────────────────────────────────────
function CourseRow({ course, completedIds }) {
  const { t }      = useLocale()
  const lessons    = [...(course.lessons || [])].sort((a, b) => a.position - b.position)
  const total      = lessons.length
  const done       = lessons.filter(l => completedIds.has(l.id)).length
  const progress   = total > 0 ? Math.round((done / total) * 100) : 0
  const nextLesson = lessons.find(l => !completedIds.has(l.id)) ?? lessons[0]
  const color      = LEVEL_COLOR[course.level] || '#95ccff'
  const icon       = SUBJECT_ICON[course.subject] || SUBJECT_ICON.default

  return (
    <div className="level-1-card rounded-xl p-4 flex items-center gap-4">
      <div className="w-10 h-10 rounded-lg shrink-0 flex items-center justify-center"
        style={{ backgroundColor: color + '18' }}>
        <span className="material-symbols-outlined text-[20px]" style={{ color }}>{icon}</span>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-on-surface truncate">{course.title}</p>
        <div className="flex items-center gap-2 mt-2">
          <div className="flex-1 bg-surface-container h-1.5 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all"
              style={{ width: `${progress}%`, background: 'linear-gradient(135deg,#2E9BE6,#27D8B0)' }} />
          </div>
          <span className="text-xs text-on-surface-variant shrink-0">{progress}%</span>
        </div>
      </div>

      {nextLesson && progress < 100 ? (
        <Link
          to={`/courses/${course.id}/lessons/${nextLesson.id}`}
          className="shrink-0 gradient-btn text-xs font-semibold text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-1"
        >
          {done === 0 ? t('dashboard.start') : t('dashboard.continue')}
          <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
        </Link>
      ) : (
        <Link to={`/courses/${course.id}`}
          className="shrink-0 text-xs font-semibold text-secondary flex items-center gap-1 hover:opacity-80 transition-opacity">
          <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          {t('dashboard.done')}
        </Link>
      )}
    </div>
  )
}

// ─── Saved opportunity row ────────────────────────────────────
function SavedRow({ opp, onUnsave }) {
  const { t }  = useLocale()
  const days  = getDaysLeft(opp.deadline)
  const color = CATEGORY_COLOR[opp.category] || '#95ccff'
  const deadlineColor = days <= 3 ? '#ffb4ab' : days <= 7 ? '#ffb960' : '#89919c'

  return (
    <div className="level-1-card rounded-xl px-4 py-3 flex items-center gap-3">
      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full shrink-0"
        style={{ color, backgroundColor: color + '18', border: `1px solid ${color}35` }}>
        {opp.category}
      </span>
      <p className="text-sm text-on-surface flex-1 truncate">{opp.title}</p>
      <span className="text-xs font-medium shrink-0 flex items-center gap-1" style={{ color: deadlineColor }}>
        {days <= 7 && <span className="material-symbols-outlined text-[13px]">schedule</span>}
        {days <= 0 ? t('dashboard.closed') : days <= 1 ? t('dashboard.today') + '!' : `${days}d`}
      </span>
      <button onClick={() => onUnsave(opp.id)} className="shrink-0 hover:text-error transition-colors text-outline">
        <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1", color: '#ffb4ab' }}>favorite</span>
      </button>
    </div>
  )
}

// ─── Deadline item ────────────────────────────────────────────
function DeadlineItem({ opp }) {
  const { t, locale } = useLocale()
  const days  = getDaysLeft(opp.deadline)
  const dateFmt = locale === 'kk' ? 'kk-KZ' : locale === 'ru' ? 'ru-RU' : 'en-US'
  const date  = new Date(opp.deadline).toLocaleDateString(dateFmt, { month: 'short', day: 'numeric' })
  const color = CATEGORY_COLOR[opp.category] || '#95ccff'
  const urgencyColor = days <= 3 ? '#ffb4ab' : days <= 7 ? '#ffb960' : '#bfc7d2'

  return (
    <div className="flex items-start gap-3 py-3 border-b border-outline-variant/10 last:border-0">
      <div className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ backgroundColor: color }} />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-on-surface truncate">{opp.title}</p>
        <p className="text-xs mt-0.5" style={{ color: urgencyColor }}>
          {date}
          {days <= 7 && days >= 0 && ` · ${days === 0 ? t('dashboard.today') : `${days}${t('dashboard.dLeft')}`}`}
        </p>
      </div>
    </div>
  )
}

// ─── Recommendation card ──────────────────────────────────────
function RecCard({ item, type }) {
  const { t }  = useLocale()
  const to    = type === 'course' ? `/courses/${item.id}` : `/opportunities`
  const color = type === 'course' ? '#41e7be' : '#95ccff'

  return (
    <Link to={to}
      className="level-1-card rounded-xl p-4 flex flex-col gap-2 min-w-[220px] max-w-[260px] hover:-translate-y-1 transition-transform duration-200 shrink-0">
      <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color }}>
        {type === 'course' ? t('dashboard.course') : item.category}
      </span>
      <h4 className="text-sm font-semibold text-on-surface line-clamp-2">{item.title}</h4>
      <p className="text-xs text-on-surface-variant line-clamp-2 flex-1">{item.reason}</p>
      <span className="text-xs font-semibold text-primary-container flex items-center gap-1 mt-1">
        {t('dashboard.view')} <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
      </span>
    </Link>
  )
}

// ─── Empty state ──────────────────────────────────────────────
function Empty({ icon, text, linkTo, linkLabel }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center gap-2">
      <span className="material-symbols-outlined text-[36px] text-outline">{icon}</span>
      <p className="text-sm text-on-surface-variant">{text}</p>
      {linkTo && <Link to={linkTo} className="text-xs font-semibold text-primary hover:opacity-80 transition-opacity">{linkLabel} →</Link>}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────
export default function DashboardPage({ session, onLoginRequired }) {
  const { t }                           = useLocale()
  const [loading, setLoading]           = useState(true)
  const [profile, setProfile]           = useState(null)
  const [enrolledCourses, setEnrolledCourses] = useState([])
  const [completedIds, setCompletedIds] = useState(new Set())
  const [savedOpps, setSavedOpps]       = useState([])
  const [allOpps, setAllOpps]           = useState([])
  const [allCourses, setAllCourses]     = useState([])

  useEffect(() => {
    if (!session) return
    const uid = session.user.id

    Promise.all([
      supabase.from('profiles').select('*').eq('id', uid).single(),
      supabase.from('enrollments').select('*, courses(*, lessons(id, position, title))').eq('user_id', uid),
      supabase.from('lesson_progress').select('lesson_id').eq('user_id', uid).eq('completed', true),
      supabase.from('saved_opportunities').select('*, opportunities(*)').eq('user_id', uid).order('created_at', { ascending: false }),
      supabase.from('opportunities').select('*').order('deadline'),
      supabase.from('courses').select('*'),
    ]).then(([
      { data: prof },
      { data: enr },
      { data: prog },
      { data: saved },
      { data: opps },
      { data: courses },
    ]) => {
      setProfile(prof)
      setEnrolledCourses((enr || []).map(r => r.courses).filter(Boolean))
      setCompletedIds(new Set((prog || []).map(r => r.lesson_id)))
      setSavedOpps((saved || []).map(r => r.opportunities).filter(Boolean))
      setAllOpps(opps || [])
      setAllCourses(courses || [])
      setLoading(false)
    })
  }, [session])

  async function unsave(oppId) {
    setSavedOpps(prev => prev.filter(o => o.id !== oppId))
    await supabase.from('saved_opportunities')
      .delete().eq('user_id', session.user.id).eq('opportunity_id', oppId)
  }

  const recommendations = useMemo(() => {
    if (!profile || !allOpps.length) return { opportunities: [], courses: [] }
    const enrolledIds = new Set(enrolledCourses.map(c => c.id))
    const savedIds    = new Set(savedOpps.map(o => o.id))
    return getRecommendations(
      profile,
      allOpps.filter(o => !savedIds.has(o.id)),
      allCourses.filter(c => !enrolledIds.has(c.id)),
    )
  }, [profile, allOpps, allCourses, enrolledCourses, savedOpps])

  const upcomingDeadlines = useMemo(() =>
    savedOpps
      .filter(o => getDaysLeft(o.deadline) >= 0)
      .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
      .slice(0, 6),
    [savedOpps]
  )

  const recItems = useMemo(() => [
    ...recommendations.opportunities.slice(0, 3).map(o => ({ ...o, _type: 'opportunity' })),
    ...recommendations.courses.slice(0, 2).map(c => ({ ...c, _type: 'course' })),
  ], [recommendations])

  // Not logged in
  if (!session) {
    return (
      <main className="max-w-desktop mx-auto px-6 py-24 flex flex-col items-center text-center gap-4">
        <span className="material-symbols-outlined text-[48px] text-outline">lock</span>
        <h2 className="text-xl font-semibold text-on-surface">{t('auth.signInDashboard')}</h2>
        <button onClick={onLoginRequired} className="gradient-btn text-sm font-semibold text-white px-6 py-3 rounded-lg">
          {t('auth.signIn')}
        </button>
      </main>
    )
  }

  const displayName = session.user.email?.split('@')[0] ?? 'there'
  const completedCount = completedIds.size

  return (
    <main className="max-w-desktop mx-auto px-6 py-10">

      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-on-surface">
          {greeting(t)}, <span className="bg-brand-gradient bg-clip-text text-transparent">{displayName}</span> 👋
        </h1>
        <p className="text-on-surface-variant mt-1">{t('dashboard.leftOff')}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
        <Stat icon="school"            value={enrolledCourses.length} label={t('dashboard.coursesEnrolled')}     color="#95ccff" />
        <Stat icon="check_circle"      value={completedCount}         label={t('dashboard.lessonsCompleted')}    color="#41e7be" />
        <Stat icon="favorite" value={savedOpps.length}       label={t('dashboard.oppsSaved')}  color="#ffb4ab" />
      </div>

      {/* Main 2-col grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">

        {/* Left: courses + saved opps */}
        <div className="lg:col-span-2 space-y-6">

          {/* My Courses */}
          <div className="glass-panel rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-on-surface">{t('dashboard.myCourses')}</h2>
              <Link to="/courses" className="text-xs text-primary hover:opacity-80 transition-opacity">{t('dashboard.browseAll')} →</Link>
            </div>
            {loading ? (
              <div className="space-y-3 animate-pulse">
                {[1,2].map(i => <div key={i} className="h-16 bg-surface-container-high rounded-xl" />)}
              </div>
            ) : enrolledCourses.length > 0 ? (
              <div className="space-y-3">
                {enrolledCourses.map(c => (
                  <CourseRow key={c.id} course={c} completedIds={completedIds} />
                ))}
              </div>
            ) : (
              <Empty icon="school" text={t('dashboard.noCourses')} linkTo="/courses" linkLabel={t('dashboard.browseCourses')} />
            )}
          </div>

          {/* Saved Opportunities */}
          <div className="glass-panel rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-on-surface">{t('dashboard.savedOpps')}</h2>
              <Link to="/opportunities" className="text-xs text-primary hover:opacity-80 transition-opacity">{t('dashboard.browseAll')} →</Link>
            </div>
            {loading ? (
              <div className="space-y-3 animate-pulse">
                {[1,2,3].map(i => <div key={i} className="h-12 bg-surface-container-high rounded-xl" />)}
              </div>
            ) : savedOpps.length > 0 ? (
              <div className="space-y-2">
                {savedOpps.map(o => (
                  <SavedRow key={o.id} opp={o} onUnsave={unsave} />
                ))}
              </div>
            ) : (
              <Empty icon="bookmark" text={t('dashboard.noSaved')} linkTo="/opportunities" linkLabel={t('dashboard.exploreOpps')} />
            )}
          </div>

        </div>

        {/* Right: upcoming deadlines */}
        <div className="glass-panel rounded-2xl p-5 h-fit">
          <h2 className="text-base font-semibold text-on-surface mb-4">{t('dashboard.upcomingDeadlines')}</h2>
          {loading ? (
            <div className="space-y-4 animate-pulse">
              {[1,2,3].map(i => <div key={i} className="h-10 bg-surface-container-high rounded" />)}
            </div>
          ) : upcomingDeadlines.length > 0 ? (
            <div>
              {upcomingDeadlines.map(o => <DeadlineItem key={o.id} opp={o} />)}
            </div>
          ) : (
            <Empty icon="event" text={t('dashboard.noDeadlines')} />
          )}
        </div>

      </div>

      {/* Recommendations */}
      {!loading && recItems.length > 0 && (
        <div>
          <div className="flex items-baseline gap-3 mb-4">
            <h2 className="text-base font-semibold text-on-surface">{t('dashboard.recommended')}</h2>
            <p className="text-xs text-on-surface-variant">{t('dashboard.basedOnProfile')}</p>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {recItems.map(item => (
              <RecCard key={item.id} item={item} type={item._type} />
            ))}
          </div>
        </div>
      )}

    </main>
  )
}
