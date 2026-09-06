import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#132238",
        muted: "#718096",
        navy: "#102a56",
        brand: "#1677ff",
        cyan: "#16c8da",
        mint: "#e4fbf3",
        canvas: "#f4f8fd",
        line: "#e6edf6",
      },
      boxShadow: {
        card: "0 14px 36px rgba(18, 51, 91, 0.08)",
        soft: "0 6px 20px rgba(18, 51, 91, 0.08)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
    },
  },
  plugins: [],
};

export default config;
