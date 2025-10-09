/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './app/**/*.{js,jsx}',
    './src/**/*.{js,jsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        'background': 'hsl(var(--background))',
        'foreground': 'hsl(var(--foreground))',
        'card': 'hsl(var(--card))',
        'primary': {
          DEFAULT: '#5C6BF3',
          50: '#f0f2ff',
          100: '#e4e7ff',
          200: '#cdd2ff',
          300: '#a6b0ff',
          400: '#7c85ff',
          500: '#5C6BF3',
          600: '#4c5ce8',
          700: '#3d4bcc',
          800: '#323ea4',
          900: '#2d3582',
        },
        'accent': {
          DEFAULT: '#00D4FF',
          50: '#f0fcff',
          100: '#e0f9ff',
          200: '#baf2ff',
          300: '#7de8ff',
          400: '#38daff',
          500: '#00D4FF',
          600: '#00a8cc',
          700: '#0086a3',
          800: '#006b85',
          900: '#00596e',
        },
        'darkBg': '#0A0A0F',
        'destructive': 'hsl(var(--destructive))',
        'success': 'hsl(var(--success))',
        'border': 'hsl(var(--border))',
        'muted-foreground': 'hsl(var(--muted-foreground))',
        // Light mode specific colors
        'light': {
          'bg': '#ffffff',
          'surface': '#f8fafc',
          'border': '#e2e8f0',
          'text': '#1e293b',
          'muted': '#64748b',
        },
        // Dark mode specific colors
        'dark': {
          'bg': '#0f172a',
          'surface': '#1e293b',
          'border': '#334155',
          'text': '#f1f5f9',
          'muted': '#94a3b8',
        }
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "glowing": {
          "0%, 100%": { "box-shadow": "0 0 5px #0ea5e9, 0 0 10px #0ea5e9" },
          "50%": { "box-shadow": "0 0 20px #0ea5e9, 0 0 30px #0ea5e9" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          "0%": { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "slide-in-left": {
          "0%": { opacity: "0", transform: "translateX(-20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.9)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "glowing": "glowing 3s ease-in-out infinite",
        "fade-in": "fade-in 0.5s ease-out",
        "slide-in-right": "slide-in-right 0.5s ease-out",
        "slide-in-left": "slide-in-left 0.5s ease-out",
        "scale-in": "scale-in 0.3s ease-out",
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'light-gradient': 'linear-gradient(to bottom right, #f8fafc, #e2e8f0, #f1f5f9)',
        'dark-gradient': 'linear-gradient(to bottom right, #020817, #0f172a, #020817)',
      },
      boxShadow: {
        'light': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'light-md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'light-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'dark': '0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px 0 rgba(0, 0, 0, 0.2)',
        'dark-md': '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
        'dark-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
      }
    },
  },
  plugins: [],
}