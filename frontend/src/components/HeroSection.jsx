import { useReveal } from '../hooks/useReveal'

function HeroMockup() {
  const ref = useReveal(200)
  return (
    <div ref={ref} className="anim-fade-left hidden lg:block">
      <div className="glass-panel p-6 rounded-3xl ambient-glow rotate-[-2deg] hover:rotate-0 transition-transform duration-500">
        <div className="space-y-5">

          {/* Opportunity card */}
          <div className="level-1-card p-5 rounded-xl flex items-start gap-4">
            <div className="w-12 h-12 bg-primary-container/20 rounded-xl flex items-center justify-center text-primary-container shrink-0">
              <span className="material-symbols-outlined">school</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-on-surface">Global STEM Olympiad</h3>
                  <p className="text-xs text-on-surface-variant mt-0.5">Deadline: Oct 15</p>
                </div>
                <span className="bg-primary-container/15 text-primary text-[11px] font-medium px-2 py-0.5 rounded shrink-0">
                  STEM
                </span>
              </div>
              <div className="mt-3 flex justify-between items-center">
                <div className="flex -space-x-2">
                  {['#4f8ef7', '#34dfb6', '#ffb960'].map((color, i) => (
                    <div
                      key={i}
                      className="w-7 h-7 rounded-full border-2 border-[#162235] flex items-center justify-center text-[9px] font-bold text-white"
                      style={{ backgroundColor: color }}
                    >
                      {['A', 'B', '+12'][i]}
                    </div>
                  ))}
                </div>
                <button className="text-primary-container text-xs font-semibold hover:opacity-80 transition-opacity">
                  Apply Now
                </button>
              </div>
            </div>
          </div>

          {/* Course progress card */}
          <div className="level-1-card p-5 rounded-xl">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-semibold text-on-surface">Intro to Computer Science</h3>
              <span className="material-symbols-outlined text-secondary text-[20px]">check_circle</span>
            </div>
            <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
              <div className="bg-secondary h-full rounded-full" style={{ width: '60%' }} />
            </div>
            <p className="text-right text-[11px] text-on-surface-variant mt-1.5">60% Complete</p>
          </div>

        </div>
      </div>
    </div>
  )
}

export default function HeroSection() {
  const textRef = useReveal(0)

  return (
    <section className="relative pt-24 pb-32 px-6 max-w-desktop mx-auto overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-brand/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-mint/8 rounded-full blur-[100px] pointer-events-none -z-10" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

        {/* Text block */}
        <div ref={textRef} className="anim-fade-right space-y-8 z-10">
          <h1 className="text-4xl sm:text-5xl lg:text-[52px] font-bold text-on-surface leading-tight tracking-tight">
            Find opportunities and learn —{' '}
            <span className="bg-brand-gradient bg-clip-text text-transparent">
              all in one place
            </span>
            , on your schedule.
          </h1>
          <p className="text-lg text-on-surface-variant max-w-xl leading-relaxed">
            No live classes required. Discover competitions, scholarships, and self-paced courses tailored for you.
          </p>
          <div className="flex flex-wrap gap-4">
            <button className="gradient-btn text-sm font-semibold text-white px-8 py-3.5 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2">
              Find Opportunities
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
            <button className="border border-primary-container text-primary-container text-sm font-semibold px-8 py-3.5 rounded-lg hover:bg-primary-container/10 transition-colors">
              Start Learning
            </button>
          </div>
        </div>

        {/* Mockup */}
        <HeroMockup />
      </div>
    </section>
  )
}
