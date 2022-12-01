/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "kichou-gray": "#737373",
        "kichou-red": "#ED4739",
        "kichou-dark-red": "#5A040A",
      },
    },
  },
  plugins: [],
};
