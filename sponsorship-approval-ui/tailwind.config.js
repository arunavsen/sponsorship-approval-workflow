/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#00685f',
        'primary-strong': '#005049',
        'primary-soft': '#d7f6f1',
        'secondary-soft': '#d0e1fb',
        surface: '#f8f9fa',
        'surface-low': '#f3f4f5',
        'surface-card': '#ffffff',
        'surface-line': '#dfe5e7',
        ink: '#191c1d',
        muted: '#596865',
        'muted-2': '#6d7a77',
        danger: '#ba1a1a',
        'danger-soft': '#ffdad6',
        success: '#007a47',
        'success-soft': '#dff6e9',
        warning: '#8a6100',
        'warning-soft': '#ffedc2',
        'brand-blue': '#335f91',
        'brand-blue-soft': '#e2eefb',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
      },
      boxShadow: {
        card: '0 18px 40px rgba(20, 31, 35, 0.08)',
        panel: '0 1px 0 rgba(20, 31, 35, 0.02)',
        'inset-accent': 'inset 4px 0 0 #00685f',
        'focus-ring': '0 0 0 3px rgba(0, 104, 95, 0.14)',
      },
    },
  },
  plugins: [],
};
