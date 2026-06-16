import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { generateLesson } from '../api'

// ─── Enums ────────────────────────────────────────────────────
const CATEGORIES = ['Competition', 'Scholarship', 'Internship', 'Summer School', 'Olympiad']
const DIRECTIONS = ['STEM', 'Humanities', 'Arts', 'Business', 'General']
const FORMATS     = ['Online', 'In-person', 'Hybrid']
const SUBJECTS    = ['English', 'Physics', 'Economics', 'Mathematics', 'Chemistry', 'Biology', 'History', 'Computer Science']
const LEVELS      = ['Beginner', 'Intermediate', 'Advanced']

// ─── Form field definitions ───────────────────────────────────
const OPP_FIELDS = [
  { key: 'title',       label: 'Title',       type: 'text',     required: true },
  { key: 'description', label: 'Description', type: 'textarea', required: true },
  { key: 'category',    label: 'Category',    type: 'select',   options: CATEGORIES, required: true },
  { key: 'direction',   label: 'Direction',   type: 'select',   options: DIRECTIONS, required: true },
  { key: 'format',      label: 'Format',      type: 'select',   options: FORMATS,    required: true },
  { key: 'deadline',    label: 'Deadline',    type: 'date',     required: true },
  { key: 'link',        label: 'Apply Link',  type: 'url' },
  { key: 'tags',        label: 'Tags',        type: 'text',     hint: 'Comma-separated, e.g. STEM, math' },
]

const COURSE_FIELDS = [
  { key: 'title',       label: 'Title',       type: 'text',     required: true },
  { key: 'description', label: 'Description', type: 'textarea', required: true },
  { key: 'subject',     label: 'Subject',     type: 'select',   options: SUBJECTS, required: true },
  { key: 'level',       label: 'Level',       type: 'select',   options: LEVELS,   required: true },
  { key: 'tags',        label: 'Tags',        type: 'text',     hint: 'Comma-separated' },
]

const LESSON_FIELDS = [
  { key: 'title',     label: 'Title',         type: 'text',     required: true },
  { key: 'position',  label: 'Position',      type: 'number',   required: true, hint: 'Order in the course (1, 2, 3…)' },
  { key: 'video_url', label: 'YouTube URL',   type: 'url',      hint: 'Public YouTube watch URL' },
  { key: 'summary',   label: 'Summary',       type: 'textarea' },
  { key: 'content',   label: 'Lesson Notes',  type: 'textarea' },
]

// Formats AI-returned notes into readable lesson content
function formatNotes(notes) {
  const lines = []
  if (notes.key_points?.length) {
    lines.push('Key Points:')
    notes.key_points.forEach(p => lines.push(`• ${p}`))
  }
  if (notes.outline?.length) {
    lines.push('', 'Outline:')
    notes.outline.forEach(o => lines.push(`${o.timestamp} — ${o.topic}`))
  }
  return lines.join('\n')
}

