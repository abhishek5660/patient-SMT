/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: 'hsl(var(--primary-light) / <alpha-value>)',
          DEFAULT: 'hsl(var(--primary) / <alpha-value>)',
          dark: 'hsl(var(--primary-dark) / <alpha-value>)',
        },
        secondary: {
          light: 'hsl(var(--secondary-light) / <alpha-value>)',
          DEFAULT: 'hsl(var(--secondary) / <alpha-value>)',
          dark: 'hsl(var(--secondary-dark) / <alpha-value>)',
        },
        accent: {
          light: 'hsl(var(--accent-light) / <alpha-value>)',
          DEFAULT: 'hsl(var(--accent) / <alpha-value>)',
          dark: 'hsl(var(--accent-dark) / <alpha-value>)',
        },
        background: 'hsl(var(--background) / <alpha-value>)',
        surface: 'hsl(var(--surface) / <alpha-value>)',
        text: {
          primary: 'hsl(var(--text-primary) / <alpha-value>)',
          secondary: 'hsl(var(--text-secondary) / <alpha-value>)',
        },
        success: 'hsl(var(--success) / <alpha-value>)',
        warning: 'hsl(var(--warning) / <alpha-value>)',
        error: 'hsl(var(--error) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 4px 30px rgba(0, 0, 0, 0.1)',
        'glass-hover': '0 10px 40px rgba(0, 0, 0, 0.15)',
        'neumorphic': '20px 20px 60px #d1d9e6, -20px -20px 60px #ffffff',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.1))',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-slow': 'pulse 3s infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      },
    },
  },
  plugins: [],
}
