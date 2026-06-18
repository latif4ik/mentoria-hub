import { useState } from 'react'
import { supabase } from '../supabaseClient'
import LogoMark from './LogoMark'
import { useLocale } from '../i18n/LocaleContext'

const SUBJECTS = [
  { value: 'Math',      icon: 'calculate' },
  { value: 'English',   icon: 'menu_book' },
  { value: 'Physics',   icon: 'science' },
  { value: 'Biology',   icon: 'biotech' },
  { value: 'Economics', icon: 'bar_chart' },
  { value: 'CS',        icon: 'code' },
  { value: 'SAT/IELTS', icon: 'translate' },
  { value: 'STEM',      icon: 'engineering' },
  { value: 'Business',  icon: 'business_center' },
]

export default function MentorOnboarding({ userId, onComplete }) {
  const { t } = useLocale()
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [subjects, setSubjects] = useState([])
  const [bio, setBio] = useState('')
  const [saving, setSaving] = useState(false)

  const labelMap = {
    Math: t('onboarding.math'), English: t('onboarding.english'),
    Physics: t('onboarding.physics'), Biology: t('onboarding.biology'),
    Economics: t('onboarding.economics'), CS: t('onboarding.cs'),
    'SAT/IELTS': t('onboarding.satIelts'), STEM: t('onboarding.stem'),
    Business: t('onboarding.business'),
  }

  function toggleSubject(val) {
    setSubjects(s => s.includes(val) ? s.filter(v => v !== val) : [...s, val])
  }

  function canAdvance() {
    if (step === 0) return name.trim().length > 0
    if (step === 1) return subjects.length > 0
    return true
  }

  async function handleNext() {
    if (!canAdvance()) return
    if (step < 2) { setStep(s => s + 1); return }

    setSaving(true)
    const { data } = await supabase.from('profiles').upsert({
      id: userId,
      full_name: name.trim(),
      role: 'mentor',
      teaching_subjects: subjects,
      bio: bio.trim() || null,
    }).select().single()
    setSaving(false)
    onComplete(data)
  }

  const steps = [
    {
      title: t('mentor.onboarding.nameTitle'),
      sub: t('mentor.onboarding.nameSub'),
      content: (
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Aibek Seitkali"
          className="w-full bg-surface-container-high text-on-surface text-lg rounded-xl px-5 py-4 border border-outline-variant/30 focus:outline-none focus:border-primary transition-colors placeholder:text-on-surface-variant/40"
          autoFocus
        />
      ),
    },
    {
      title: t('mentor.onboarding.subjectsTitle'),
      sub: t('mentor.onboarding.subjectsSub'),
      content: (
        <div className="flex flex-wrap gap-3">
          {SUBJECTS.map(({ value, icon }) => {
            const selected = subjects.includes(value)
            return (
              <button
                key={value}
                onClick={() => toggleSubject(value)}
                className={`flex items-center gap-2 px-5 py-3.5 rounded-xl border font-medium text-sm transition-all duration-200 ${
                  selected
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-outline-variant text-on-surface-variant hover:border-outline hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{icon}</span>
                {labelMap[value] || value}
              </button>
            )
          })}
        </div>
      ),
    },
    {
      title: t('mentor.onboarding.bioTitle'),
      sub: t('mentor.onboarding.bioSub'),
      content: (
        <textarea
          value={bio}
          onChange={e => setBio(e.target.value)}
          placeholder={t('mentor.onboarding.bioPlaceholder')}
          rows={4}
          className="w-full bg-surface-container-high text-on-surface text-sm rounded-xl px-4 py-3 border border-outline-variant/30 focus:outline-none focus:border-primary transition-colors placeholder:text-on-surface-variant/40 resize-none"
        />
      ),
    },
  ]

  const current = steps[step]
  const progress = ((step + 1) / steps.length) * 100

  return (
    <div className="fixed inset-0 z-50 bg-surface flex flex-col items-center justify-center px-6 py-10 overflow-y-auto">
      <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-brand/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-mint/6 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative w-full max-w-lg">
        <div className="flex items-center gap-2 mb-3">
          <LogoMark size={32} />
          <span className="text-base font-bold text-on-surface">Mentoria Hub</span>
        </div>

        <p className="text-sm text-primary font-semibold mb-6">{t('mentor.onboarding.welcome')}</p>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-xs text-on-surface-variant mb-2">
            <span>{t('onboarding.step')} {step + 1} {t('onboarding.of')} {steps.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, background: 'linear-gradient(135deg, #2E9BE6 0%, #27D8B0 100%)' }} />
          </div>
        </div>

        <div key={step} className="step-enter">
          <h1 className="text-2xl font-bold text-on-surface mb-1">{current.title}</h1>
          <p className="text-sm text-on-surface-variant mb-7">{current.sub}</p>
          {current.content}
        </div>

        <div className="flex justify-between items-center mt-10">
          <button
            onClick={() => setStep(s => s - 1)}
            disabled={step === 0}
            className="text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            {t('onboarding.back')}
          </button>
          <button
            onClick={handleNext}
            disabled={!canAdvance() || saving}
            className="gradient-btn text-sm font-semibold text-white px-8 py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving ? t('onboarding.saving') : step === steps.length - 1 ? t('mentor.onboarding.done') : t('onboarding.next')}
            {!saving && <span className="material-symbols-outlined text-[18px]">{step === steps.length - 1 ? 'check' : 'arrow_forward'}</span>}
          </button>
        </div>
      </div>
    </div>
  )
}
