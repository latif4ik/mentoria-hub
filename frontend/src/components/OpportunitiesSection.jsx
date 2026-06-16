import { useReveal } from '../hooks/useReveal'

function OpportunityCard({ tag, tagColor, title, format, deadline, saved, indent = false }) {
  return (
    <div className={`level-1-card p-5 rounded-xl flex flex-col gap-3 ${indent ? 'ml-8' : ''}`}>
      <div className="flex justify-between items-start">
        <span
          className="text-[11px] font-medium px-2 py-0.5 rounded"
          style={{
            backgroundColor: `${tagColor}18`,
            color: tagColor,
          }}
        >
          {tag}
        </span>
        <span className={`material-symbols-outlined text-[20px] cursor-pointer ${saved ? 'text-error' : 'text-outline'}`}>
          favorite
        </span>
      </div>
      <div>
        <h3 className="text-sm font-semibold text-on-surface">{title}</h3>
        <p className="text-xs text-on-surface-variant mt-0.5">{format}</p>
      </div>
      <div className="flex justify-between items-center border-t border-outline-variant/10 pt-3">
        <span className="text-[11px] text-on-surface-variant">Deadline: {deadline}</span>
        <button className="text-primary-container text-xs font-semibold hover:opacity-80 transition-opacity">Apply</button>
      </div>
    </div>
  )
}

export default function OpportunitiesSection() {
  const textRef = useReveal(0)
  const visualRef = useReveal(150)

  return (
    <section className="py-24 px-6 max-w-desktop mx-auto border-t border-outline-variant/10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

        {/* Text — first on mobile, second column on desktop */}
        <div ref={textRef} className="anim-fade-right space-y-6 order-2 lg:order-1">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">Opportunities</p>
          <h2 className="text-3xl sm:text-4xl font-semibold text-on-surface leading-tight">
            Find competitions, olympiads, scholarships, and internships matched to you.
          </h2>
          <p className="text-base text-on-surface-variant leading-relaxed">
            Explore a curated catalog of global opportunities tailored to your interests and academic goals.
          </p>
          <button className="gradient-btn text-sm font-semibold text-white px-8 py-3.5 rounded-lg hover:opacity-90 transition-opacity">
            Find Opportunities
          </button>
        </div>

        {/* Visual */}
        <div ref={visualRef} className="anim-fade-left order-1 lg:order-2">
          <div className="glass-panel p-6 rounded-2xl ambient-glow">
            <div className="space-y-4">
              <OpportunityCard
                tag="STEM"
                tagColor="#95ccff"
                title="Global STEM Olympiad"
                format="Online Format"
                deadline="Oct 15"
                saved={false}
              />
              <OpportunityCard
                tag="Business"
                tagColor="#ffb960"
                title="Future Leaders Scholarship"
                format="Hybrid Format"
                deadline="Nov 01"
                saved={true}
                indent
              />
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
