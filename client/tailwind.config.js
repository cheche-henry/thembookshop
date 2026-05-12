/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html","./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
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
        },
      },
      fontFamily: {
        display: ['"Nunito"', 'sans-serif'],
        body:    ['"DM Sans"', 'sans-serif'],
      },
      boxShadow: {
        'card':      '0 2px 12px rgba(0,0,0,0.07)',
        'card-hover':'0 8px 30px rgba(0,0,0,0.12)',
      },
      borderRadius: {
        'xl2': '1.25rem',
      },
    },
  },
  plugins: [],
}
