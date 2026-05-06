// frontend/tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"],
      },
      colors: {
        brand: {
          50:  "#f0f4ff",
          100: "#dde6ff",
          200: "#c3d0ff",
          300: "#9cb0ff",
          400: "#7285ff",
          500: "#4f5eff",   // primary
          600: "#3a40f5",
          700: "#2f32db",
          800: "#292cb1",
          900: "#272c8b",
          950: "#191a52",
        },
      },
      backgroundImage: {
        "glass-gradient":
          "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)",
      },
      backdropBlur: {
        xs: "2px",
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
        "glass-sm": "0 4px 16px 0 rgba(0, 0, 0, 0.25)",
      },
    },
  },
  plugins: [],
};
