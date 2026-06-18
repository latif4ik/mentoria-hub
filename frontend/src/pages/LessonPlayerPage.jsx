import { useState, useEffect, useMemo, useRef } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useLocale } from '../i18n/LocaleContext'

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5)
}

function getEmbedUrl(url) {
  if (!url) return null
  const params = 'rel=0&enablejsapi=1&origin=' + encodeURIComponent(window.location.origin)
  if (url.includes('youtube.com/embed/')) return url.split('?')[0] + '?' + params
  const short   = url.match(/youtu\.be\/([^?&]+)/)
  if (short)   return `https://www.youtube.com/embed/${short[1]}?${params}`
  const shorts  = url.match(/youtube\.com\/shorts\/([^?&]+)/)
  if (shorts)  return `https://www.youtube.com/embed/${shorts[1]}?${params}`
  const watch   = url.match(/[?&]v=([^&]+)/)
  if (watch)   return `https://www.youtube.com/embed/${watch[1]}?${params}`
  return null
}

function timeToSeconds(ts) {
  const parts = ts.split(':').map(Number)
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]
  return parts[0] * 60 + parts[1]
}

// Renders text with MM:SS timestamps as clickable buttons
function TimestampText({ text, onSeek }) {
  const { t } = useLocale()
  if (!text) return null
  const parts = text.split(/((?:\d{1,2}:)?\d{1,2}:\d{2})/)
  return (
    <>
      {parts.map((part, i) => {
        if (/^(?:\d{1,2}:)?\d{1,2}:\d{2}$/.test(part)) {
          return (
            <button
              key={i}
              onClick={() => onSeek(part)}
              className="inline-flex items-center gap-0.5 text-primary font-medium hover:underline cursor-pointer"
              title={`${t('lesson.jumpTo')} ${part}`}
            >
              <span className="material-symbols-outlined text-[14px]">play_circle</span>
              {part}
            </button>
          )
        }
        return <span key={i}>{part}</span>
      })}
    </>
  )
}

