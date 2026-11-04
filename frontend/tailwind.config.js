/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        carrier: {
          50: "#e9f2ff",
          500: "#0b6cf0",
          600: "#0a5ad0",
          700: "#0847a6",
        },
      },
    },
  },
  plugins: [],
};
