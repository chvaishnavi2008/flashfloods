/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy: {
          primary: '#123047',
          dark: '#0B2233',
          hover: '#183D55',
          border: '#294657',
          DEFAULT: '#123047'
        },
        blue: {
          primary: '#1769AA',
          light: '#E8F2F8',
          hover: '#125890',
          DEFAULT: '#1769AA'
        },
        page: '#F5F7F9',
        card: {
          DEFAULT: '#FFFFFF',
          secondary: '#F8FAFC'
        },
        heading: '#172B3A',
        subtext: '#5B6B78',
        border: {
          DEFAULT: '#D7E0E7',
          light: '#E5EBF0',
          navy: '#294657'
        },
        risk: {
          low: '#16855B',
          moderate: '#D99A00',
          high: '#E87516',
          critical: '#C62828'
        },
        emergency: {
          sos: '#C62828',
          bg: '#FFF1F1',
          warningBg: '#FFF7E6',
          safeBg: '#EAF7F1',
          info: '#1769AA'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace']
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-danger': 'dangerPulse 1.5s infinite',
        'ripple': 'ripple 2s linear infinite'
      },
      keyframes: {
        dangerPulse: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.03)', opacity: '0.85' },
        },
        ripple: {
          '0%': { transform: 'scale(0.8)', opacity: '1' },
          '100%': { transform: 'scale(2.4)', opacity: '0' },
        }
      }
    },
  },
  plugins: [],
}
