import { useReveal } from '../hooks/useReveal'

function DeadlineCard({ title, daysLabel, accent }) {
  return (
    <div
      className="level-1-card p-4 rounded-xl flex items-center justify-between gap-4"
      style={{ borderLeft: `3px solid ${accent}` }}
    >
      <div>
        <h4 className="text-sm font-semibold text-on-surface">{title}</h4>
        <p className="text-xs text-on-surface-variant mt-0.5">Deadline approaching</p>
      </div>
      <span
        className="text-xs font-bold px-3 py-1 rounded-full shrink-0"
        style={{ color: accent, backgroundColor: `${accent}18` }}
      >
        {daysLabel}
      </span>
    </div>
  )
}

export default function DashboardSection() {
  const textRef = useReveal(0)
  const visualRef = useReveal(150)

  return (
    <section className="py-24 px-6 max-w-desktop mx-auto border-t border-outline-variant/10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

        {/* Text */}
        <div ref={textRef} className="anim-fade-right space-y-6 order-2 lg:order-1">
          <p className="text-xs font-bold uppercase tracking-widest text-secondary">Dashboard</p>
          <h2 className="text-3xl sm:text-4xl font-semibold text-on-surface leading-tight">
            Stay on track with your goals and deadlines.
          </h2>
          <p className="text-base text-on-surface-variant leading-relaxed">
            Your personal dashboard keeps all your saved opportunities, enrolled courses, and upcoming deadlines in one view.
          </p>
          <button className="gradient-btn text-sm font-semibold text-white px-8 py-3.5 rounded-lg hover:opacity-90 transition-opacity">
            Open Dashboard
          </button>
        </div>

        {/* Visual */}
        <div ref={visualRef} className="anim-fade-left order-1 lg:order-2">
          <div className="glass-panel p-6 rounded-2xl ambient-glow space-y-6">

            {/* Progress section */}
            <div>
              <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest mb-4">Current Courses</p>
              <div className="space-y-4">
                {[
                  { title: 'English for Academic Success', pct: 45, color: '#95ccff' },
                  { title: 'Foundations of Physics', pct: 15, color: '#41e7be' },
                ].map(({ title, pct, color }) => (
                  <div key={title}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-on-surface font-medium">{title}</span>
                      <span className="text-on-surface-variant">{pct}%</span>
                    </div>
                    <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Deadlines section */}
            <div>
              <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest mb-4">Upcoming Deadlines</p>
              <div className="space-y-3">
                <DeadlineCard
                  title="Global STEM Olympiad"
                  daysLabel="2 Days Left"
                  accent="#ffb4ab"
                />
                <DeadlineCard
                  title="Future Leaders Scholarship"
                  daysLabel="14 Days Left"
                  accent="#ffb960"
                />
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  )
}
