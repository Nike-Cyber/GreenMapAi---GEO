
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
        'forest-green': '#224F34',
        'lime-green': '#5A8C33',
        'light-green': '#A3CC3A',
        'cream': '#F5F5DC',
        'earth-red': '#B94A48',
        // Dark theme colors
        'dark-bg': '#1a202c',
        'dark-card': '#2d3748',
        'dark-text': '#e2e8f0',
        'dark-text-secondary': '#a0aec0',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
          'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
          'subtle-bob': 'subtleBob 3s ease-in-out infinite'
      },
      keyframes: {
          fadeInUp: {
              '0%': { opacity: '0', transform: 'translateY(20px)' },
              '100%': { opacity: '1', transform: 'translateY(0)' },
          },
          subtleBob: {
              '0%, 100%': { transform: 'translateY(0)' },
              '50%': { transform: 'translateY(-5px)' },
          }
      }
    }
  },
  plugins: [],
}
