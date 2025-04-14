/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        'divine-saffron': '#FF9933',
        'divine-gold': '#FFD700',
        'divine-maroon': '#800000',
        'divine-blue': '#000080', // Deep blue
        'divine-pink': '#FFC0CB', // Lotus pink base
        'divine-lotus': '#E6A8D7', // A deeper lotus pink
        'light-bg': '#FFF8DC', // Cornsilk light background
        'dark-bg': '#2C1B47',  // Deep purple/blue dark background
        'light-text': '#4A1D3D', // Dark maroon/purple text for light mode
        'dark-text': '#F3EAD3',  // Creamy text for dark mode
      },
      fontFamily: {
        // Add Devanagari fonts - ensure you import them in index.css
        'devanagari': ['"Tiro Devanagari Sanskrit"', 'serif'],
        'sans': ['Inter', 'system-ui', 'Avenir', 'Helvetica', 'Arial', 'sans-serif'], // Keep a default sans
      },
      backgroundImage: {
        // Add subtle patterns here if desired
        'om-pattern': "url('/path/to/om-subtle-bg.svg')",
        'mandala-pattern': "url('/path/to/mandala-subtle-bg.svg')",
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
      },
    },
  },
  plugins: [],
}