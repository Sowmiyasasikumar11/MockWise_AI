/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    'bg-green-500/10', 'border-green-500/50', 'text-green-400', 'ring-green-500/50',
    'bg-amber-500/10', 'border-amber-500/50', 'text-amber-400', 'ring-amber-500/50',
    'bg-red-500/10', 'border-red-500/50', 'text-red-400', 'ring-red-500/50'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        primary: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
        },
        dark: {
          900: '#0f0f1a',
          800: '#1a1a2e',
          700: '#16213e',
          600: '#0f3460',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn:  { '0%': { opacity: '0' },                     '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(20px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
}
