/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Instrument Serif"', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        ink: {
          950: '#020409',
          900: '#050816',  // main bg
          800: '#0F172A',  // surface / card
          700: '#1E293B',
          600: '#334155',
          500: '#475569',
        },
        cream: {
          50: '#FFFFFF',
          100: '#E5E7EB',  // main text
          200: '#CBD5E1',
          300: '#94A3B8',  // secondary text
          400: '#64748B',
          500: '#475569',
        },
        // 'amber' keys retained for component-class backwards-compat,
        // values now mapped to the blue primary scale.
        amber: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#60A5FA',
          400: '#3B82F6',  // primary accent
          500: '#2563EB',
          600: '#1D4ED8',
          700: '#1E40AF',
        },
        violet: {
          400: '#8B5CF6',  // secondary accent
          500: '#7C3AED',
          600: '#6D28D9',
        },
        cyan: {
          400: '#22D3EE',  // data flow accent (scheduler)
          500: '#06B6D4',
          600: '#0891B2',
        },
      },
      animation: {
        'blink': 'blink 1s step-start infinite',
        'fade-up': 'fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in': 'fadeIn 0.6s ease forwards',
        'shimmer': 'shimmer 2s linear infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0 },
        },
        fadeUp: {
          '0%': { opacity: 0, transform: 'translateY(20px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
      },
      letterSpacing: {
        tightest: '-0.05em',
        tighter: '-0.03em',
        snug: '-0.01em',
      },
      backgroundImage: {
        'grain': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
};
