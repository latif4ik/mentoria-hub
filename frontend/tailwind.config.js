/** Mentoria Hub — full design token palette */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy: '#0F1A2A',
        brand: '#2E9BE6',
        mint: '#27D8B0',
        // Surface scale
        surface: '#101418',
        'surface-dim': '#101418',
        'surface-bright': '#353a3f',
        'surface-container-lowest': '#0a0f13',
        'surface-container-low': '#181c21',
        'surface-container': '#1c2025',
        'surface-container-high': '#262a2f',
        'surface-container-highest': '#31353a',
        'surface-variant': '#31353a',
        // Content on surface
        'on-surface': '#dfe3e9',
        'on-surface-variant': '#bfc7d2',
        // Outline
        outline: '#89919c',
        'outline-variant': '#3f4851',
        // Primary (sky blue)
        primary: '#95ccff',
        'primary-container': '#2e9be6',
        'on-primary': '#003353',
        'on-primary-container': '#00304d',
        // Secondary (mint/cyan)
        secondary: '#41e7be',
        'secondary-container': '#00cba4',
        'on-secondary': '#00382b',
        'on-secondary-container': '#004f3f',
        // Tertiary (amber)
        tertiary: '#ffb960',
        'tertiary-container': '#d08400',
        'on-tertiary': '#472a00',
        'on-tertiary-container': '#432700',
        // Error
        error: '#ffb4ab',
        'error-container': '#93000a',
        'on-error': '#690005',
        // Misc
        background: '#101418',
        'on-background': '#dfe3e9',
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
