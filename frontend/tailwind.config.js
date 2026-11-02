/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: '#0ea5e9', dark: '#0284c7' },
        up: '#22c55e',
        down: '#ef4444',
        sideways: '#f59e0b'
      }
    }
  },
  plugins: []
}
