import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useLocale } from '../i18n/LocaleContext'

const LEVEL_COLOR  = { Beginner: '#41e7be', Intermediate: '#ffb960', Advanced: '#ffb4ab' }
const SUBJECT_ICON = { English: 'menu_book', Physics: 'science', Economics: 'bar_chart', default: 'school' }

function CourseCard({ course, isEnrolled, completedLessonIds }) {
  const { t } = useLocale()
  const lessons   = [...(course.lessons || [])].sort((a, b) => a.position - b.position)
  const total     = lessons.length
  const done      = lessons.filter(l => completedLessonIds.has(l.id)).length
  const progress  = total > 0 ? Math.round((done / total) * 100) : 0
  const nextLesson = lessons.find(l => !completedLessonIds.has(l.id)) ?? lessons[0]
  const color     = LEVEL_COLOR[course.level] || '#95ccff'
  const icon      = SUBJECT_ICON[course.subject] || SUBJECT_ICON.default

  return (
    <Link
      to={`/courses/${course.id}`}
      className="level-1-card rounded-2xl p-5 flex flex-col hover:-translate-y-1 transition-transform duration-200 group"
    >
      {/* Icon */}
      <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 shrink-0"
        style={{ backgroundColor: color + '18' }}>
        <span className="material-symbols-outlined text-[24px]" style={{ color }}>{icon}</span>
      </div>

      {/* Badges */}
      <div className="flex gap-2 flex-wrap mb-3">
        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
          style={{ color, backgroundColor: color + '18', border: `1px solid ${color}35` }}>
          {course.level}
        </span>
        <span className="text-[11px] text-on-surface-variant bg-surface-variant/40 px-2.5 py-0.5 rounded-full border border-outline-variant/20">
          {course.subject}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-[15px] font-semibold text-on-surface mb-2 line-clamp-2 group-hover:text-primary transition-colors">
        {course.title}
      </h3>
      <p className="text-sm text-on-surface-variant leading-relaxed line-clamp-2 flex-1 mb-3">
        {course.description}
      </p>
      {course.mentor?.full_name && (
        <p className="text-xs text-on-surface-variant mb-1">
          {t('mentor.by')} {course.mentor.full_name}
        </p>
      )}
      <p className="text-xs text-on-surface-variant mb-3">{total} {t('courses.lessons')}</p>

      {/* Progress bar (enrolled only) */}
      {isEnrolled && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-on-surface-variant mb-1.5">
            <span>{done}/{total} completed</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all"
              style={{ width: `${progress}%`, background: 'linear-gradient(135deg,#2E9BE6,#27D8B0)' }} />
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="mt-auto">
        {isEnrolled ? (
          <span className="gradient-btn text-xs font-semibold text-white px-4 py-2 rounded-lg inline-flex items-center gap-1">
            {progress === 100 ? t('courses.review') : progress > 0 ? t('courses.continue') : t('courses.start')}
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </span>
        ) : (
          <span className="border border-primary-container text-primary-container text-xs font-semibold px-4 py-2 rounded-lg inline-flex items-center gap-1">
            {t('courses.enroll')}
            <span className="material-symbols-outlined text-[14px]">add</span>
          </span>
        )}
      </div>
    </Link>
  )
}

function SkeletonCard() {
  return (
    <div className="level-1-card rounded-2xl p-5 space-y-3 animate-pulse">
      <div className="h-12 w-12 bg-surface-container-high rounded-xl" />
      <div className="flex gap-2"><div className="h-5 w-20 bg-surface-container-high rounded-full" /><div className="h-5 w-14 bg-surface-container-high rounded-full" /></div>
      <div className="h-5 w-3/4 bg-surface-container-high rounded" />
      <div className="h-3 w-full bg-surface-container-high rounded" />
      <div className="h-3 w-5/6 bg-surface-container-high rounded" />
      <div className="h-3 w-16 bg-surface-container-high rounded" />
    </div>
  )
}

export default function CoursesPage({ session }) {
  const { t } = useLocale()
  const [courses, setCourses]                   = useState([])
  const [enrolledIds, setEnrolledIds]           = useState(new Set())
  const [completedLessonIds, setCompletedLessonIds] = useState(new Set())
  const [loading, setLoading]                   = useState(true)

  useEffect(() => {
    supabase.from('courses').select('*, lessons(id, position, title), mentor:profiles!created_by(full_name)').order('created_at')
      .then(({ data }) => { setCourses(data || []); setLoading(false) })
  }, [])

  useEffect(() => {
    if (!session) { setEnrolledIds(new Set()); setCompletedLessonIds(new Set()); return }
    Promise.all([
      supabase.from('enrollments').select('course_id').eq('user_id', session.user.id),
      supabase.from('lesson_progress').select('lesson_id').eq('user_id', session.user.id).eq('completed', true),
    ]).then(([{ data: enr }, { data: prog }]) => {
      setEnrolledIds(new Set((enr || []).map(r => r.course_id)))
      setCompletedLessonIds(new Set((prog || []).map(r => r.lesson_id)))
    })
  }, [session])

  return (
    <main className="max-w-desktop mx-auto px-6 py-12">
      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-on-surface">{t('courses.title')}</h1>
        <p className="text-on-surface-variant mt-1.5">{t('courses.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
          : courses.map(c => (
            <CourseCard
              key={c.id}
              course={c}
              isEnrolled={enrolledIds.has(c.id)}
              completedLessonIds={completedLessonIds}
            />
          ))
        }
      </div>
    </main>
  )
}
