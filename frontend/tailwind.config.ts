import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#534AB7',
          DEFAULT: '#7F77DD',
          light: '#AFA9EC',
          lighter: '#CECBF6',
        },
      },
    },
  },
  plugins: [],
} satisfies Config
