import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        gold: { DEFAULT: '#FFD700', dark: '#B8860B', light: '#FFF3C4' },
        saffron: { DEFAULT: '#FF8C00', dark: '#CC7000' },
        spiritual: {
          900: '#0D0620',
          800: '#1A0E3A',
          700: '#251450',
          600: '#321C6B',
          500: '#4B2A8F',
          400: '#6B3FA0'
        }
      },
      fontFamily: {
        tamil: ['"Noto Sans Tamil"', '"Latha"', 'sans-serif'],
        heading: ['"Noto Serif Tamil"', 'serif']
      }
    }
  },
  plugins: []
};

export default config;
