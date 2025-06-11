/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dark-bg': '#0f0f23',
        'dark-card': '#1a1a3e',
      },
      boxShadow: {
        'glow-cyan': '0 0 15px rgba(78, 205, 196, 0.4)',
        'glow-blue': '0 0 15px rgba(69, 183, 209, 0.4)',
      }
    },
  },
  plugins: [],
}