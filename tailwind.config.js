/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2D5016',
          dark: '#1B4D3E',
          light: '#3D6326',
          gradient: {
            from: '#1B4D3E',
            to: '#2D5016',
          },
        },
        secondary: {
          DEFAULT: '#C85A3E',
          light: '#D67A64',
          dark: '#A84830',
        },
        accent: {
          DEFAULT: '#D4AF37',
          light: '#F4E5A1',
          dark: '#B89A2F',
          gold: '#D4AF37',
        },
        cream: {
          DEFAULT: '#F5F1E8',
          light: '#FAF7F0',
          dark: '#E8E1D3',
        },
        terracotta: '#C85A3E',
        gold: '#D4AF37',
        'dark-overlay': 'rgba(26, 26, 26, 0.8)',
      },
      fontFamily: {
        heading: ['Playfair Display', 'serif'],
        subheading: ['Cormorant Garamond', 'serif'],
        body: ['Inter', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        numbers: ['Space Grotesk', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '16px',
        card: '16px',
        modal: '24px',
        button: '12px',
      },
      boxShadow: {
        soft: '0 4px 6px -1px rgba(45, 80, 22, 0.1), 0 2px 4px -1px rgba(45, 80, 22, 0.06)',
        'soft-lg': '0 10px 15px -3px rgba(45, 80, 22, 0.1), 0 4px 6px -2px rgba(45, 80, 22, 0.05)',
        sm: '0 2px 8px rgba(0, 0, 0, 0.08)',
        md: '0 4px 16px rgba(0, 0, 0, 0.12)',
        lg: '0 8px 32px rgba(0, 0, 0, 0.16)',
        xl: '0 16px 48px rgba(0, 0, 0, 0.20)',
        colored: '0 8px 24px rgba(45, 80, 22, 0.25)',
        glass: '0 8px 32px rgba(45, 80, 22, 0.12)',
        'neu-light': '6px 6px 12px rgba(0, 0, 0, 0.1), -6px -6px 12px rgba(255, 255, 255, 0.9)',
        'neu-dark': 'inset 4px 4px 8px rgba(0, 0, 0, 0.1), inset -4px -4px 8px rgba(255, 255, 255, 0.1)',
        glow: '0 0 20px rgba(212, 175, 55, 0.5)',
        'glow-green': '0 0 20px rgba(45, 80, 22, 0.4)',
      },
      backdropBlur: {
        glass: '12px',
      },
      animation: {
        float: 'float 3s ease-in-out infinite',
        'float-delayed': 'float 3s ease-in-out 0.5s infinite',
        'float-slow': 'float 4s ease-in-out infinite',
        shimmer: 'shimmer 2s linear infinite',
        'spin-slow': 'spin 3s linear infinite',
        bounce: 'bounce 1s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'fade-in': 'fadeIn 0.3s ease-in',
        'scale-in': 'scaleIn 0.2s ease-out',
        ripple: 'ripple 0.6s ease-out',
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'leaf-fall': 'leafFall 10s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        ripple: {
          '0%': { transform: 'scale(0)', opacity: '1' },
          '100%': { transform: 'scale(4)', opacity: '0' },
        },
        leafFall: {
          '0%': { transform: 'translateY(-100vh) rotate(0deg)', opacity: '0' },
          '10%': { opacity: '1' },
          '90%': { opacity: '1' },
          '100%': { transform: 'translateY(100vh) rotate(360deg)', opacity: '0' },
        },
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #1B4D3E 0%, #2D5016 100%)',
        'gradient-gold': 'linear-gradient(135deg, #D4AF37 0%, #F4E5A1 100%)',
        'gradient-glass': 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)',
        'gradient-mesh': 'radial-gradient(circle at 20% 50%, rgba(27, 77, 62, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(212, 175, 55, 0.1) 0%, transparent 50%)',
        shimmer: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
      },
    },
  },
  plugins: [],
};
