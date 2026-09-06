/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0E5E77',
          dark: '#093F50',
          light: '#E0F2F7',
          hover: '#0b4d61',
        },
        accent: {
          DEFAULT: '#F26C0D',
          hover: '#d95f0a',
          light: '#FFF0E6',
        },
        slate: {
          background: '#F8FAFC',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
