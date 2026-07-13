/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: 'rgb(var(--color-ink-950) / <alpha-value>)',
          900: 'rgb(var(--color-ink-900) / <alpha-value>)',
          850: 'rgb(var(--color-ink-850) / <alpha-value>)',
          800: 'rgb(var(--color-ink-800) / <alpha-value>)',
          700: 'rgb(var(--color-ink-700) / <alpha-value>)',
          600: 'rgb(var(--color-ink-600) / <alpha-value>)',
        },
        signal: {
          DEFAULT: 'rgb(var(--color-signal) / <alpha-value>)',
          dim: 'rgb(var(--color-signal-dim) / <alpha-value>)',
        },
        pulse: {
          DEFAULT: 'rgb(var(--color-pulse) / <alpha-value>)',
          soft: 'rgb(var(--color-pulse-soft) / <alpha-value>)',
        },
        rose: {
          deep: 'rgb(var(--color-rose-deep) / <alpha-value>)',
          bright: 'rgb(var(--color-rose-bright) / <alpha-value>)',
        },
        mist: {
          100: 'rgb(var(--color-mist-100) / <alpha-value>)',
          300: 'rgb(var(--color-mist-300) / <alpha-value>)',
          400: 'rgb(var(--color-mist-400) / <alpha-value>)',
          500: 'rgb(var(--color-mist-500) / <alpha-value>)',
          700: 'rgb(var(--color-mist-700) / <alpha-value>)',
        },
      },
      fontFamily: {
        display: ['"Pretendard Variable"', '"Pretendard"', '-apple-system', 'sans-serif'],
        body: ['"Pretendard Variable"', '"Pretendard"', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      boxShadow: {
        card: '0 18px 50px -24px rgb(var(--color-shadow) / 0.55)',
        glow: '0 0 0 1px rgb(var(--color-signal) / 0.35), 0 8px 24px -6px rgb(var(--color-signal) / 0.32)',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
        pulseDot: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.35 },
        },
      },
      animation: {
        shimmer: 'shimmer 1.6s linear infinite',
        pulseDot: 'pulseDot 1.6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
