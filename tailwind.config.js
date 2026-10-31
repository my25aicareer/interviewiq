/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#0B1F44',
        brand: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          600: '#2563EB',
          700: '#1D4ED8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 1px 2px rgba(11, 31, 68, 0.04), 0 8px 24px -8px rgba(11, 31, 68, 0.08)',
        lift: '0 2px 4px rgba(11, 31, 68, 0.04), 0 16px 32px -12px rgba(11, 31, 68, 0.16)',
      },
    },
  },
  plugins: [],
};
