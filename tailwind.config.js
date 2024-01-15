/** @type {import('tailwindcss').Config} */ 
module.exports = {
  content: ["./app/**/*.{html,js}"],
  theme: { extend: {} },
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/aspect-ratio"),
    require("@tailwindcss/typography"),
  ],
};