/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#F8F8F5',
        ink: {
          900: '#18181B',
          700: '#3F3F46',
          500: '#71717A',
          400: '#A1A1AA',
          200: '#E4E4E7',
          100: '#F4F4F5',
          50: '#FAFAFA'
        },
        brand: {
          DEFAULT: '#4F46E5',
          hover: '#4338CA',
          light: '#EEF2FF',
          border: '#C7D2FE'
        },
        accent: {
          DEFAULT: '#7C3AED',
          light: '#F5F3FF'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        subtle: '0 1px 2px 0 rgba(0, 0, 0, 0.04), 0 1px 3px 0 rgba(0, 0, 0, 0.06)',
        card: '0 2px 8px -2px rgba(0, 0, 0, 0.05), 0 4px 16px -4px rgba(0, 0, 0, 0.04)',
        hover: '0 8px 24px -4px rgba(0, 0, 0, 0.08), 0 4px 12px -2px rgba(0, 0, 0, 0.04)'
      }
    },
  },
  plugins: [],
}
