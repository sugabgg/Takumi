import type { Config } from 'tailwindcss';

// TAKUMI design tokens — a craftsman's ink-and-seal palette.
// "Takumi" (匠) means master craftsman; the visual language borrows from
// hanko name-seals (the red stamp used as the reputation signature) and
// sumi ink panels rather than generic "Web3 neon" defaults.
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          deep: '#0F1310',
          panel: '#171C16',
          raised: '#1F261D',
          border: '#2B3327',
        },
        parchment: {
          DEFAULT: '#ECE7D8',
          muted: '#9CA293',
          faint: '#5C6354',
        },
        jade: {
          DEFAULT: '#5FA777',
          dim: '#3E7355',
          bright: '#7FD19C',
        },
        seal: {
          DEFAULT: '#B5402C',
          bright: '#D85B3F',
          dim: '#7A2A1D',
        },
      },
      fontFamily: {
        display: ['"Shippori Mincho"', '"Noto Serif JP"', 'serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        seal: '50%',
      },
      boxShadow: {
        stamp: '0 0 0 2px rgba(181, 64, 44, 0.35)',
        panel: '0 8px 24px -8px rgba(0,0,0,0.5)',
      },
      keyframes: {
        'stamp-in': {
          '0%': { transform: 'scale(1.6) rotate(-8deg)', opacity: '0' },
          '60%': { transform: 'scale(0.95) rotate(2deg)', opacity: '1' },
          '100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' },
        },
        'fade-up': {
          '0%': { transform: 'translateY(6px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        'stamp-in': 'stamp-in 320ms cubic-bezier(0.34, 1.56, 0.64, 1)',
        'fade-up': 'fade-up 220ms ease-out',
      },
    },
  },
  plugins: [],
} satisfies Config;
