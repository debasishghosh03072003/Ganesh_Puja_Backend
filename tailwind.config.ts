import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fdf4f4',
          100: '#fbe6e6',
          200: '#f7d2d2',
          300: '#f0b1b1',
          400: '#e48484',
          500: '#d45656',
          600: '#be3a3a',
          700: '#9f2d2d',
          800: '#842828', // Maroon primary
          900: '#702424',
          950: '#3d0e0e',
        },
        festive: {
          gold: '#D97706',
          goldLight: '#F59E0B',
          amber: '#B45309',
          cream: '#FFFDF9',
          creamDark: '#F7F3EA',
          card: '#FFFFFF',
        },
        maroon: {
          50: '#FAF4F4',
          100: '#F5E6E6',
          600: '#991B1B',
          700: '#800020',
          800: '#6B001B',
          900: '#4D0013',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'festive': '0 4px 20px -2px rgba(112, 10, 26, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
        'festive-lg': '0 10px 30px -4px rgba(112, 10, 26, 0.12), 0 4px 12px -2px rgba(0, 0, 0, 0.06)',
      }
    },
  },
  plugins: [],
};
export default config;
