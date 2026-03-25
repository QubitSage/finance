/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        display: ['Playfair Display', 'serif'],
      },
      colors: {
        cream: {
          50: '#FDFAF5',
          100: '#F7F1E8',
          200: '#EDE4D4',
        },
        rose: {
          brand: '#C8707A',
          light: '#F2DEE0',
          dark: '#8B3D46',
        },
        sage: {
          brand: '#6B8F71',
          light: '#DCE8DE',
          dark: '#3D5C42',
        },
        ink: {
          900: '#1C1917',
          700: '#44403C',
          500: '#78716C',
          300: '#A8A29E',
          100: '#E7E5E4',
        },
      },
    },
  },
  plugins: [],
}
