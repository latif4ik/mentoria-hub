import { useReveal } from '../hooks/useReveal'

function CourseCard({ icon, iconBg, iconColor, title, level, lessons, progress, indent = false }) {
  return (
    <div className={`level-1-card p-5 rounded-xl flex gap-4 items-center ${indent ? 'mr-8' : ''}`}>
      <div
        className="w-16 h-16 rounded-xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${iconBg}20` }}
      >
        <span className="material-symbols-outlined text-[30px]" style={{ color: iconColor }}>
          {icon}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start mb-1 gap-2">
          <h3 className="text-sm font-semibold text-on-surface leading-snug">{title}</h3>
          <span className="bg-surface-variant text-on-surface-variant text-[10px] font-medium px-2 py-0.5 rounded hidden sm:block shrink-0">
            {level}
          </span>
        </div>
        <p className="text-xs text-on-surface-variant mb-3">{lessons} Lessons</p>
        <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
          <div className="bg-secondary h-full rounded-full" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  )
}

export default function CoursesSection() {
  const visualRef = useReveal(0)
  const textRef = useReveal(150)

  return (
    <section className="py-24 px-6 max-w-desktop mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

        {/* Visual */}
        <div ref={visualRef} className="anim-fade-right order-1">
          <div className="glass-panel p-6 rounded-2xl ambient-glow">
            <div className="space-y-5">
              <CourseCard
                icon="menu_book"
                iconBg="#2e9be6"
                iconColor="#95ccff"
                title="English for Academic Success"
                level="Beginner"
                lessons={12}
                progress={45}
              />
              <CourseCard
                icon="science"
                iconBg="#ffb960"
                iconColor="#ffb960"
                title="Foundations of Physics"
                level="Intermediate"
                lessons={24}
                progress={15}
                indent
              />
            </div>
          </div>
        </div>

        {/* Text */}
        <div ref={textRef} className="anim-fade-left space-y-6 order-2">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">Courses</p>
          <h2 className="text-3xl sm:text-4xl font-semibold text-on-surface leading-tight">
            Self-paced async courses you can take anytime, anywhere.
          </h2>
          <p className="text-base text-on-surface-variant leading-relaxed">
            No live classes required. Access structured lessons, video content, and interactive quizzes on your own schedule.
          </p>
          <button className="gradient-btn text-sm font-semibold text-white px-8 py-3.5 rounded-lg hover:opacity-90 transition-opacity">
            Start Learning
          </button>
        </div>

      </div>
    </section>
  )
}
