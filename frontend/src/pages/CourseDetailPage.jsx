import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useLocale } from '../i18n/LocaleContext'

const LEVEL_COLOR = { Beginner: '#41e7be', Intermediate: '#ffb960', Advanced: '#ffb4ab' }

export default function CourseDetailPage({ session, onLoginRequired }) {
  const { courseId } = useParams()
  const navigate     = useNavigate()
  const { t } = useLocale()

  const [course, setCourse]       = useState(null)
  const [lessons, setLessons]     = useState([])
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [completedIds, setCompletedIds] = useState(new Set())
  const [enrolling, setEnrolling] = useState(false)
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    supabase.from('courses').select('*, mentor:profiles!created_by(full_name, avatar_url)').eq('id', courseId).single()
      .then(({ data }) => setCourse(data))

    supabase.from('lessons').select('*').eq('course_id', courseId).order('position')
      .then(({ data }) => { setLessons(data || []); setLoading(false) })
  }, [courseId])

  useEffect(() => {
    if (!session) return
    Promise.all([
      supabase.from('enrollments').select('id').eq('user_id', session.user.id).eq('course_id', courseId).maybeSingle(),
      supabase.from('lesson_progress').select('lesson_id').eq('user_id', session.user.id).eq('completed', true),
    ]).then(([{ data: enr }, { data: prog }]) => {
      setIsEnrolled(!!enr)
      setCompletedIds(new Set((prog || []).map(r => r.lesson_id)))
    })
  }, [session, courseId])

  async function handleEnroll() {
    if (!session) { onLoginRequired(); return }
    setEnrolling(true)
    const { error } = await supabase.from('enrollments')
      .insert({ user_id: session.user.id, course_id: courseId })
    if (!error) {
      setIsEnrolled(true)
      // Jump straight to first lesson
      if (lessons.length > 0) navigate(`/courses/${courseId}/lessons/${lessons[0].id}`)
    }
    setEnrolling(false)
  }

  if (loading || !course) {
    return (
      <main className="max-w-3xl mx-auto px-6 py-12 animate-pulse space-y-4">
        <div className="h-4 w-32 bg-surface-container-high rounded" />
        <div className="h-10 w-2/3 bg-surface-container-high rounded" />
        <div className="h-4 w-full bg-surface-container-high rounded" />
        <div className="h-4 w-5/6 bg-surface-container-high rounded" />
      </main>
    )
  }

  const color     = LEVEL_COLOR[course.level] || '#95ccff'
  const totalDone = lessons.filter(l => completedIds.has(l.id)).length
  const progress  = lessons.length > 0 ? Math.round((totalDone / lessons.length) * 100) : 0
  const nextLesson = lessons.find(l => !completedIds.has(l.id)) ?? lessons[0]

  return (
    <main className="max-w-3xl mx-auto px-6 py-12">

      {/* Breadcrumb */}
      <Link to="/courses" className="flex items-center gap-1 text-sm text-on-surface-variant hover:text-primary transition-colors mb-8">
        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
        {t('courseDetail.allCourses')}
      </Link>

      {/* Header */}
      <div className="glass-panel rounded-2xl p-6 mb-8">
        <div className="flex gap-2 flex-wrap mb-4">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{ color, backgroundColor: color + '18', border: `1px solid ${color}35` }}>
            {course.level}
          </span>
          <span className="text-xs text-on-surface-variant bg-surface-variant/40 px-2.5 py-1 rounded-full border border-outline-variant/20">
            {course.subject}
          </span>
          <span className="text-xs text-on-surface-variant bg-surface-variant/40 px-2.5 py-1 rounded-full border border-outline-variant/20">
            {lessons.length} {t('courseDetail.lessons')}
          </span>
        </div>

        {course.mentor?.full_name && (
          <p className="text-sm text-on-surface-variant mb-2 flex items-center gap-2">
            {course.mentor.avatar_url ? (
              <img src={course.mentor.avatar_url} alt="" className="w-6 h-6 rounded-full object-cover" />
            ) : (
              <span className="w-6 h-6 rounded-full gradient-btn flex items-center justify-center text-[10px] font-bold text-white">
                {course.mentor.full_name[0]}
              </span>
            )}
            {t('mentor.by')} {course.mentor.full_name}
          </p>
        )}

        <h1 className="text-2xl sm:text-3xl font-bold text-on-surface mb-3">{course.title}</h1>
        <p className="text-on-surface-variant leading-relaxed mb-6">{course.description}</p>

        {/* Enroll / Progress */}
        {isEnrolled ? (
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm text-on-surface-variant mb-2">
                <span>{totalDone}/{lessons.length} {t('courseDetail.lessonsCompleted')}</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all"
                  style={{ width: `${progress}%`, background: 'linear-gradient(135deg,#2E9BE6,#27D8B0)' }} />
              </div>
            </div>
            {nextLesson && progress < 100 && (
              <Link
                to={`/courses/${courseId}/lessons/${nextLesson.id}`}
                className="gradient-btn text-sm font-semibold text-white px-6 py-2.5 rounded-lg inline-flex items-center gap-2 hover:opacity-90 transition-opacity"
              >
                {totalDone === 0 ? t('courseDetail.startCourse') : t('courseDetail.continue')}
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>
            )}
            {progress === 100 && (
              <div className="flex items-center gap-2 text-secondary">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                <span className="text-sm font-semibold">{t('courseDetail.completed')}</span>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={handleEnroll}
            disabled={enrolling}
            className="gradient-btn text-sm font-semibold text-white px-8 py-3 rounded-lg inline-flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {enrolling ? t('courseDetail.enrolling') : t('courseDetail.enrollFree')}
            {!enrolling && <span className="material-symbols-outlined text-[18px]">add</span>}
          </button>
        )}
      </div>

      {/* Lesson list */}
      <div>
        <h2 className="text-lg font-semibold text-on-surface mb-4">{t('courseDetail.lessons')}</h2>
        <div className="space-y-2">
          {lessons.map((lesson, idx) => {
            const done = completedIds.has(lesson.id)
            const locked = !isEnrolled

            return (
              <div key={lesson.id}>
                {locked ? (
                  <div className="level-1-card rounded-xl px-5 py-4 flex items-center gap-4 opacity-60 cursor-not-allowed">
                    <span className="text-sm font-medium text-on-surface-variant w-6 text-center">{idx + 1}</span>
                    <span className="text-sm font-medium text-on-surface flex-1">{lesson.title}</span>
                    <span className="material-symbols-outlined text-[20px] text-outline">lock</span>
                  </div>
                ) : (
                  <Link
                    to={`/courses/${courseId}/lessons/${lesson.id}`}
                    className={`level-1-card rounded-xl px-5 py-4 flex items-center gap-4 hover:border-primary/30 transition-colors border ${done ? 'border-secondary/20' : 'border-transparent'}`}
                  >
                    <span className="text-sm font-medium text-on-surface-variant w-6 text-center shrink-0">{idx + 1}</span>
                    <span className="text-sm font-medium text-on-surface flex-1">{lesson.title}</span>
                    {done ? (
                      <span className="material-symbols-outlined text-[22px] text-secondary shrink-0"
                        style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    ) : (
                      <span className="material-symbols-outlined text-[22px] text-outline shrink-0">play_circle</span>
                    )}
                  </Link>
                )}
              </div>
            )
          })}
        </div>
      </div>

    </main>
  )
}
