/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Noto Sans JP', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        hand: ['Zen Kurenaido', 'sans-serif'],
        marker: ['Yomogi', 'cursive'],
        pen: ['Klee One', 'cursive'],
        serif: ['Shippori Mincho', 'serif'],
        pixel: ['DotGothic16', 'sans-serif'],
        cute: ['Potta One', 'cursive'],
        elegant: ['Kaisei Opti', 'serif'],
      },
      colors: {
        cyber: {
          400: '#34d399', // Emerald-400
          500: '#10b981', // Emerald-500
          900: '#064e3b', // Emerald-900
        }
      }
    },
  },
  plugins: [],
}