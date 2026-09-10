/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#1A1A1A",
        paper: "#FAFAFA",
        flame: "#FF532C", // orange on dark backgrounds
        ember: "#D02802", // orange on light backgrounds
      },
      fontFamily: {
        heading: ["var(--font-heading)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      keyframes: {
        "pop-in": {
          "0%": { transform: "scale(0.85)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(255,83,44,0.55)" },
          "50%": { boxShadow: "0 0 0 18px rgba(255,83,44,0)" },
        },
      },
      animation: {
        "pop-in": "pop-in 0.4s cubic-bezier(0.17,0.67,0.12,1) both",
        "pulse-glow": "pulse-glow 1.8s ease-out infinite",
      },
    },
  },
  plugins: [],
};
