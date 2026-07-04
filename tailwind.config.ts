import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#061D32",
        ocean: "#0B3A4B",
        deep: "#062238",
        teal: "#1AA6A6",
        gold: "#D9A24A",
        warm: "#F3C679",
        coral: "#E06F4F",
        cloud: "#F6F3EE",
        line: "#D9E2E7",
      },
      borderRadius: {
        ui: "8px",
      },
      boxShadow: {
        soft: "0 18px 60px rgba(6, 29, 50, 0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
