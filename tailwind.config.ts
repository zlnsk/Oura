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
          50: "#f0f7ff",
          100: "#e0effe",
          200: "#bae0fd",
          300: "#7cc8fc",
          400: "#36adf8",
          500: "#0c93e9",
          600: "#0074c7",
          700: "#015da1",
          800: "#064f85",
          900: "#0b426e",
          950: "#072a49",
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
        "glass": "0 4px 16px 0 rgba(0, 0, 0, 0.04)",
        "glass-dark": "0 4px 16px 0 rgba(0, 0, 0, 0.12)",
        "card": "0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)",
        "card-dark": "0 1px 3px rgba(0, 0, 0, 0.2), 0 1px 2px rgba(0, 0, 0, 0.1)",
        "card-hover": "0 4px 12px -2px rgba(0, 0, 0, 0.06), 0 2px 4px rgba(0, 0, 0, 0.03)",
        "soft": "0 2px 8px rgba(0, 0, 0, 0.04)",
        "soft-dark": "0 2px 8px rgba(0, 0, 0, 0.16)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "mesh-gradient": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        "mesh-dark": "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "20px",
        "4xl": "24px",
      },
      transitionTimingFunction: {
        "m3": "cubic-bezier(0.2, 0, 0, 1)",
        "m3-decel": "cubic-bezier(0, 0, 0, 1)",
        "m3-accel": "cubic-bezier(0.3, 0, 1, 1)",
      },
      animation: {
        "fade-in": "fadeIn 0.4s cubic-bezier(0.2, 0, 0, 1)",
        "slide-up": "slideUp 0.4s cubic-bezier(0.2, 0, 0, 1)",
        "slide-in-right": "slideInRight 0.3s cubic-bezier(0.2, 0, 0, 1)",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 6s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
        "loading-bar": "loadingBar 1.5s cubic-bezier(0.2, 0, 0, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(10px)" },
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
