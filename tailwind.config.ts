import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        sharks: {
          navy: "#06245c",
          blue: "#00a6fb",
          gold: "#f59e0b",
        },
      },
    },
  },
  plugins: [],
}

export default config
