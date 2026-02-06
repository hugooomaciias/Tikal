/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        onest: ['Onest', 'sans-serif'],
        passero: ['Passero One', 'cursive'],
      },
      colors: {
        primary: {
          DEFAULT: '#F1F8F3',
          50: '#DDEEE1',
          100: '#BDDDC7',
          200: '#91C4A5',
          300: '#63A47D',
          400: '#3B7A57',
          500: '#2F6C4B',
          600: '#26563D',
          700: '#204533',
          800: '#1B392A',
          900: '#0E2018',
        },
        secondary: {
          DEFAULT: '#EFFBFC',
          50: '#D6F5F7',
          100: '#B2EAEF',
          200: '#7DDAE3',
          300: '#41C0CF',
          400: '#2AB7CA',
          500: '#228498',
          600: '#226B7C',
          700: '#245866',
          800: '#224A57',
          900: '#11303B',
        },
        tertiary: {
          DEFAULT: '#FBF7EB',
          50: '#F5ECCC',
          100: '#ECD79C',
          200: '#E1BA63',
          300: '#D9A441',
          400: '#C88A2A',
          500: '#AC6B22',
          600: '#8A4E1E',
          700: '#734020',
          800: '#633620',
          900: '#391B0F',
        },
        quaternary: {
          DEFAULT: '#F6F6F6',
          50: '#E7E7E7',
          100: '#D1D1D1',
          200: '#B0B0B0',
          300: '#888888',
          400: '#6D6D6D',
          500: '#5D5D5D',
          600: '#4F4F4F',
          700: '#454545',
          800: '#3D3D3D',
          900: '#2E2E2E',
        },
        quinary: {
          DEFAULT: '#F3F3EF',
          50: '#EBEDE7',
          100: '#DAD9CE',
          200: '#C2C1AF',
          300: '#A9A68E',
          400: '#989477',
          500: '#8B846B',
          600: '#746E5A',
          700: '#605A4C',
          800: '#4F4A3F',
          900: '#292721',
        }
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0) rotate(12deg)' },
          '50%': { transform: 'translateY(-10px) rotate(12deg)' },
        }
      }
    },
  },
  plugins: [],
}