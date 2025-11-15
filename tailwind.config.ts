import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "#0f1115",
        surface: "#161922",
        accent: "#3f8cff",
        muted: "#6c7a89",
        highlight: "rgba(63, 140, 255, 0.25)"
      }
    }
  },
  plugins: []
};

export default config;
