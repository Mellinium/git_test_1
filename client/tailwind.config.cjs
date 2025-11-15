/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#060913',
        surface: '#0b1320',
        accent: '#22d3ee'
      }
    }
  },
  plugins: [require('@tailwindcss/line-clamp')]
};
