import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy:         '#0F2B5B',
          blue:         '#1A4A9C',
          orange:       '#F47B20',
          'orange-light': '#FFA040',
          'gray-light': '#F5F6FA',
          'gray-dark':  '#2D3748',
          'gray-mid':   '#718096',
        },
      },
      fontFamily: {
        heading: ['Syne', 'sans-serif'],
        body:    ['DM Sans', 'sans-serif'],
      },
      borderRadius: {
        card:   '12px',
        button: '8px',
      },
      boxShadow: {
        card:         '0 4px 24px rgba(15,43,91,0.10)',
        'card-hover': '0 8px 32px rgba(15,43,91,0.16)',
        orange:       '0 4px 16px rgba(244,123,32,0.30)',
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease-out both',
      },
      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
export default config