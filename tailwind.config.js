/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'custom-green': {
          DEFAULT: '#22C55E',
          hover: '#16A34A',
          dark: '#15803D',
          50: '#F0FDF4',
          100: '#DCFCE7',
        },
      },
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