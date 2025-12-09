/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Custom colors for LifeSphere
        lifesphere: {
          blue: "#667eea",
          purple: "#764ba2",
          teal: "#4fd1c5",
          green: "#48bb78",
          yellow: "#ed8936",
          red: "#f56565",
          indigo: "#5a67d8",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["Poppins", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.75rem" }],
        "3xs": ["0.5rem", { lineHeight: "0.625rem" }],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: 1 },
          "50%": { opacity: 0.5 },
        },
        "slide-up": {
          "0%": { transform: "translateY(100%)", opacity: 0 },
          "100%": { transform: "translateY(0)", opacity: 1 },
        },
        "slide-down": {
          "0%": { transform: "translateY(-100%)", opacity: 0 },
          "100%": { transform: "translateY(0)", opacity: 1 },
        },
        "fade-in": {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
        "scale-in": {
          "0%": { transform: "scale(0)", opacity: 0 },
          "100%": { transform: "scale(1)", opacity: 1 },
        },
        "shimmer": {
          "100%": { transform: "translateX(100%)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "wave": {
          "0%": { transform: "translateX(0) translateY(0) rotate(0deg)" },
          "50%": { transform: "translateX(-10%) translateY(-20%) rotate(10deg)" },
          "100%": { transform: "translateX(0) translateY(0) rotate(0deg)" },
        },
        "notification-progress": {
          "0%": { width: "100%" },
          "100%": { width: "0%" },
        },
        "progress-bar": {
          "0%": { width: "0%" },
          "100%": { width: "var(--progress-width)" },
        },
        "spin-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "bounce-slow": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "ping-slow": {
          "75%, 100%": { transform: "scale(2)", opacity: 0 },
        },
        "gradient-shift": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-glow": "pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "slide-up": "slide-up 0.3s ease-out",
        "slide-down": "slide-down 0.3s ease-out",
        "fade-in": "fade-in 0.5s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
        "shimmer": "shimmer 2s infinite",
        "float": "float 3s ease-in-out infinite",
        "wave": "wave 3s ease-in-out infinite",
        "notification-progress": "notification-progress 5s linear forwards",
        "progress-bar": "progress-bar 1s ease-out forwards",
        "spin-slow": "spin-slow 3s linear infinite",
        "bounce-slow": "bounce-slow 2s ease-in-out infinite",
        "ping-slow": "ping-slow 3s cubic-bezier(0, 0, 0.2, 1) infinite",
        "gradient-shift": "gradient-shift 3s ease infinite",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "gradient-primary": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        "gradient-success": "linear-gradient(135deg, #48bb78 0%, #38a169 100%)",
        "gradient-warning": "linear-gradient(135deg, #ed8936 0%, #dd6b20 100%)",
        "gradient-danger": "linear-gradient(135deg, #f56565 0%, #e53e3e 100%)",
        "gradient-info": "linear-gradient(135deg, #4299e1 0%, #3182ce 100%)",
        "gradient-dark": "linear-gradient(135deg, #2d3748 0%, #1a202c 100%)",
        "gradient-light": "linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)",
        "gradient-water": "linear-gradient(to top, #0ea5e9, #38bdf8)",
        "gradient-sunset": "linear-gradient(135deg, #f6ad55 0%, #fc8181 100%)",
        "gradient-ocean": "linear-gradient(135deg, #4fd1c5 0%, #319795 100%)",
        "grid-pattern": "linear-gradient(to right, #80808012 1px, transparent 1px), linear-gradient(to bottom, #80808012 1px, transparent 1px)",
        "checker-pattern": "linear-gradient(45deg, #80808012 25%, transparent 25%), linear-gradient(-45deg, #80808012 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #80808012 75%), linear-gradient(-45deg, transparent 75%, #80808012 75%)",
        "dot-pattern": "radial-gradient(circle, #80808012 1px, transparent 1px)",
      },
      boxShadow: {
        "glass": "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
        "glass-dark": "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
        "neumorphic": "20px 20px 60px #d9d9d9, -20px -20px 60px #ffffff",
        "neumorphic-dark": "20px 20px 60px #1a1a1a, -20px -20px 60px #2a2a2a",
        "soft": "0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)",
        "hard": "0 10px 40px -10px rgba(0, 0, 0, 0.25)",
        "inner-soft": "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)",
        "inner-hard": "inset 0 4px 8px 0 rgba(0, 0, 0, 0.12)",
        "float": "0 20px 60px rgba(0, 0, 0, 0.1), 0 10px 30px rgba(0, 0, 0, 0.05)",
        "float-dark": "0 20px 60px rgba(0, 0, 0, 0.3), 0 10px 30px rgba(0, 0, 0, 0.2)",
      },
      spacing: {
        "18": "4.5rem",
        "88": "22rem",
        "128": "32rem",
        "144": "36rem",
        "160": "40rem",
      },
      height: {
        "screen-90": "90vh",
        "screen-80": "80vh",
        "screen-70": "70vh",
      },
      width: {
        "screen-90": "90vw",
        "screen-80": "80vw",
      },
      maxWidth: {
        "8xl": "88rem",
        "9xl": "96rem",
      },
      minHeight: {
        "screen-90": "90vh",
        "screen-80": "80vh",
      },
      backdropBlur: {
        xs: "2px",
        "3xl": "64px",
      },
      scale: {
        "102": "1.02",
      },
      transitionProperty: {
        "height": "height",
        "spacing": "margin, padding",
        "width": "width",
        "size": "width, height",
      },
      transitionDuration: {
        "400": "400ms",
        "600": "600ms",
        "800": "800ms",
      },
      transitionTimingFunction: {
        "bounce-in": "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
        "smooth-step": "cubic-bezier(0.4, 0, 0.2, 1)",
      },
      zIndex: {
        "60": "60",
        "70": "70",
        "80": "80",
        "90": "90",
        "100": "100",
      },
      gridTemplateColumns: {
        "16": "repeat(16, minmax(0, 1fr))",
        "24": "repeat(24, minmax(0, 1fr))",
      },
      gridColumn: {
        "span-13": "span 13 / span 13",
        "span-14": "span 14 / span 14",
        "span-15": "span 15 / span 15",
        "span-16": "span 16 / span 16",
      },
      screens: {
        "3xl": "1920px",
        "4xl": "2560px",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
    require("@tailwindcss/aspect-ratio"),
  ],
}
