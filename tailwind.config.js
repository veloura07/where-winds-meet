/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "rgba(255, 255, 255, 0.08)",
        input: "rgba(255, 255, 255, 0.15)",
        ring: "#ff6b35",
        background: "#050508",
        foreground: "#f8fafc",
        primary: {
          DEFAULT: "#ff6b35",
          foreground: "#f8fafc",
        },
        secondary: {
          DEFAULT: "rgba(255, 255, 255, 0.1)",
          foreground: "#f8fafc",
        },
        muted: {
          DEFAULT: "rgba(255, 255, 255, 0.05)",
          foreground: "#94a3b8",
        },
        accent: {
          DEFAULT: "#78dcca",
          foreground: "#050508",
        },
        card: {
          DEFAULT: "rgba(10, 10, 18, 0.55)",
          foreground: "#f8fafc",
        },
      },
    },
  },
  plugins: [],
}
