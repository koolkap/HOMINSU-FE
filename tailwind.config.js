/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#0a0a0d',
          900: '#111116',
          850: '#16161d',
          800: '#1c1c24',
          700: '#26262f',
          600: '#35353f',
        },
        signal: {
          DEFAULT: '#ff3b5c',
          dim: '#c92a48',
        },
        pulse: {
          DEFAULT: '#8b5cf6',
          soft: '#a78bfa',
        },
        rose: {
          deep: '#7a2856',
          bright: '#c23a7e',
        },
        mist: {
          100: '#f4f4f6',
          300: '#c7c7d1',
          500: '#8b8b98',
          700: '#5a5a66',
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
        card: '0 4px 24px -8px rgba(0,0,0,0.5)',
        glow: '0 0 0 1px rgba(255,59,92,0.4), 0 8px 24px -6px rgba(255,59,92,0.35)',
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
