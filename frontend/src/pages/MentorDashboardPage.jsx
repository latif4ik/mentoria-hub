import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useLocale } from '../i18n/LocaleContext'

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

function CourseRow({ course, enrollmentCount }) {
  const { t } = useLocale()
  const lessonCount = course.lessons?.length || 0
  return (
    <div className="level-1-card rounded-xl p-4 flex items-center gap-4">
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        <span className="material-symbols-outlined text-[20px] text-primary">school</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-on-surface truncate">{course.title}</p>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-xs text-on-surface-variant flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">people</span>
            {enrollmentCount} {t('mentor.dashboard.enrolled')}
          </span>
          <span className="text-xs text-on-surface-variant flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">play_lesson</span>
            {lessonCount} {t('courses.lessons')}
          </span>
        </div>
      </div>
      <Link
        to={`/courses/${course.id}`}
        className="shrink-0 text-xs font-semibold text-primary hover:opacity-80 transition-opacity flex items-center gap-1"
      >
        {t('dashboard.view')}
        <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
      </Link>
    </div>
  )
}

export default function MentorDashboardPage({ session, profile }) {
  const { t } = useLocale()
  const [courses, setCourses] = useState([])
  const [enrollments, setEnrollments] = useState([])
  const [quizScores, setQuizScores] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session) return
    const uid = session.user.id

    async function load() {
      const { data: myCourses } = await supabase
        .from('courses')
        .select('*, lessons(id)')
        .eq('created_by', uid)
        .order('created_at', { ascending: false })

      setCourses(myCourses || [])

      if (myCourses?.length) {
        const courseIds = myCourses.map(c => c.id)
        const lessonIds = myCourses.flatMap(c => (c.lessons || []).map(l => l.id))

        const [{ data: enr }, { data: scores }] = await Promise.all([
          supabase.from('enrollments').select('course_id').in('course_id', courseIds),
          lessonIds.length
            ? supabase.from('lesson_progress').select('quiz_score').in('lesson_id', lessonIds).eq('completed', true)
            : { data: [] },
        ])
        setEnrollments(enr || [])
        setQuizScores(scores || [])
      }
      setLoading(false)
    }
    load()
  }, [session])

  const enrollmentCounts = useMemo(() => {
    const counts = {}
    enrollments.forEach(e => { counts[e.course_id] = (counts[e.course_id] || 0) + 1 })
    return counts
  }, [enrollments])

  const totalStudents = enrollments.length
  const totalLessons = courses.reduce((n, c) => n + (c.lessons?.length || 0), 0)
  const avgScore = quizScores.length
    ? Math.round(quizScores.reduce((s, r) => s + (r.quiz_score || 0), 0) / quizScores.length)
    : 0

  const displayName = profile?.full_name || session?.user?.email?.split('@')[0] || ''

  function greeting() {
    const h = new Date().getHours()
    return h < 12 ? t('dashboard.morning') : h < 17 ? t('dashboard.afternoon') : t('dashboard.evening')
  }

  if (loading) {
    return (
      <main className="max-w-desktop mx-auto px-6 py-10 animate-pulse space-y-6">
        <div className="h-8 w-64 bg-surface-container-high rounded" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-20 bg-surface-container-high rounded-2xl" />)}
        </div>
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-16 bg-surface-container-high rounded-xl" />)}
        </div>
      </main>
    )
  }

  return (
    <main className="max-w-desktop mx-auto px-6 py-10">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-on-surface">
          {greeting()}, <span className="bg-brand-gradient bg-clip-text text-transparent">{displayName}</span>
        </h1>
        <p className="text-on-surface-variant mt-1">{t('mentor.dashboard.title')}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        <Stat icon="book"         value={courses.length}  label={t('mentor.dashboard.coursesCreated')} color="#95ccff" />
        <Stat icon="play_lesson"  value={totalLessons}    label={t('mentor.dashboard.lessonsCreated')} color="#d4a0ff" />
        <Stat icon="people"       value={totalStudents}   label={t('mentor.dashboard.totalStudents')}  color="#41e7be" />
        <Stat icon="grade"        value={avgScore ? `${avgScore}%` : '—'} label={t('mentor.dashboard.avgScore')} color="#ffb960" />
      </div>

      {/* Courses */}
      <div className="glass-panel rounded-2xl p-5 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-on-surface">{t('mentor.nav.myCourses')}</h2>
          <Link to="/admin" className="text-xs text-primary hover:opacity-80 transition-opacity">
            {t('mentor.dashboard.manageCourses')} →
          </Link>
        </div>

        {courses.length > 0 ? (
          <div className="space-y-3">
            {courses.map(c => (
              <CourseRow key={c.id} course={c} enrollmentCount={enrollmentCounts[c.id] || 0} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
            <span className="material-symbols-outlined text-[40px] text-outline">school</span>
            <p className="text-sm text-on-surface-variant">{t('mentor.dashboard.noCourses')}</p>
            <Link
              to="/admin"
              className="gradient-btn text-sm font-semibold text-white px-6 py-2.5 rounded-lg hover:opacity-90 transition-opacity inline-flex items-center gap-2"
            >
              {t('mentor.dashboard.createCourse')}
              <span className="material-symbols-outlined text-[16px]">add</span>
            </Link>
          </div>
        )}
      </div>

      {/* Performance summary */}
      {quizScores.length > 0 && (
        <div className="glass-panel rounded-2xl p-5">
          <h2 className="text-base font-semibold text-on-surface mb-4">{t('mentor.dashboard.performance')}</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="level-1-card rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-primary">{avgScore}%</p>
              <p className="text-xs text-on-surface-variant mt-1">{t('mentor.dashboard.avgScore')}</p>
            </div>
            <div className="level-1-card rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-secondary">{quizScores.length}</p>
              <p className="text-xs text-on-surface-variant mt-1">{t('mentor.dashboard.completionRate')}</p>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
