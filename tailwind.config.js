/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'xs': '375px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Singapore theme - Modern Red
        singapore: {
          primary: '#DC2626',
          secondary: '#991B1B',
          accent: '#FCA5A5',
          bg: '#0F0F0F',
          card: '#1A1A1A',
        },
        // Malaysia theme - Royal Blue & Gold
        malaysia: {
          primary: '#2563EB',
          secondary: '#1D4ED8',
          accent: '#FCD34D',
          bg: '#0C1222',
          card: '#162032',
        },
        // Bali theme - Tropical Teal
        bali: {
          primary: '#14B8A6',
          secondary: '#0D9488',
          accent: '#FCD34D',
          bg: '#0A1612',
          card: '#132620',
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
