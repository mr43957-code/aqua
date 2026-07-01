/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: { sans: ['Cairo', 'sans-serif'] },
      colors: {
        primary: {
          50: '#eefbff', 100: '#d6f3ff', 200: '#b0e9ff', 300: '#7adcff',
          400: '#3ec8ff', 500: '#14acf0', 600: '#0a8acc', 700: '#0c6ea3',
          800: '#115d86', 900: '#134e71', 950: '#0b3350',
        },
        brand: { DEFAULT: 'var(--color-brand)', light: 'var(--color-brand-light)' },
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'pulse-slow': 'pulse 3s infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0', transform: 'translateY(10px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideIn: { from: { transform: 'translateX(-100%)' }, to: { transform: 'translateX(0)' } },
      },
    },
  },
  plugins: [],
};
