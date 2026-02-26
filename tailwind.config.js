/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'neutral-bg': '#F8F9FA',
        'neutral-text': '#25252A',
        'neutral-surface': '#FFFFFF',
        'border-gray': '#DEE5EB',
        'text-secondary': '#5D666F',
      },
      spacing: {
        'xl': '1.5rem',
      },
    },
  },
  plugins: [],
}

