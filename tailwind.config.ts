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
      },
      boxShadow: {
        "glass": "0 8px 32px 0 rgba(31, 38, 135, 0.15)",
        "glass-dark": "0 8px 32px 0 rgba(0, 0, 0, 0.35)",
        "card": "0 4px 24px -2px rgba(0, 0, 0, 0.08), 0 2px 8px -2px rgba(0, 0, 0, 0.04)",
        "card-dark": "0 4px 24px -2px rgba(0, 0, 0, 0.4), 0 2px 8px -2px rgba(0, 0, 0, 0.2)",
        "card-hover": "0 12px 40px -4px rgba(0, 0, 0, 0.12), 0 4px 12px -2px rgba(0, 0, 0, 0.06)",
        "glow": "0 0 20px rgba(12, 147, 233, 0.3)",
        "glow-violet": "0 0 20px rgba(139, 92, 246, 0.3)",
        "glow-emerald": "0 0 20px rgba(16, 185, 129, 0.3)",
        "3d": "0 20px 60px -10px rgba(0, 0, 0, 0.15), 0 10px 20px -10px rgba(0, 0, 0, 0.1)",
        "3d-dark": "0 20px 60px -10px rgba(0, 0, 0, 0.5), 0 10px 20px -10px rgba(0, 0, 0, 0.3)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "mesh-gradient": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        "mesh-dark": "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
        "slide-in-right": "slideInRight 0.3s ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 6s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
        "loading-bar": "loadingBar 1.5s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
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
