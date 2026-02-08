/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      textDirection: {
        'rtl': 'rtl',
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      const newUtilities = {
        '.text-right': {
          'text-align': 'right',
        },
        '.text-left': {
          'text-align': 'left',
        },
        '.text-center': {
          'text-align': 'center',
        },
        '.rtl\\:space-x-reverse': {
          '--tw-space-x-reverse': '1',
        },
      }
      addUtilities(newUtilities)
    },
  ],
}