// ─── Shared input component ───────────────────────────────────
function Field({ def, value, onChange }) {
  const base = 'w-full bg-surface-container text-on-surface text-sm rounded-lg px-3 py-2.5 border border-outline-variant/30 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder-on-surface-variant/40'
  if (def.type === 'select') {
    return (
      <select value={value ?? ''} onChange={e => onChange(e.target.value)} className={base}>
        <option value="">Select {def.label}</option>
        {def.options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    )
  }
  if (def.type === 'textarea') {
    return (
      <textarea
        rows={4}
        value={value ?? ''}
        onChange={e => onChange(e.target.value)}
        placeholder={def.hint}
        className={`${base} resize-y min-h-[90px]`}
      />
    )
  }
  return (
    <input
      type={def.type}
      value={value ?? ''}
      onChange={e => onChange(e.target.value)}
      placeholder={def.hint}
      className={base}
    />
  )
}

// ─── Modal (create / edit) ────────────────────────────────────
function Modal({ title, fields, initial, onSave, onClose, saving }) {
  const [form, setForm] = useState(() => {
    const base = {}
    fields.forEach(f => { base[f.key] = initial?.[f.key] ?? '' })
    // tags array → comma string
    if (Array.isArray(base.tags)) base.tags = base.tags.join(', ')
    return base
  })

  function set(key, val) { setForm(prev => ({ ...prev, [key]: val })) }

  function handleSave() {
    const data = { ...form }
    // convert tags back to array
    if ('tags' in data) {
      data.tags = data.tags ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : []
    }
    if ('position' in data) data.position = parseInt(data.position) || 1
    onSave(data)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface-container rounded-2xl shadow-2xl border border-outline-variant/20 w-full max-w-lg max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/10 shrink-0">
          <h3 className="text-base font-semibold text-on-surface">{title}</h3>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface transition-colors">
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
          {fields.map(f => (
            <div key={f.key}>
              <label className="block text-xs font-semibold text-on-surface-variant mb-1.5 uppercase tracking-wide">
                {f.label}{f.required && <span className="text-error ml-0.5">*</span>}
              </label>
              <Field def={f} value={form[f.key]} onChange={v => set(f.key, v)} />
              {f.hint && f.type !== 'textarea' && f.type !== 'select' && (
                <p className="text-xs text-on-surface-variant mt-1">{f.hint}</p>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-outline-variant/10 shrink-0">
          <button onClick={onClose} className="text-sm font-medium text-on-surface-variant hover:text-on-surface px-4 py-2 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="gradient-btn text-sm font-semibold text-white px-6 py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Lesson modal (with AI generation) ───────────────────────
function LessonModal({ initial, onSave, onClose, saving }) {
  const [form, setForm] = useState(() => {
    const base = {}
    LESSON_FIELDS.forEach(f => { base[f.key] = initial?.[f.key] ?? '' })
    return base
  })
  const [generating, setGenerating] = useState(false)
  const [genError, setGenError]     = useState(null)
  const [genQuiz, setGenQuiz]       = useState(null)

  function set(key, val) { setForm(prev => ({ ...prev, [key]: val })) }

  async function handleGenerate() {
    setGenerating(true)
    setGenError(null)
    setGenQuiz(null)
    try {
      const result = await generateLesson(form.video_url)
      const { notes, quiz } = result
      setForm(prev => ({
        ...prev,
        title:   prev.title || notes.title || prev.title,
        summary: notes.summary || prev.summary,
        content: formatNotes(notes),
      }))
      setGenQuiz(quiz || [])
    } catch (e) {
      setGenError(e.message || 'AI generation failed. Make sure the backend is running and the video is public.')
    } finally {
      setGenerating(false)
    }
  }

  function handleSave() {
    const data = { ...form, position: parseInt(form.position) || 1 }
    onSave(data, genQuiz)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface-container rounded-2xl shadow-2xl border border-outline-variant/20 w-full max-w-lg max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/10 shrink-0">
          <h3 className="text-base font-semibold text-on-surface">{initial ? 'Edit Lesson' : 'New Lesson'}</h3>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface transition-colors">
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
          {LESSON_FIELDS.map(f => (
            <div key={f.key}>
              <label className="block text-xs font-semibold text-on-surface-variant mb-1.5 uppercase tracking-wide">
                {f.label}{f.required && <span className="text-error ml-0.5">*</span>}
              </label>
              <Field def={f} value={form[f.key]} onChange={v => set(f.key, v)} />

              {/* AI generate button — shown under video_url */}
              {f.key === 'video_url' && (
                <div className="mt-2 space-y-1.5">
                  <button
                    type="button"
                    onClick={handleGenerate}
                    disabled={!form.video_url || generating}
                    className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg border border-mint/40 text-mint hover:bg-mint/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {generating ? (
                      <>
                        <div className="w-3 h-3 border border-mint border-t-transparent rounded-full animate-spin" />
                        Generating… (30–60 s)
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                        Generate with AI
                      </>
                    )}
                  </button>

                  {genError && (
                    <p className="text-xs text-error">{genError}</p>
                  )}
                  {genQuiz && genQuiz.length > 0 && (
                    <p className="text-xs text-secondary flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">check_circle</span>
                      {genQuiz.length} quiz questions ready to save
                    </p>
                  )}
                </div>
              )}

              {f.hint && f.type !== 'textarea' && f.type !== 'select' && f.key !== 'video_url' && (
                <p className="text-xs text-on-surface-variant mt-1">{f.hint}</p>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-outline-variant/10 shrink-0">
          <button onClick={onClose} className="text-sm font-medium text-on-surface-variant hover:text-on-surface px-4 py-2 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || generating}
            className="gradient-btn text-sm font-semibold text-white px-6 py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Delete confirm ───────────────────────────────────────────
function DeleteConfirm({ name, onConfirm, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface-container rounded-2xl shadow-2xl border border-outline-variant/20 p-6 w-full max-w-sm text-center">
        <span className="material-symbols-outlined text-[40px] text-error mb-3 block">delete_forever</span>
        <h3 className="text-base font-semibold text-on-surface mb-1">Delete "{name}"?</h3>
        <p className="text-sm text-on-surface-variant mb-6">This cannot be undone.</p>
        <div className="flex gap-3 justify-center">
          <button onClick={onClose} className="px-5 py-2 text-sm font-medium text-on-surface-variant border border-outline-variant/30 rounded-lg hover:bg-surface-container-high transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm} className="px-5 py-2 text-sm font-semibold text-white bg-error rounded-lg hover:opacity-90 transition-opacity">
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Table row action buttons ─────────────────────────────────
function RowActions({ onEdit, onDelete }) {
  return (
    <div className="flex items-center gap-1 shrink-0">
      <button onClick={onEdit} className="p-1.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-colors">
        <span className="material-symbols-outlined text-[18px]">edit</span>
      </button>
      <button onClick={onDelete} className="p-1.5 rounded-lg text-on-surface-variant hover:text-error hover:bg-error/10 transition-colors">
        <span className="material-symbols-outlined text-[18px]">delete</span>
      </button>
    </div>
  )
}

// ─── Opportunities tab ────────────────────────────────────────
function OpportunitiesTab() {
  const [items, setItems]     = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal]     = useState(null) // null | { item }
  const [confirm, setConfirm] = useState(null) // null | item
  const [saving, setSaving]   = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('opportunities').select('*').order('deadline')
    setItems(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function save(data) {
    setSaving(true)
    if (modal.item?.id) {
      await supabase.from('opportunities').update(data).eq('id', modal.item.id)
    } else {
      await supabase.from('opportunities').insert(data)
    }
    setSaving(false)
    setModal(null)
    load()
  }

  async function del(item) {
    await supabase.from('opportunities').delete().eq('id', item.id)
    setConfirm(null)
    load()
  }

  const days = (d) => Math.ceil((new Date(d) - new Date()) / 86400000)

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-on-surface-variant">{items.length} opportunities</p>
        <button onClick={() => setModal({ item: null })} className="gradient-btn text-sm font-semibold text-white px-4 py-2 rounded-lg flex items-center gap-1 hover:opacity-90 transition-opacity">
          <span className="material-symbols-outlined text-[18px]">add</span>
          Add Opportunity
        </button>
      </div>

      {loading ? (
        <div className="space-y-2 animate-pulse">
          {[1,2,3].map(i => <div key={i} className="h-14 bg-surface-container rounded-xl" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-on-surface-variant">No opportunities yet.</div>
      ) : (
        <div className="space-y-2">
          {items.map(item => {
            const d = days(item.deadline)
            return (
              <div key={item.id} className="level-1-card rounded-xl px-4 py-3 flex items-center gap-3">
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 shrink-0">
                  {item.category}
                </span>
                <p className="text-sm font-medium text-on-surface flex-1 truncate">{item.title}</p>
                <span className={`text-xs shrink-0 ${d <= 0 ? 'text-outline' : d <= 7 ? 'text-error' : 'text-on-surface-variant'}`}>
                  {d <= 0 ? 'Closed' : `${d}d`}
                </span>
                <span className="text-xs text-on-surface-variant shrink-0 hidden sm:block">{item.format}</span>
                <RowActions onEdit={() => setModal({ item })} onDelete={() => setConfirm(item)} />
              </div>
            )
          })}
        </div>
      )}

      {modal && (
        <Modal
          title={modal.item ? 'Edit Opportunity' : 'New Opportunity'}
          fields={OPP_FIELDS}
          initial={modal.item}
          onSave={save}
          onClose={() => setModal(null)}
          saving={saving}
        />
      )}

      {confirm && (
        <DeleteConfirm
          name={confirm.title}
          onConfirm={() => del(confirm)}
          onClose={() => setConfirm(null)}
        />
      )}
    </div>
  )
}

// ─── Lessons panel (inside Courses tab) ──────────────────────
function LessonsPanel({ course, onBack }) {
  const [items, setItems]     = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal]     = useState(null) // null | { item }
  const [confirm, setConfirm] = useState(null)
  const [saving, setSaving]   = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('lessons').select('*').eq('course_id', course.id).order('position')
    setItems(data || [])
    setLoading(false)
  }, [course.id])

  useEffect(() => { load() }, [load])

  // generatedQuiz is the AI quiz bank (may be null if not generated)
  async function save(data, generatedQuiz) {
    setSaving(true)
    let lessonId = modal.item?.id

    if (lessonId) {
      await supabase.from('lessons').update({ ...data, course_id: course.id }).eq('id', lessonId)
    } else {
      const { data: newLesson } = await supabase.from('lessons')
        .insert({ ...data, course_id: course.id })
        .select('id')
        .single()
      lessonId = newLesson?.id
    }

    // Save quiz bank if the admin generated one
    if (generatedQuiz?.length && lessonId) {
      await supabase.from('quiz_questions').delete().eq('lesson_id', lessonId)
      await supabase.from('quiz_questions').insert(
        generatedQuiz.map(q => ({
          lesson_id:     lessonId,
          question:      q.question,
          options:       q.options,
          correct_index: q.correct_index,
          explanation:   q.explanation || '',
        }))
      )
    }

    setSaving(false)
    setModal(null)
    load()
  }

  async function del(item) {
    await supabase.from('lessons').delete().eq('id', item.id)
    setConfirm(null)
    load()
  }

  return (
    <div>
      {/* Sub-header */}
      <div className="flex items-center gap-3 mb-4">
        <button onClick={onBack} className="flex items-center gap-1 text-sm text-on-surface-variant hover:text-primary transition-colors">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Courses
        </button>
        <span className="text-on-surface-variant">/</span>
        <span className="text-sm font-semibold text-on-surface truncate">{course.title}</span>
      </div>

      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-on-surface-variant">{items.length} lessons</p>
        <button onClick={() => setModal({ item: null })} className="gradient-btn text-sm font-semibold text-white px-4 py-2 rounded-lg flex items-center gap-1 hover:opacity-90 transition-opacity">
          <span className="material-symbols-outlined text-[18px]">add</span>
          Add Lesson
        </button>
      </div>

      {loading ? (
        <div className="space-y-2 animate-pulse">
          {[1,2,3].map(i => <div key={i} className="h-14 bg-surface-container rounded-xl" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-on-surface-variant">No lessons yet. Add the first one!</div>
      ) : (
        <div className="space-y-2">
          {items.map(item => (
            <div key={item.id} className="level-1-card rounded-xl px-4 py-3 flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-surface-container-high text-xs font-bold text-on-surface-variant flex items-center justify-center shrink-0">
                {item.position}
              </span>
              <p className="text-sm font-medium text-on-surface flex-1 truncate">{item.title}</p>
              {item.video_url ? (
                <span className="material-symbols-outlined text-[18px] text-secondary shrink-0">play_circle</span>
              ) : (
                <span className="material-symbols-outlined text-[18px] text-outline shrink-0">article</span>
              )}
              <RowActions onEdit={() => setModal({ item })} onDelete={() => setConfirm(item)} />
            </div>
          ))}
        </div>
      )}

      {modal && (
        <LessonModal
          initial={modal.item}
          onSave={save}
          onClose={() => setModal(null)}
          saving={saving}
        />
      )}

      {confirm && (
        <DeleteConfirm
          name={confirm.title}
          onConfirm={() => del(confirm)}
          onClose={() => setConfirm(null)}
        />
      )}
    </div>
  )
}

// ─── Courses tab ──────────────────────────────────────────────
function CoursesTab() {
  const [items, setItems]           = useState([])
  const [loading, setLoading]       = useState(true)
  const [modal, setModal]           = useState(null)
  const [confirm, setConfirm]       = useState(null)
  const [saving, setSaving]         = useState(false)
  const [manageCourse, setManageCourse] = useState(null) // drill into lessons

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('courses').select('*, lessons(id)').order('created_at')
    setItems(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function save(data) {
    setSaving(true)
    if (modal.item?.id) {
      await supabase.from('courses').update(data).eq('id', modal.item.id)
    } else {
      await supabase.from('courses').insert(data)
    }
    setSaving(false)
    setModal(null)
    load()
  }

  async function del(item) {
    await supabase.from('courses').delete().eq('id', item.id)
    setConfirm(null)
    load()
  }

  // Drill into lesson management
  if (manageCourse) {
    return <LessonsPanel course={manageCourse} onBack={() => setManageCourse(null)} />
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-on-surface-variant">{items.length} courses</p>
        <button onClick={() => setModal({ item: null })} className="gradient-btn text-sm font-semibold text-white px-4 py-2 rounded-lg flex items-center gap-1 hover:opacity-90 transition-opacity">
          <span className="material-symbols-outlined text-[18px]">add</span>
          Add Course
        </button>
      </div>

      {loading ? (
        <div className="space-y-2 animate-pulse">
          {[1,2,3].map(i => <div key={i} className="h-14 bg-surface-container rounded-xl" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-on-surface-variant">No courses yet.</div>
      ) : (
        <div className="space-y-2">
          {items.map(item => (
            <div key={item.id} className="level-1-card rounded-xl px-4 py-3 flex items-center gap-3">
              <p className="text-sm font-medium text-on-surface flex-1 truncate">{item.title}</p>
              <span className="text-xs text-on-surface-variant shrink-0 hidden sm:block">{item.subject}</span>
              <span className="text-xs text-on-surface-variant shrink-0 hidden sm:block">{item.level}</span>
              <span className="text-xs text-on-surface-variant shrink-0">
                {(item.lessons || []).length} lessons
              </span>
              <button
                onClick={() => setManageCourse(item)}
                className="text-xs font-semibold text-primary border border-primary/30 px-3 py-1 rounded-lg hover:bg-primary/10 transition-colors shrink-0"
              >
                Lessons
              </button>
              <RowActions onEdit={() => setModal({ item })} onDelete={() => setConfirm(item)} />
            </div>
          ))}
        </div>
      )}

      {modal && (
        <Modal
          title={modal.item ? 'Edit Course' : 'New Course'}
          fields={COURSE_FIELDS}
          initial={modal.item}
          onSave={save}
          onClose={() => setModal(null)}
          saving={saving}
        />
      )}

      {confirm && (
        <DeleteConfirm
          name={confirm.title}
          onConfirm={() => del(confirm)}
          onClose={() => setConfirm(null)}
        />
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────
const TABS = [
  { key: 'opportunities', label: 'Opportunities', icon: 'emoji_events' },
  { key: 'courses',       label: 'Courses',       icon: 'school' },
]

export default function AdminPage({ session, profile }) {
  const [tab, setTab] = useState('opportunities')

  // Not logged in
  if (!session) {
    return (
      <main className="max-w-desktop mx-auto px-6 py-24 text-center">
        <span className="material-symbols-outlined text-[48px] text-outline block mb-3">lock</span>
        <h2 className="text-xl font-semibold text-on-surface">Sign in to access admin</h2>
      </main>
    )
  }

  // Not admin
  if (profile && profile.role !== 'admin') {
    return (
      <main className="max-w-desktop mx-auto px-6 py-24 text-center">
        <span className="material-symbols-outlined text-[48px] text-outline block mb-3">block</span>
        <h2 className="text-xl font-semibold text-on-surface">Access denied</h2>
        <p className="text-on-surface-variant mt-2 text-sm">This area is for admins only.</p>
        <Link to="/" className="mt-6 inline-block text-sm font-semibold text-primary hover:opacity-80 transition-opacity">← Back to home</Link>
      </main>
    )
  }

  // Still loading profile — wait silently
  if (!profile) {
    return (
      <main className="max-w-desktop mx-auto px-6 py-24 text-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
      </main>
    )
  }

  return (
    <main className="max-w-desktop mx-auto px-6 py-10">

      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-on-surface">Admin Panel</h1>
          <p className="text-on-surface-variant mt-1 text-sm">Manage content on Mentoria Hub</p>
        </div>
        <span className="ml-auto text-xs font-semibold px-3 py-1 rounded-full bg-tertiary/10 text-tertiary border border-tertiary/20">
          Admin
        </span>
      </div>

      {/* Tab strip */}
      <div className="flex gap-1 mb-6 bg-surface-container rounded-xl p-1 w-fit">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg transition-all ${
              tab === t.key
                ? 'bg-primary text-white shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="glass-panel rounded-2xl p-5">
        {tab === 'opportunities' && <OpportunitiesTab />}
        {tab === 'courses'       && <CoursesTab />}
      </div>

    </main>
  )
}
