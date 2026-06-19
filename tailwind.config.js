/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,vue}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        bg: {
          DEFAULT: '#1a1a2e',
          dark: '#16162a',
          darker: '#0f0f1a',
          light: '#252542',
        },
        panel: {
          DEFAULT: '#1e1e36',
          hover: '#2a2a4a',
          border: '#3a3a5c',
        },
        accent: {
          blue: '#00d4ff',
          orange: '#ff9500',
          green: '#00ff88',
          purple: '#bf5af2',
          red: '#ff3b30',
        },
        text: {
          DEFAULT: '#e0e0e0',
          secondary: '#a0a0b0',
          muted: '#6b6b80',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};
