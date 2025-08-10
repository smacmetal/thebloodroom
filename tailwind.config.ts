import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        blood: ['"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      colors: {
        blood: {
          red: '#ef4444',
          pink: '#f472b6',
          black: '#0a0a0a',
          fuchsia: '#d946ef',
        },
        midnight: '#121212',
        ember: '#991b1b',
        ash: '#e5e5e5',
      },
      animation: {
        pulseSlow: 'pulse 4s infinite',
      },
    },
  },
  plugins: [],
};

export default config;