// ─── Quiz ─────────────────────────────────────────────────────
function Quiz({ questions, lessonId, session, onLoginRequired, existingScore, onComplete }) {
  const { t } = useLocale()
  const [selected, setSelected]   = useState({})
  const [submitted, setSubmitted] = useState(!!existingScore)
  const [score, setScore]         = useState(existingScore ?? null)
  const [saving, setSaving]       = useState(false)

  const allAnswered = questions.length > 0 && questions.every((_, i) => selected[i] !== undefined)

  async function handleSubmit() {
    if (!session) { onLoginRequired(); return }
    const correct = questions.reduce((n, q, i) => n + (selected[i] === q.correct_index ? 1 : 0), 0)
    const pct     = Math.round((correct / questions.length) * 100)
    setSaving(true)
    await supabase.from('lesson_progress').upsert({
      user_id:      session.user.id,
      lesson_id:    lessonId,
      completed:    true,
      quiz_score:   pct,
      completed_at: new Date().toISOString(),
    })
    setSaving(false)
    setScore(pct)
    setSubmitted(true)
    onComplete(pct)
  }

  return (
    <div>
      {/* Score banner */}
      {submitted && score !== null && (
        <div className={`rounded-xl p-4 mb-6 flex items-center gap-3 ${score >= 70 ? 'bg-secondary/10 border border-secondary/20' : 'bg-tertiary/10 border border-tertiary/20'}`}>
          <span className="material-symbols-outlined text-[28px]" style={{ color: score >= 70 ? '#41e7be' : '#ffb960', fontVariationSettings: "'FILL' 1" }}>
            {score >= 70 ? 'check_circle' : 'info'}
          </span>
          <div>
            <p className="text-sm font-bold text-on-surface">
              {score >= 70 ? `${t('lesson.greatJob')} ${score}%` : `${t('lesson.scored')} ${score}% ${t('lesson.keepPractising')}`}
            </p>
            <p className="text-xs text-on-surface-variant">
              {questions.filter((q, i) => selected[i] === q.correct_index).length} / {questions.length} {t('lesson.correct')}
            </p>
          </div>
        </div>
      )}

      {/* Questions */}
      <div className="space-y-8">
        {questions.map((q, qi) => {
          const isCorrect   = submitted && selected[qi] === q.correct_index
          const isWrong     = submitted && selected[qi] !== q.correct_index && selected[qi] !== undefined

          return (
            <div key={q.id} className={`rounded-xl p-5 border transition-colors ${
              submitted
                ? isCorrect ? 'border-secondary/30 bg-secondary/5' : isWrong ? 'border-error/30 bg-error/5' : 'border-outline-variant/20'
                : 'border-outline-variant/20 level-1-card'
            }`}>
              <p className="text-sm font-semibold text-on-surface mb-4">
                <span className="text-on-surface-variant mr-2">Q{qi + 1}.</span>{q.question}
              </p>
              <div className="space-y-2">
                {q.options.map((opt, oi) => {
                  const isThisCorrect  = oi === q.correct_index
                  const isThisSelected = selected[qi] === oi
                  let optStyle = 'border-outline-variant/30 text-on-surface-variant'
                  if (submitted) {
                    if (isThisCorrect)                  optStyle = 'border-secondary/50 bg-secondary/10 text-secondary'
                    else if (isThisSelected && !isThisCorrect) optStyle = 'border-error/50 bg-error/10 text-error'
                  } else if (isThisSelected) {
                    optStyle = 'border-primary bg-primary/10 text-primary'
                  }

                  return (
                    <button
                      key={oi}
                      disabled={submitted}
                      onClick={() => setSelected(s => ({ ...s, [qi]: oi }))}
                      className={`w-full text-left text-sm px-4 py-3 rounded-lg border transition-all duration-150 ${optStyle} ${!submitted ? 'hover:border-outline hover:text-on-surface' : ''}`}
                    >
                      <span className="font-medium mr-2">{String.fromCharCode(65 + oi)}.</span>{opt}
                    </button>
                  )
                })}
              </div>
              {submitted && q.explanation && (
                <p className="text-xs text-on-surface-variant mt-3 pl-1 border-l-2 border-outline-variant/30">
                  {q.explanation}
                </p>
              )}
            </div>
          )
        })}
      </div>

      {/* Submit */}
      {!submitted && (
        <button
          onClick={handleSubmit}
          disabled={!allAnswered || saving}
          className="gradient-btn mt-8 text-sm font-semibold text-white px-8 py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {saving ? t('lesson.saving') : t('lesson.submitQuiz')}
          {!saving && <span className="material-symbols-outlined text-[18px]">check</span>}
        </button>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────
export default function LessonPlayerPage({ session, onLoginRequired }) {
  const { courseId, lessonId } = useParams()
  const navigate = useNavigate()
  const iframeRef = useRef(null)
  const { t } = useLocale()

  const [lesson, setLesson]         = useState(null)
  const [course, setCourse]         = useState(null)
  const [allLessons, setAllLessons] = useState([])
  const [questions, setQuestions]   = useState([])
  const [existingScore, setExistingScore] = useState(null)
  const [completed, setCompleted]   = useState(false)
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const [{ data: l }, { data: qs }] = await Promise.all([
        supabase.from('lessons').select('*').eq('id', lessonId).single(),
        supabase.from('quiz_questions').select('*').eq('lesson_id', lessonId),
      ])
      if (!l) { navigate('/courses'); return }
      setLesson(l)
      setQuestions(shuffle(qs || []).slice(0, 5))

      const [{ data: c }, { data: ls }] = await Promise.all([
        supabase.from('courses').select('id, title').eq('id', l.course_id).single(),
        supabase.from('lessons').select('id, title, position').eq('course_id', l.course_id).order('position'),
      ])
      setCourse(c)
      setAllLessons(ls || [])
      setLoading(false)
    }
    load()
  }, [lessonId, courseId, navigate])

  useEffect(() => {
    if (!session || !lessonId) return
    supabase.from('lesson_progress').select('completed, quiz_score').eq('user_id', session.user.id).eq('lesson_id', lessonId).maybeSingle()
      .then(({ data }) => {
        if (data?.completed) { setCompleted(true); setExistingScore(data.quiz_score) }
      })
  }, [session, lessonId])

  const embedUrl = useMemo(() => lesson ? getEmbedUrl(lesson.video_url) : null, [lesson])
  const currentIdx = allLessons.findIndex(l => l.id === lessonId)
  const prevLesson = allLessons[currentIdx - 1]
  const nextLesson = allLessons[currentIdx + 1]

  function seekTo(timestamp) {
    const seconds = timeToSeconds(timestamp)
    if (iframeRef.current) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: 'seekTo', args: [seconds, true] }),
        'https://www.youtube.com'
      )
      iframeRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  if (loading) {
    return (
      <main className="max-w-3xl mx-auto px-6 py-12 animate-pulse space-y-4">
        <div className="h-4 w-48 bg-surface-container-high rounded" />
        <div className="h-8 w-2/3 bg-surface-container-high rounded" />
        <div className="w-full aspect-video bg-surface-container-high rounded-xl" />
      </main>
    )
  }

  return (
    <main className="max-w-3xl mx-auto px-6 py-12">

      {/* Breadcrumb */}
      <Link to={`/courses/${courseId}`} className="flex items-center gap-1 text-sm text-on-surface-variant hover:text-primary transition-colors mb-6">
        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
        {course?.title}
      </Link>

      {/* Lesson nav */}
      <div className="flex items-center justify-between mb-6 text-xs text-on-surface-variant">
        <span>{t('courses.lesson')} {currentIdx + 1} {t('lesson.of')} {allLessons.length}</span>
        {completed && (
          <span className="flex items-center gap-1 text-secondary font-semibold">
            <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            {t('lesson.completed')}
          </span>
        )}
      </div>

      {/* Title */}
      <h1 className="text-2xl sm:text-3xl font-bold text-on-surface mb-8">{lesson.title}</h1>

      {/* Video */}
      <div className="mb-8">
        {embedUrl ? (
          <iframe
            ref={iframeRef}
            src={embedUrl}
            title={lesson.title}
            className="w-full aspect-video rounded-xl border border-outline-variant/20"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div className="w-full aspect-video bg-surface-container rounded-xl border border-outline-variant/20 flex flex-col items-center justify-center gap-2">
            <span className="material-symbols-outlined text-[48px] text-outline">play_circle</span>
            <p className="text-sm text-on-surface-variant">{t('lesson.noVideo')}</p>
          </div>
        )}
      </div>

      {/* Summary */}
      {lesson.summary && (
        <div className="glass-panel rounded-xl p-5 mb-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-primary mb-2">{t('lesson.summary')}</h2>
          <p className="text-sm text-on-surface-variant leading-relaxed">{lesson.summary}</p>
        </div>
      )}

      {/* Content with clickable timestamps */}
      {lesson.content && (
        <div className="mb-10">
          <h2 className="text-lg font-semibold text-on-surface mb-3">{t('lesson.notes')}</h2>
          <p className="text-sm text-on-surface-variant leading-relaxed whitespace-pre-line">
            <TimestampText text={lesson.content} onSeek={seekTo} />
          </p>
        </div>
      )}

      {/* Quiz */}
      {questions.length > 0 && (
        <div className="border-t border-outline-variant/10 pt-10 mb-10">
          <h2 className="text-lg font-semibold text-on-surface mb-1">{t('lesson.quiz')}</h2>
          <p className="text-sm text-on-surface-variant mb-6">{questions.length} {t('lesson.questions')} — {t('lesson.testUnderstanding')}</p>
          <Quiz
            questions={questions}
            lessonId={lessonId}
            session={session}
            onLoginRequired={onLoginRequired}
            existingScore={existingScore}
            onComplete={(pct) => { setCompleted(true); setExistingScore(pct) }}
          />
        </div>
      )}

      {/* Prev / Next */}
      <div className="flex justify-between items-center border-t border-outline-variant/10 pt-6">
        {prevLesson ? (
          <Link to={`/courses/${courseId}/lessons/${prevLesson.id}`}
            className="flex items-center gap-2 text-sm font-medium text-on-surface-variant hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            {prevLesson.title}
          </Link>
        ) : <div />}

        {nextLesson ? (
          <Link to={`/courses/${courseId}/lessons/${nextLesson.id}`}
            className="flex items-center gap-2 text-sm font-semibold text-primary hover:opacity-80 transition-opacity">
            {nextLesson.title}
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </Link>
        ) : (
          <Link to={`/courses/${courseId}`}
            className="flex items-center gap-2 text-sm font-semibold text-secondary hover:opacity-80 transition-opacity">
            {t('lesson.finishCourse')}
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
          </Link>
        )}
      </div>

    </main>
  )
}
