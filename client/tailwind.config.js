/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef4ff',
          100: '#dae5ff',
          200: '#bdd1ff',
          300: '#90b2ff',
          400: '#5d89fb',
          500: '#3a64f5',
          600: '#2447e0',
          700: '#1d37b5',
          800: '#1c3190',
          900: '#1c2d72'
        },
        ink: {
          500: '#5b6478',
          700: '#2f3648',
          900: '#161b26'
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        card: '0 1px 2px rgba(22, 27, 38, 0.04), 0 8px 24px -12px rgba(22, 27, 38, 0.18)'
      }
    }
  },
  plugins: []
};
