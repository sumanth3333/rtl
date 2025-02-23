import type { Config } from "tailwindcss";

export default {
  darkMode: "class", // ✅ Use class-based dark mode
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        zinc: {
          850: "#1a1a1e", // ✅ Custom mid-dark gray
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
