import type { Config } from "tailwindcss";

export default {
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
        'custom-green': {
          DEFAULT: 'oklch(62.7% 0.194 149.214)',
          hover: 'oklch(58% 0.194 149.214)',
          dark: 'oklch(45% 0.194 149.214)',
          50: 'oklch(95% 0.05 149.214)',
          100: 'oklch(90% 0.1 149.214)',
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
