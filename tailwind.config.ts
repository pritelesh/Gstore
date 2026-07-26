import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#293681",
        surface: "#2F3D9A",
        text: "#FAFFC4",
        accent: "#FE7F2D",
      },
    },
  },
  plugins: [],
};
export default config;
