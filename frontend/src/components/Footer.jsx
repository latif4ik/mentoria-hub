function LogoMark() {
  return (
    <div className="h-9 w-9 rounded-lg gradient-btn flex items-center justify-center shrink-0">
      <svg viewBox="0 0 40 40" width="22" height="22" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 30V12l12 10 12-10v18" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="20" cy="10" r="3" fill="white"/>
      </svg>
    </div>
  )
}

const LINKS = {
  Platform: ['Opportunities', 'Courses', 'For Students'],
  Resources: ['Terms of Service', 'Privacy Policy', 'Help Center'],
  Contact: ['abdulatifimarov@gmail.com', 'Instagram', 'Telegram'],
}

export default function Footer() {
  return (
    <footer className="border-t border-outline-variant/10 py-16 px-6 max-w-desktop mx-auto">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-10">

        {/* Brand column */}
        <div className="col-span-2 sm:col-span-1 space-y-4">
          <div className="flex items-center gap-3">
            <LogoMark />
            <span className="text-base font-bold text-on-surface">Mentoria Hub</span>
          </div>
          <p className="text-sm text-on-surface-variant leading-relaxed max-w-[200px]">
            Discover opportunities and grow with self-paced courses.
          </p>

          {/* Language switcher */}
          <div className="flex gap-1 mt-2">
            {['EN', 'RU', 'KZ'].map((lang, i) => (
              <button
                key={lang}
                className={`text-xs font-semibold px-3 py-1.5 rounded transition-colors ${
                  i === 0
                    ? 'bg-primary-container/20 text-primary'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>

          <p className="text-xs text-on-surface-variant pt-2">
            © 2026 Mentoria Hub. All rights reserved.
          </p>
        </div>

        {/* Link columns */}
        {Object.entries(LINKS).map(([heading, items]) => (
          <div key={heading} className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-on-surface">{heading}</h4>
            <ul className="space-y-2.5">
              {items.map(item => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-sm text-on-surface-variant hover:text-primary transition-colors"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}

      </div>
    </footer>
  )
}
