/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html","./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink:    '#161A17',
        body:   '#2C322D',
        muted:  '#5F665F',
        paper:  '#FAF8F3',
        surface:'#FFFFFF',
        'muted-surface': '#F3F0E9',
        line:        '#E2DED4',
        'line-strong':'#CFC9BC',
        accent: {
          DEFAULT: '#A9552F',
          soft:    '#F6E9E1',
        },
        success: '#1B7A4B',
        warning: '#8A5A00',
        danger:  '#A32A22',
        brand: {
          50:  '#f0faf4',
          100: '#d9f2e3',
          200: '#b3e5c8',
          300: '#7dd0a6',
          400: '#47b580',
          500: '#2a9d64',
          600: '#1f7d4f',
          700: '#1a6340',
          800: '#174f34',
          900: '#14412b',
          950: '#0d2b1d',
        },
      },
      fontFamily: {
        display: ['"Fraunces"', 'Georgia', 'serif'],
        sans:    ['"DM Sans"', 'system-ui', 'sans-serif'],
        body:    ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        content: '1240px',
        prose:   '68ch',
      },
      boxShadow: {
        overlay: '0 12px 32px rgba(20,24,20,0.12)',
      },
      keyframes: {
        toastIn: {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'toast-in': 'toastIn 160ms ease-out both',
      },
    },
  },
  plugins: [],
}
