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
        // Flip7 Design System Colors (Teal, Coral, Gold, Cream)
        flip: {
          teal: {
            DEFAULT: "#2BA8A2",
            light: "#3CC4BD",
            dark: "#1E8C86",
            bg: "#E8F6F5",
          },
          gold: {
            DEFAULT: "#FFD23F",
            light: "#FFE47A",
            dark: "#E6B800",
          },
          coral: {
            DEFAULT: "#EF6C4A",
            light: "#FF8A6A",
            dark: "#D45233",
          },
          cream: {
            DEFAULT: "#FFF8E7",
            dark: "#F4ECD4",
          },
          sky: {
            DEFAULT: "#5DADE2",
            light: "#85C1E9",
            dark: "#3498DB",
          },
        },
        surface: {
          base: "#EFF8F7",
          card: "#FFFFFF",
        },
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
          DEFAULT: "#2BA8A2",
          50: "#EFF8F7",
          100: "#E8F6F5",
          200: "#C7F1F3",
          600: "#2BA8A2",
          700: "#1E8C86",
        },
        slate: {
          text: "#34465A",
        },
        offwhite: "#EFF8F7",
        urgent: {
          DEFAULT: "#EF6C4A",
          bg: "#FFF3F0",
          border: "#FF8A6A",
        },
        clarify: {
          DEFAULT: "#D97706",
          bg: "#FFFBEB",
          border: "#FCD34D",
        },
      },
      borderRadius: {
        sm: "8px",
        md: "16px",
        lg: "24px",
        xl: "32px",
        round: "999px",
      },
      boxShadow: {
        "card": "0 4px 20px rgba(43, 168, 162, 0.10)",
        "teal-glow": "0 4px 20px rgba(43, 168, 162, 0.30)",
        "coral-glow": "0 4px 20px rgba(239, 108, 74, 0.35)",
        "accent-glow": "0 4px 20px rgba(255, 210, 63, 0.40)",
        "sky-glow": "0 4px 16px rgba(93, 173, 226, 0.30)",
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "PingFang SC",
          "Microsoft YaHei",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
