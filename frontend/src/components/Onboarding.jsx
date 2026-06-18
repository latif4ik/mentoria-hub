import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { useLocale } from '../i18n/LocaleContext'

const STEPS = [
  {
    id: 'grade',
    title: 'What grade are you in?',
    subtitle: "We'll tailor opportunities to your level.",
    type: 'single',
    options: [
      { value: 8,  label: 'Grade 8' },
      { value: 9,  label: 'Grade 9' },
      { value: 10, label: 'Grade 10' },
      { value: 11, label: 'Grade 11' },
    ],
  },
  {
    id: 'interests',
    title: 'What are you interested in?',
    subtitle: 'Select everything that applies.',
    type: 'multi',
    options: [
      { value: 'STEM',         label: 'STEM',         icon: 'science' },
      { value: 'Business',     label: 'Business',     icon: 'business_center' },
      { value: 'Finance',      label: 'Finance',      icon: 'trending_up' },
      { value: 'Coding',       label: 'Coding',       icon: 'code' },
      { value: 'Science',      label: 'Science',      icon: 'biotech' },
      { value: 'Social Impact',label: 'Social Impact',icon: 'groups' },
    ],
  },
  {
    id: 'subjects',
    title: 'Which subjects are you studying?',
    subtitle: "We'll recommend relevant courses.",
    type: 'multi',
    options: [
      { value: 'Math',      label: 'Math' },
      { value: 'English',   label: 'English' },
      { value: 'Physics',   label: 'Physics' },
      { value: 'Biology',   label: 'Biology' },
      { value: 'Economics', label: 'Economics' },
      { value: 'CS',        label: 'Computer Science' },
      { value: 'SAT/IELTS', label: 'SAT / IELTS Prep' },
    ],
  },
  {
    id: 'goals',
    title: 'What are your goals?',
    subtitle: 'Choose everything that resonates.',
    type: 'multi',
    options: [
      { value: 'University prep', label: 'University Prep',  icon: 'school' },
      { value: 'Competitions',    label: 'Win Competitions', icon: 'emoji_events' },
      { value: 'Scholarships',    label: 'Get Scholarships', icon: 'workspace_premium' },
      { value: 'Skill building',  label: 'Build Skills',     icon: 'psychology' },
    ],
  },
]

export default function Onboarding({ userId, onComplete }) {
  const { t } = useLocale()
  const [step, setStep]     = useState(0)
  const [answers, setAnswers] = useState({ grade: null, interests: [], subjects: [], goals: [] })
  const [saving, setSaving]  = useState(false)

  const stepText = {
    grade:     { title: t('onboarding.gradeTitle'),     sub: t('onboarding.gradeSub') },
    interests: { title: t('onboarding.interestsTitle'), sub: t('onboarding.interestsSub') },
    subjects:  { title: t('onboarding.subjectsTitle'),  sub: t('onboarding.subjectsSub') },
    goals:     { title: t('onboarding.goalsTitle'),     sub: t('onboarding.goalsSub') },
  }

  const labelMap = {
    'Grade 8': t('onboarding.grade') + ' 8',
    'Grade 9': t('onboarding.grade') + ' 9',
    'Grade 10': t('onboarding.grade') + ' 10',
    'Grade 11': t('onboarding.grade') + ' 11',
    'STEM': t('onboarding.stem'),
    'Business': t('onboarding.business'),
    'Finance': t('onboarding.finance'),
    'Coding': t('onboarding.coding'),
    'Science': t('onboarding.science'),
    'Social Impact': t('onboarding.socialImpact'),
    'Math': t('onboarding.math'),
    'English': t('onboarding.english'),
    'Physics': t('onboarding.physics'),
    'Biology': t('onboarding.biology'),
    'Economics': t('onboarding.economics'),
    'Computer Science': t('onboarding.cs'),
    'SAT / IELTS Prep': t('onboarding.satIelts'),
    'University Prep': t('onboarding.uniPrep'),
    'Win Competitions': t('onboarding.competitions'),
    'Get Scholarships': t('onboarding.scholarships'),
    'Build Skills': t('onboarding.skills'),
  }

  const current = STEPS[step]
  const isLast  = step === STEPS.length - 1
  const progress = ((step + 1) / STEPS.length) * 100

  function toggle(field, value, type) {
    if (type === 'single') {
      setAnswers(a => ({ ...a, [field]: value }))
    } else {
      setAnswers(a => {
        const cur = a[field]
        return {
          ...a,
          [field]: cur.includes(value) ? cur.filter(v => v !== value) : [...cur, value],
        }
      })
    }
  }

  function isSelected(field, value, type) {
    return type === 'single' ? answers[field] === value : answers[field].includes(value)
  }

  function canAdvance() {
    const val = answers[current.id]
    return current.type === 'single' ? val !== null : val.length > 0
  }

  async function handleNext() {
    if (!canAdvance()) return
    if (isLast) {
      setSaving(true)
      await supabase.from('profiles').upsert({
        id:        userId,
        grade:     answers.grade,
        interests: answers.interests,
        subjects:  answers.subjects,
        goals:     answers.goals,
      })
      setSaving(false)
      onComplete(answers)
    } else {
      setStep(s => s + 1)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-surface flex flex-col items-center justify-center px-6 py-10 overflow-y-auto">
      {/* ambient blobs */}
      <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-brand/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-mint/6 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative w-full max-w-lg">

        {/* Logo */}
        <div className="flex items-center gap-2 mb-10">
          <div className="h-8 w-8 rounded-lg gradient-btn flex items-center justify-center shrink-0">
            <svg viewBox="0 0 40 40" width="20" height="20" fill="none">
              <path d="M8 30V12l12 10 12-10v18" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="20" cy="10" r="3" fill="white"/>
            </svg>
          </div>
          <span className="text-base font-bold text-on-surface">Mentoria Hub</span>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between text-xs text-on-surface-variant mb-2">
            <span>{t('onboarding.step')} {step + 1} {t('onboarding.of')} {STEPS.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, background: 'linear-gradient(135deg, #2E9BE6 0%, #27D8B0 100%)' }}
            />
          </div>
        </div>

        {/* Step content — key forces remount = fade-in animation */}
        <div key={step} className="step-enter">
          <h1 className="text-2xl font-bold text-on-surface mb-1">{stepText[current.id].title}</h1>
          <p className="text-sm text-on-surface-variant mb-7">{stepText[current.id].sub}</p>

          <div className={`flex flex-wrap gap-3 ${current.id === 'grade' ? 'grid grid-cols-2 sm:grid-cols-4' : ''}`}>
            {current.options.map(opt => {
              const selected = isSelected(current.id, opt.value, current.type)
              return (
                <button
                  key={opt.value}
                  onClick={() => toggle(current.id, opt.value, current.type)}
                  className={`flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl border font-medium text-sm transition-all duration-200 ${
                    selected
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-outline-variant text-on-surface-variant hover:border-outline hover:text-on-surface'
                  } ${current.id === 'grade' ? 'flex-col py-5 text-base' : ''}`}
                >
                  {opt.icon && (
                    <span className={`material-symbols-outlined ${current.id === 'grade' ? 'text-[28px]' : 'text-[18px]'}`}>
                      {opt.icon}
                    </span>
                  )}
                  {labelMap[opt.label] || opt.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Navigation */}
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
            {saving ? t('onboarding.saving') : isLast ? t('onboarding.getStarted') : t('onboarding.next')}
            {!saving && (
              <span className="material-symbols-outlined text-[18px]">
                {isLast ? 'check' : 'arrow_forward'}
              </span>
            )}
          </button>
        </div>

      </div>
    </div>
  )
}
