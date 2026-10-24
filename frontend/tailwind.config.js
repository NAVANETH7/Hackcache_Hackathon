/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        qc: {
          bg: '#F7F5EF',
          card: '#FFFFFF',
          cardMuted: '#FAF8F3',
          primary: '#174E46',
          primaryHover: '#123C36',
          primaryLight: '#E8F1EC',
          sage: '#D9E8DF',
          sageLight: '#EEF4F0',
          amber: '#F2C66D',
          amberLight: '#FDF7EA',
          amberDark: '#8F6413',
          text: '#26352F',
          muted: '#52665C',
          lightText: '#798C82',
          border: '#E3DED1',
          borderSubtle: '#EDE8DC',
          emergency: '#C93B2B',
          emergencyLight: '#FAECEB',
          emergencyDark: '#912417',
        },
        hospital: {
          50: '#F7F5EF',
          100: '#EEF4F0',
          500: '#174E46',
          600: '#123C36',
          700: '#0E2E2A',
          800: '#0B2320',
          900: '#071816',
        },
        alert: {
          red: '#C93B2B',
          amber: '#F2C66D',
          blue: '#2B5B84'
        }
      },
      fontFamily: {
        sans: [
          'Inter',
          'Noto Sans Tamil',
          'Noto Sans Devanagari',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif'
        ],
        mono: ['JetBrains Mono', 'Menlo', 'monospace']
      }
    },
  },
  plugins: [],
}
