/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class", // Enables manual class-based dark mode toggling
  theme: {
    extend: {
      colors: {
        "rabbit-red": "#ea2e0e",
      },
    },
  },
  plugins: [],
}