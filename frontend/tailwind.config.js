/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f4ff',
          100: '#dbe4ff',
          500: '#3b5bdb',
          600: '#364fc7',
          700: '#2b44a8',
          800: '#1e3a8a',
          900: '#172554',
        },
      },
    },
  },
  plugins: [],
};
