/** @type {import('tailwindcss').Config} */
import plugin from "tailwindcss/plugin";

const BRAND_COLORS = {
    primary: {
        DEFAULT: "#F1F8F3", 50: "#DDEEE1", 100: "#BDDDC7", 200: "#91C4A5", 300: "#63A47D",
        400: "#3B7A57", 500: "#2F6C4B", 600: "#26563D", 700: "#204533", 800: "#1B392A", 900: "#0E2018"
    },
    secondary: {
        DEFAULT: "#EFFBFC", 50: "#D6F5F7", 100: "#B2EAEF", 200: "#7DDAE3", 300: "#41C0CF",
        400: "#2AB7CA", 500: "#228498", 600: "#226B7C", 700: "#245866", 800: "#224A57", 900: "#11303B"
    },
    tertiary: {
        DEFAULT: "#FBF7EB", 50: "#F5ECCC", 100: "#ECD79C", 200: "#E1BA63", 300: "#D9A441",
        400: "#C88A2A", 500: "#AC6B22", 600: "#8A4E1E", 700: "#734020", 800: "#633620", 900: "#391B0F"
    },
    quaternary: {
        DEFAULT: "#F6F6F6", 50: "#E7E7E7", 100: "#D1D1D1", 200: "#B0B0B0", 300: "#888888",
        400: "#6D6D6D", 500: "#5D5D5D", 600: "#4F4F4F", 700: "#454545", 800: "#3D3D3D", 900: "#2E2E2E"
    },
    quinary: {
        DEFAULT: "#F3F3EF", 50: "#EBEDE7", 100: "#DAD9CE", 200: "#C2C1AF", 300: "#A9A68E",
        400: "#989477", 500: "#8B846B", 600: "#746E5A", 700: "#605A4C", 800: "#4F4A3F", 900: "#292721"
    },
    senary: {
        DEFAULT: "#FEF2F2", 50: "#FEE2E2", 100: "#FECACA", 200: "#FCA5A5", 300: "#F87171",
        400: "#EF4444", 500: "#DC2626", 600: "#B91C1C", 700: "#991B1B", 800: "#7F1D1D", 900: "#450A0A"
    },
}

export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            fontFamily: {
                onest: ["Onest", "sans-serif"],
                passero: ["Passero One", "cursive"],
            },
            colors: {
                ...BRAND_COLORS,
                rank: {
                    DEFAULT: 'rgb(var(--rank-DEFAULT) / <alpha-value>)',
                    50: 'rgb(var(--rank-50) / <alpha-value>)',
                    100: 'rgb(var(--rank-100) / <alpha-value>)',
                    200: 'rgb(var(--rank-200) / <alpha-value>)',
                    300: 'rgb(var(--rank-300) / <alpha-value>)',
                    400: 'rgb(var(--rank-400) / <alpha-value>)',
                    500: 'rgb(var(--rank-500) / <alpha-value>)',
                    600: 'rgb(var(--rank-600) / <alpha-value>)',
                    700: 'rgb(var(--rank-700) / <alpha-value>)',
                    800: 'rgb(var(--rank-800) / <alpha-value>)',
                    900: 'rgb(var(--rank-900) / <alpha-value>)',
                }
            },
            animation: {
                float: "float 6s ease-in-out infinite",
                marquee: "marquee 5s linear infinite",
            },
            keyframes: {
                float: {
                    "0%, 100%": { transform: "translateY(0) rotate(12deg)" },
                    "50%": { transform: "translateY(-10px) rotate(12deg)" },
                },
                marquee: {
                    "0%": { transform: "translateX(0%)" },
                    "100%": { transform: "translateX(-100%)" },
                },
            },
        },
    },
    plugins: [
        plugin(function({ addBase }) {
            function hexToRgbString(hex) {
                if (!hex) return "0 0 0"; 
                hex = hex.replace(/^#/, '');
                if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
                
                const r = parseInt(hex.substring(0, 2), 16);
                const g = parseInt(hex.substring(2, 4), 16);
                const b = parseInt(hex.substring(4, 6), 16);
                return `${r} ${g} ${b}`;
            }

            const mapPaletteToRgb = (palette) => ({
                '--rank-DEFAULT': hexToRgbString(palette.DEFAULT),
                '--rank-50': hexToRgbString(palette[50]),
                '--rank-100': hexToRgbString(palette[100]),
                '--rank-200': hexToRgbString(palette[200]),
                '--rank-300': hexToRgbString(palette[300]),
                '--rank-400': hexToRgbString(palette[400]),
                '--rank-500': hexToRgbString(palette[500]),
                '--rank-600': hexToRgbString(palette[600]),
                '--rank-700': hexToRgbString(palette[700]),
                '--rank-800': hexToRgbString(palette[800]),
                '--rank-900': hexToRgbString(palette[900]),
            });

            addBase({
                ':root, .theme-rank-1': mapPaletteToRgb(BRAND_COLORS.primary),
                '.theme-rank-2': mapPaletteToRgb(BRAND_COLORS.secondary),
                '.theme-rank-3': mapPaletteToRgb(BRAND_COLORS.senary),
                '.theme-rank-4': mapPaletteToRgb(BRAND_COLORS.tertiary),
            });
        })
    ],
};
