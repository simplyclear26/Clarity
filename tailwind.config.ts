import type { Config } from 'tailwindcss'
const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        teal: { DEFAULT: '#2AB8A0', dark: '#1A7A6A', light: '#E8F8F5' },
        charcoal: { DEFAULT: '#1C1C1E', 2: '#3A3A3C', 3: '#636366', 4: '#8E8E93' },
        sand: '#FAF8F4',
        border: '#E5E3DF',
        amber: { DEFAULT: '#C9895A', dark: '#A86B40' },
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        serif: ['DM Serif Display', 'serif'],
      },
    },
  },
  plugins: [],
}
export default config
