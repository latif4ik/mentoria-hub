import { useState, useRef } from 'react'
import { supabase } from '../supabaseClient'

const INTERESTS = [
  { value: 'STEM',          label: 'STEM' },
  { value: 'Business',      label: 'Business' },
  { value: 'Finance',       label: 'Finance' },
  { value: 'Coding',        label: 'Coding' },
  { value: 'Science',       label: 'Science' },
  { value: 'Social Impact', label: 'Social Impact' },
]
const SUBJECTS = [
  { value: 'Math',      label: 'Math' },
  { value: 'English',   label: 'English' },
  { value: 'Physics',   label: 'Physics' },
  { value: 'Biology',   label: 'Biology' },
  { value: 'Economics', label: 'Economics' },
  { value: 'CS',        label: 'Computer Science' },
  { value: 'SAT/IELTS', label: 'SAT / IELTS Prep' },
]
const GOALS = [
  { value: 'University prep', label: 'University Prep' },
  { value: 'Competitions',    label: 'Win Competitions' },
  { value: 'Scholarships',    label: 'Get Scholarships' },
  { value: 'Skill building',  label: 'Build Skills' },
]
const GRADES = [8, 9, 10, 11]

function ChipGroup({ label, options, selected, onChange }) {
  function toggle(val) {
    onChange(selected.includes(val) ? selected.filter(v => v !== val) : [...selected, val])
  }
  return (
    <div>
      <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-2">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map(({ value, label: lbl }) => {
          const active = selected.includes(value)
          return (
            <button
              key={value}
              type="button"
              onClick={() => toggle(value)}
              className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${
                active
                  ? 'bg-primary/15 text-primary border-primary/50'
                  : 'border-outline-variant/30 text-on-surface-variant hover:border-outline hover:text-on-surface'
              }`}
            >
              {lbl}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function ProfileModal({ session, profile, onSave, onClose }) {
  const nameParts = (profile?.full_name || '').split(' ')

  const [firstName, setFirstName] = useState(nameParts[0] || '')
  const [lastName,  setLastName]  = useState(nameParts.slice(1).join(' ') || '')
  const [grade,     setGrade]     = useState(profile?.grade ?? '')
  const [interests, setInterests] = useState(profile?.interests || [])
  const [subjects,  setSubjects]  = useState(profile?.subjects  || [])
  const [goals,     setGoals]     = useState(profile?.goals     || [])
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || null)
  const [uploading, setUploading] = useState(false)
  const [saving,    setSaving]    = useState(false)
  const [error,     setError]     = useState('')

  const fileRef = useRef()

  async function handleAvatarChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError('')
    const ext  = file.name.split('.').pop()
    const path = `${session.user.id}/avatar.${ext}`
    const { error: uploadErr } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true })
    if (uploadErr) {
      setError('Photo upload failed — make sure the "avatars" storage bucket exists in Supabase Storage with public access.')
      setUploading(false)
      return
    }
    const { data } = supabase.storage.from('avatars').getPublicUrl(path)
    setAvatarUrl(data.publicUrl)
    setUploading(false)
  }

  async function handleSave() {
    setSaving(true)
    setError('')
    const updates = {
      id:         session.user.id,
      full_name:  [firstName.trim(), lastName.trim()].filter(Boolean).join(' ') || null,
      grade:      grade !== '' ? Number(grade) : null,
      interests,
      subjects,
      goals,
      avatar_url: avatarUrl,
    }
    const { data, error: err } = await supabase
      .from('profiles')
      .upsert(updates)
      .select()
      .single()
    if (err) {
      setError('Save failed: ' + err.message)
      setSaving(false)
    } else {
      onSave(data)
      onClose()
    }
  }

  const displayInitial = (
    firstName?.[0] ||
    profile?.full_name?.[0] ||
    session?.user?.email?.[0] ||
    '?'
  ).toUpperCase()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal card */}
      <div className="relative bg-surface-container rounded-2xl shadow-2xl border border-outline-variant/15 w-full max-w-lg flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/10 shrink-0">
          <h2 className="text-base font-semibold text-on-surface">Edit Profile</h2>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface transition-colors">
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-6">

          {/* Avatar */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Profile"
                  className="w-20 h-20 rounded-full object-cover ring-2 ring-primary/30"
                />
              ) : (
                <div className="w-20 h-20 rounded-full gradient-btn flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">{displayInitial}</span>
                </div>
              )}
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                title="Change photo"
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-surface-container-high border border-outline-variant/30 flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-all"
              >
                <span className="material-symbols-outlined text-[14px]">
                  {uploading ? 'hourglass_empty' : 'photo_camera'}
                </span>
              </button>
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            <p className="text-xs text-on-surface-variant">Click the camera icon to change your photo</p>
          </div>

          {/* Name fields */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-1.5">
                First Name
              </label>
              <input
                type="text"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                placeholder="Aibek"
                className="w-full bg-surface-container-high text-on-surface text-sm rounded-lg px-3 py-2.5 border border-outline-variant/30 focus:outline-none focus:border-primary transition-colors placeholder:text-on-surface-variant/40"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-1.5">
                Last Name
              </label>
              <input
                type="text"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                placeholder="Seitkali"
                className="w-full bg-surface-container-high text-on-surface text-sm rounded-lg px-3 py-2.5 border border-outline-variant/30 focus:outline-none focus:border-primary transition-colors placeholder:text-on-surface-variant/40"
              />
            </div>
          </div>

          {/* Grade */}
          <div>
            <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-2">Grade</p>
            <div className="flex gap-2">
              {GRADES.map(g => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGrade(g)}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition-all ${
                    grade === g
                      ? 'bg-primary/15 text-primary border-primary/50'
                      : 'border-outline-variant/30 text-on-surface-variant hover:border-outline hover:text-on-surface'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Preference chips */}
          <ChipGroup label="Interests" options={INTERESTS} selected={interests} onChange={setInterests} />
          <ChipGroup label="Subjects"  options={SUBJECTS}  selected={subjects}  onChange={setSubjects} />
          <ChipGroup label="Goals"     options={GOALS}     selected={goals}     onChange={setGoals} />

          {error && (
            <p className="text-xs text-error bg-error/10 border border-error/20 rounded-lg px-3 py-2">{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-outline-variant/10 shrink-0">
          <button
            onClick={onClose}
            className="text-sm font-medium text-on-surface-variant hover:text-on-surface px-4 py-2 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || uploading}
            className="gradient-btn text-sm font-semibold text-white px-6 py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
