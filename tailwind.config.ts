import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        'orbitron': ['Orbitron', 'monospace'],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
          50: "hsl(207, 90%, 96%)",
          100: "hsl(207, 85%, 90%)",
          200: "hsl(207, 83%, 80%)",
          300: "hsl(207, 81%, 65%)",
          400: "hsl(207, 76%, 50%)",
          500: "hsl(207, 69%, 32%)",
          600: "hsl(207, 69%, 28%)",
          700: "hsl(207, 69%, 24%)",
          800: "hsl(207, 69%, 20%)",
          900: "hsl(207, 69%, 16%)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
          50: "hsl(210, 40%, 98%)",
          100: "hsl(210, 40%, 96%)",
          200: "hsl(210, 40%, 93%)",
          300: "hsl(210, 40%, 85%)",
          400: "hsl(210, 40%, 70%)",
          500: "hsl(210, 40%, 55%)",
          600: "hsl(210, 40%, 40%)",
          700: "hsl(210, 40%, 30%)",
          800: "hsl(210, 40%, 20%)",
          900: "hsl(210, 40%, 10%)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        error: {
          50: "hsl(0, 93%, 95%)",
          100: "hsl(0, 93%, 90%)",
          200: "hsl(0, 93%, 80%)",
          300: "hsl(0, 93%, 70%)",
          400: "hsl(0, 93%, 60%)",
          500: "hsl(0, 84%, 50%)",
          600: "hsl(0, 84%, 45%)",
          700: "hsl(0, 84%, 40%)",
          800: "hsl(0, 84%, 35%)",
          900: "hsl(0, 84%, 30%)",
        },
        warning: {
          50: "hsl(43, 96%, 95%)",
          100: "hsl(43, 96%, 89%)",
          200: "hsl(43, 96%, 80%)",
          300: "hsl(43, 96%, 70%)",
          400: "hsl(43, 96%, 60%)",
          500: "hsl(43, 74%, 66%)",
          600: "hsl(43, 74%, 55%)",
          700: "hsl(43, 74%, 45%)",
          800: "hsl(43, 74%, 35%)",
          900: "hsl(43, 74%, 25%)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        chart: {
          "1": "var(--chart-1)",
          "2": "var(--chart-2)",
          "3": "var(--chart-3)",
          "4": "var(--chart-4)",
          "5": "var(--chart-5)",
        },
        sidebar: {
          DEFAULT: "var(--sidebar-background)",
          foreground: "var(--sidebar-foreground)",
          primary: "var(--sidebar-primary)",
          "primary-foreground": "var(--sidebar-primary-foreground)",
          accent: "var(--sidebar-accent)",
          "accent-foreground": "var(--sidebar-accent-foreground)",
          border: "var(--sidebar-border)",
          ring: "var(--sidebar-ring)",
        },
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
