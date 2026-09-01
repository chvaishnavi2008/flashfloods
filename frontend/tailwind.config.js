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
        background: '#0F172A', // Slate 950
        surface: {
          DEFAULT: '#131315',
          low: '#1E293B',     // Slate 800
          container: '#1E293B',
          high: '#273549',
          highest: '#334155'  // Slate 700
        },
        border: {
          DEFAULT: '#475569',
          light: '#334155'
        },
        primary: {
          DEFAULT: '#60A5FA', // Blue 400
          light: '#93C5FD',
          dark: '#1D4ED8',
          container: '#1E3A8A'
        },
        risk: {
          low: '#10B981',      // Emerald Green
          moderate: '#F59E0B', // Amber
          high: '#F97316',     // Orange
          critical: '#EF4444'  // Red
        },
        error: {
          DEFAULT: '#EF4444',
          container: '#450A0A',
          border: '#991B1B'
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
