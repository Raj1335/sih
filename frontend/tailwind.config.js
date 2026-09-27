/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        surface: {
          lowest: '#060e20',
          low: '#131b2e',
          DEFAULT: '#0b1326',
          high: '#222a3d',
          highest: '#2d3449',
          bright: '#31394d',
          variant: '#2d3449',
        },
        onsurface: {
          DEFAULT: '#dae2fd',
          variant: '#e0c0b1',
        },
        flood: {
          primary: '#f97316',
          'primary-light': '#ffb690',
          'on-primary': '#552100',
          secondary: '#ffb95f',
          'secondary-container': '#ee9800',
          tertiary: '#adc6ff',
          'tertiary-container': '#6399ff',
        },
        alert: {
          green: '#10b981',
          amber: '#eab308',
          orange: '#f97316',
          red: '#ef4444',
          'red-container': '#93000a',
        }
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ripple': 'ripple 2s linear infinite',
      },
      keyframes: {
        ripple: {
          '0%': { transform: 'scale(0.8)', opacity: '1' },
          '100%': { transform: 'scale(2.4)', opacity: '0' },
        }
      }
    },
  },
  plugins: [],
}