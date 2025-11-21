/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary)',
          light: 'var(--color-primary-light)',
        },
        default: {
          DEFAULT: 'var(--color-background-default)',
        },
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  },
}

