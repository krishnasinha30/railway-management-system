/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'plum-950': '#1C0825',
        'plum-900': '#2B0A38',
        'purple-700': '#6F1D86',
        'purple-600': '#902DAA',
        'purple-400': '#C15AD4',
        'lavender-50': '#F7F0F8',
        'text-primary': '#24152A',
        'text-secondary': '#6B6470',
        success: '#16A34A',
        warning: '#F59E0B',
        danger: '#DC2626',
        info: '#2563EB',
        ink: '#1C0825',
        deep: '#2B0A38',
        plum: '#6F1D86',
        orchid: '#902DAA',
        lilac: '#C15AD4',
        flare: '#DC2626',
        mist: '#F7F0F8',
      },
      fontFamily: {
        display: ['Georgia', 'serif'],
        sans: ['DM Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 20px 60px rgba(36, 16, 47, 0.12)',
      },
    },
  },
  plugins: [],
}
