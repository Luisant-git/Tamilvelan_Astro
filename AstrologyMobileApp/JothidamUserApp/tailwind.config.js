/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        gold: '#FFD700',
        'gold-dark': '#B8860B',
        'gold-light': '#FFF3C4',
        saffron: '#FF8C00',
        'saffron-dark': '#CC7000',
        spiritual: {
          900: '#0D0620',
          800: '#1A0E3A',
          700: '#251450',
          600: '#321C6B',
          500: '#4B2A8F',
          400: '#6B3FA0',
        },
        // Aliases used throughout existing screens, mapped to the website palette
        dark: '#0D0620',
        'dark-card': '#251450',
        'light-text': '#F5F0FF',
        muted: '#A89BC8',
        subtle: '#8B7BAA',
      },
      fontFamily: {
        serif: ['Noto Serif Tamil', 'Georgia', 'serif'],
        sans: ['Noto Sans Tamil', 'System', 'sans-serif'],
      },
      borderRadius: {
        card: '14px',
      },
    },
  },
  plugins: [],
};
