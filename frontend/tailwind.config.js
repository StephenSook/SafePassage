/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Instrument Serif"', 'serif'],
      },
      colors: {
        bg: '#050505',
        surface: '#111111',
        accent: '#A4F4FD',
      },
    },
  },
  plugins: [],
};
