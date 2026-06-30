import type { Config } from "tailwindcss";

const withOpacity = (variable: string) => `rgb(var(${variable}) / <alpha-value>)`;

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        page: withOpacity("--page"),
        card: withOpacity("--card"),
        "card-hover": withOpacity("--card-hover"),
        line: withOpacity("--line"),
        ink: withOpacity("--ink"),
        muted: withOpacity("--muted"),
        brand: withOpacity("--brand"),
        "brand-hover": withOpacity("--brand-hover"),
        "brand-ink": withOpacity("--brand-ink"),
      },
    },
  },
  plugins: [],
};
export default config;
