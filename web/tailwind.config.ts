import type { Config } from 'tailwindcss'

export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef6ff',
          100: '#d9ebff',
          200: '#b9daff',
          300: '#89c1ff',
          400: '#57a1ff',
          500: '#2e7aff',
          600: '#1f5bef',
          700: '#1c48c4',
          800: '#1a3e9b',
          900: '#19397d'
        }
      }
    }
  },
  plugins: []
} satisfies Config


