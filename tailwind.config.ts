import type { Config } from "tailwindcss";

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
        oura: {
          50: "#e8f0fe",
          100: "#d2e3fc",
          200: "#aecbfa",
          300: "#8ab4f8",
          400: "#669df6",
          500: "#4285f4",
          600: "#1a73e8",
          700: "#1967d2",
          800: "#185abc",
          900: "#174ea6",
          950: "#0d3073",
        },
        accent: {
          violet: "#8b5cf6",
          rose: "#f43f5e",
          amber: "#f59e0b",
          emerald: "#10b981",
          cyan: "#06b6d4",
        },
        surface: {
          1: "var(--surface-container-lowest)",
          2: "var(--surface-container-low)",
          3: "var(--surface-container)",
          4: "var(--surface-container-high)",
          5: "var(--surface-container-highest)",
        },
      },
      boxShadow: {
        "glass": "none",
        "glass-dark": "none",
        "card": "0 1px 2px rgba(0, 0, 0, 0.04)",
        "card-dark": "0 1px 2px rgba(0, 0, 0, 0.1)",
        "card-hover": "0 2px 8px rgba(0, 0, 0, 0.06)",
        "soft": "0 1px 3px rgba(0, 0, 0, 0.04)",
        "soft-dark": "0 1px 3px rgba(0, 0, 0, 0.12)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
      screens: {
        "motion-safe": { raw: "(prefers-reduced-motion: no-preference)" },
        "motion-reduce": { raw: "(prefers-reduced-motion: reduce)" },
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "20px",
        "4xl": "24px",
      },
      transitionTimingFunction: {
        "m3": "cubic-bezier(0.2, 0, 0, 1)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease",
        "slide-up": "slideUp 0.3s ease",
        "slide-in-right": "slideInRight 0.25s ease",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 6s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
        "loading-bar": "loadingBar 1.5s ease infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(8px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        loadingBar: {
          "0%": { transform: "translateX(-100%)", width: "30%" },
          "50%": { width: "60%" },
          "100%": { transform: "translateX(200%)", width: "30%" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
