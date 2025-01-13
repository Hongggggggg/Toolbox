/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          main: 'rgb(79,70,228)',
          light: 'rgba(79,70,228,0.1)',
          hover: 'rgba(79,70,228,0.9)',
        },
      },
    },
  },
  plugins: [],
}