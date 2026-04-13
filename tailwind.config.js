import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    path.join(__dirname, 'index.html'),
    path.join(__dirname, 'src/**/*.{js,jsx}'),
  ],
  theme: {
    extend: {
      colors: {
        primary:  '#224E5F',
        primary2: '#1a3d4d',
        primary3: '#2d6478',
        accent:   '#D77B49',
        accent2:  '#e08a5c',
        bg:       '#e8e4dc',
        // Legacy aliases kept for compatibility
        navy:     '#224E5F',
        navy2:    '#1a3d4d',
        gold:     '#D77B49',
        gold2:    '#e08a5c',
      },
      fontFamily: {
        sans:    ['"DM Sans"', 'sans-serif'],
        display: ['"Playfair Display"', 'serif'],
      },
    },
  },
  plugins: [],
}
