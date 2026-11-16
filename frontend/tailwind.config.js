/** @type {import('tailwindcss').Config} */
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: token('bg'),
        surface: token('surface'),
        ink: token('ink'),
        muted: token('muted'),
        line: token('line'),
        brand: token('brand'),
        'brand-fg': token('brand-fg'),
        fern: token('fern'),
        tint: token('tint'),
        pollen: token('pollen'),
        danger: token('danger'),
        side: token('side'),
        'side-fg': token('side-fg'),
      },
      fontFamily: {
        display: ['"Young Serif"', 'Georgia', 'serif'],
        sans: ['Figtree', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: { panel: '1.5rem' },
      keyframes: {
        draw: { to: { 'stroke-dashoffset': '0' } },
        rise: { from: { opacity: '0', transform: 'scale(.6)' }, to: { opacity: '1', transform: 'scale(1)' } },
        drift: { to: { transform: 'rotate(360deg)' } },
      },
      animation: {
        draw: 'draw 2.4s cubic-bezier(.22,.8,.26,1) forwards',
        rise: 'rise .6s cubic-bezier(.22,1.2,.36,1) both',
        drift: 'drift 180s linear infinite',
      },
    },
  },
  plugins: [],
};
