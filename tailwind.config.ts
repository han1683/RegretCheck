import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#07090f",
        smoke: "#a7b0c3",
        mint: "#7cf6c3",
        coral: "#ff7a90",
        lemon: "#f8d66d",
      },
      boxShadow: {
        glow: "0 0 60px rgba(124, 246, 195, 0.16)",
      },
    },
  },
  plugins: [],
};

export default config;
