/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'cream': '#faf7f2',
        'warm-white': '#fefcf8',
        'soft-beige': '#f5f1eb',
        'dusty-rose': '#d4a574',
        'warm-gold': '#c9a876',
        'deep-rose': '#b8956a',
        'charcoal': '#2c2c2c',
        'soft-gray': '#6b6b6b',
        'light-gray': '#a8a8a8',
      },
      fontFamily: {
        'serif': ['Cormorant Garamond', 'serif'],
        'sans': ['Inter', 'sans-serif'],
      },
      animation: {
        'gentle-float': 'gentle-float 8s ease-in-out infinite',
        'soft-pulse': 'soft-pulse 4s ease-in-out infinite',
        'elegant-fade-in': 'elegant-fade-in 0.8s ease-out',
      },
      backdropBlur: {
        'xs': '2px',
      },
      boxShadow: {
        'elegant': '0 10px 40px rgba(0, 0, 0, 0.08)',
        'elegant-hover': '0 15px 50px rgba(0, 0, 0, 0.12)',
      },
    },
  },
  plugins: [],
};