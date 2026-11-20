/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#14283F",
          50: "#F0F4F8",
          100: "#D9E2EC",
          200: "#BCCCDC",
          700: "#1B3A5B",
          800: "#14283F",
          900: "#0F1E30",
        },
        teal: {
          DEFAULT: "#087E83",
          50: "#EFFBFC",
          100: "#C7F1F3",
          600: "#087E83",
          700: "#066569",
        },
        slate: {
          text: "#34465A",
        },
        offwhite: "#F6F8FA",
        urgent: {
          DEFAULT: "#DC2626",
          bg: "#FEF2F2",
          border: "#F87171",
        },
        clarify: {
          DEFAULT: "#D97706",
          bg: "#FFFBEB",
          border: "#FCD34D",
        }
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
}
