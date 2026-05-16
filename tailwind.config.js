/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "#0F1B2D",
          elevated: "#152743",
          surface: "#1B3055"
        },
        accent: {
          DEFAULT: "#6C5CE7",
          hover: "#7B6CF0",
          muted: "#3B2F8A"
        }
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"]
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" }
        },
        bounce1: {
          "0%, 80%, 100%": { transform: "scale(0.6)", opacity: "0.4" },
          "40%": { transform: "scale(1)", opacity: "1" }
        }
      },
      animation: {
        "fade-in": "fade-in 0.2s ease-out",
        "dot-1": "bounce1 1.2s ease-in-out infinite",
        "dot-2": "bounce1 1.2s ease-in-out 0.15s infinite",
        "dot-3": "bounce1 1.2s ease-in-out 0.3s infinite"
      }
    }
  },
  plugins: []
};
