/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f8f6ff',
          100: '#f0ebff',
          200: '#e1d7ff',
          300: '#cdb8ff',
          400: '#b494ff',
          500: '#667eea',
          600: '#764ba2',
          700: '#5a2d82',
          800: '#451a68',
          900: '#2d0f4e',
        },
        secondary: {
          50: '#faf8ff',
          100: '#f3f0ff',
          200: '#e6e0ff',
          300: '#d9ceff',
          400: '#ccbbff',
          500: '#764ba2',
          600: '#6b4197',
          700: '#5a2d82',
          800: '#451a68',
          900: '#2d0f4e',
        },
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'gradient-hover': 'linear-gradient(135deg, #5a6fd8 0%, #6a3f95 100%)',
      },
      animation: {
        float: 'float 3s ease-in-out infinite',
        spin: 'spin 1s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
      },
    },
  },
  plugins: [],
}
