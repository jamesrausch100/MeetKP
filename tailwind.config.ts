import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        kp: {
          primary: '#e11d48',    // rose-600 — desire
          secondary: '#7c3aed',  // violet-600 — mystery
          dark: '#0f0d15',       // deep purple-black
          card: '#1a1625',       // card surfaces
          surface: '#13111a',    // slightly lighter bg
          muted: '#9ca3af',      // gray-400 text
          accent: '#f472b6',     // pink-400 glow
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'sans-serif'],
      },
      animation: {
        'swipe-right': 'swipeRight 0.4s ease-out forwards',
        'swipe-left': 'swipeLeft 0.4s ease-out forwards',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        swipeRight: {
          '0%': { transform: 'translateX(0) rotate(0)' },
          '100%': { transform: 'translateX(150%) rotate(20deg)', opacity: '0' },
        },
        swipeLeft: {
          '0%': { transform: 'translateX(0) rotate(0)' },
          '100%': { transform: 'translateX(-150%) rotate(-20deg)', opacity: '0' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(225, 29, 72, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(225, 29, 72, 0.6)' },
        },
      },
    },
  },
  plugins: [],
}
export default config
