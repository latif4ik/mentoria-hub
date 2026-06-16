/** Mentoria Hub — full design token palette (CSS-variable driven for light/dark) */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Fixed accent colours (same in both modes)
        navy:  '#0F1A2A',
        brand: '#2E9BE6',
        mint:  '#27D8B0',
        // ── Semantic surface scale ─────────────────────────────
        surface:                     'rgb(var(--c-surface)                    / <alpha-value>)',
        'surface-dim':               'rgb(var(--c-surface-dim)               / <alpha-value>)',
        'surface-bright':            'rgb(var(--c-surface-bright)            / <alpha-value>)',
        'surface-container-lowest':  'rgb(var(--c-surface-container-lowest)  / <alpha-value>)',
        'surface-container-low':     'rgb(var(--c-surface-container-low)     / <alpha-value>)',
        'surface-container':         'rgb(var(--c-surface-container)         / <alpha-value>)',
        'surface-container-high':    'rgb(var(--c-surface-container-high)    / <alpha-value>)',
        'surface-container-highest': 'rgb(var(--c-surface-container-highest) / <alpha-value>)',
        'surface-variant':           'rgb(var(--c-surface-variant)           / <alpha-value>)',
        // ── Content ───────────────────────────────────────────
        'on-surface':         'rgb(var(--c-on-surface)         / <alpha-value>)',
        'on-surface-variant': 'rgb(var(--c-on-surface-variant) / <alpha-value>)',
        // ── Outline ───────────────────────────────────────────
        outline:         'rgb(var(--c-outline)         / <alpha-value>)',
        'outline-variant': 'rgb(var(--c-outline-variant) / <alpha-value>)',
        // ── Primary ───────────────────────────────────────────
        primary:             'rgb(var(--c-primary)             / <alpha-value>)',
        'primary-container': 'rgb(var(--c-primary-container)   / <alpha-value>)',
        'on-primary':        'rgb(var(--c-on-primary)          / <alpha-value>)',
        'on-primary-container': 'rgb(var(--c-on-primary-container) / <alpha-value>)',
        // ── Secondary ─────────────────────────────────────────
        secondary:             'rgb(var(--c-secondary)             / <alpha-value>)',
        'secondary-container': 'rgb(var(--c-secondary-container)   / <alpha-value>)',
        'on-secondary':        'rgb(var(--c-on-secondary)          / <alpha-value>)',
        'on-secondary-container': 'rgb(var(--c-on-secondary-container) / <alpha-value>)',
        // ── Tertiary ──────────────────────────────────────────
        tertiary:             'rgb(var(--c-tertiary)             / <alpha-value>)',
        'tertiary-container': 'rgb(var(--c-tertiary-container)   / <alpha-value>)',
        'on-tertiary':        'rgb(var(--c-on-tertiary)          / <alpha-value>)',
        'on-tertiary-container': 'rgb(var(--c-on-tertiary-container) / <alpha-value>)',
        // ── Error ─────────────────────────────────────────────
        error:            'rgb(var(--c-error)            / <alpha-value>)',
        'error-container':'rgb(var(--c-error-container)  / <alpha-value>)',
        'on-error':        'rgb(var(--c-on-error)         / <alpha-value>)',
        // ── Background alias ──────────────────────────────────
        background:    'rgb(var(--c-surface) / <alpha-value>)',
        'on-background': 'rgb(var(--c-on-surface) / <alpha-value>)',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #2E9BE6 0%, #27D8B0 100%)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      maxWidth: {
        desktop: '1440px',
      },
    },
  },
  plugins: [],
}
