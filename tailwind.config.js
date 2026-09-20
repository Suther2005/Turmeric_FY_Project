/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        agri: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#072e1a',
          deep: '#0b3525',
          forest: '#0f4431',
          surface: '#f6f9f7',
          card: '#ffffff',
          border: '#e2ece6'
        },
        risk: {
          low: '#10b981',
          moderate: '#f59e0b',
          high: '#ef4444',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Outfit', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace']
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(15, 68, 49, 0.05), 0 4px 6px -2px rgba(15, 68, 49, 0.025)',
        'card': '0 4px 20px -2px rgba(11, 53, 37, 0.06), 0 2px 6px -1px rgba(11, 53, 37, 0.03)',
        'elevated': '0 20px 30px -10px rgba(11, 53, 37, 0.12), 0 10px 15px -5px rgba(11, 53, 37, 0.05)',
        'glow': '0 0 25px -5px rgba(34, 197, 94, 0.3)',
      }
    },
  },
  plugins: [],
}
