/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        commons: {
          blue: '#3366cc',
          dark: '#0a192f',
          red: '#990000',
          green: '#339966',
        }
      }
    },
  },
  plugins: [],
}
