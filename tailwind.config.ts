import type { Config } from "tailwindcss";

const color = (name: string) => `rgb(var(--color-${name}) / <alpha-value>)`;
const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    container: { center: true, padding: { DEFAULT: "1rem", sm: "1.5rem", lg: "2rem" }, screens: { "2xl": "1320px" } },
    extend: {
      colors: {
        background: color("background"), foreground: color("text-primary"),
        surface: color("surface"), elevated: color("surface-elevated"),
        subtle: color("text-muted"), border: color("border"), control: color("control"),
        input: color("control"), ring: color("primary"), track: color("track"), overlay: color("overlay"),
        "on-primary": color("on-primary"), brand: color("brand"), "brand-cyan": color("brand-cyan"),
        primary: { DEFAULT: color("primary"), foreground: color("on-primary"), hover: color("primary-hover"), soft: color("primary-soft") },
        secondary: { DEFAULT: color("muted"), foreground: color("text-primary") },
        destructive: { DEFAULT: color("danger"), foreground: color("on-danger"), soft: color("danger-soft") },
        success: { DEFAULT: color("success"), foreground: color("background"), soft: color("success-soft") },
        warning: { DEFAULT: color("warning"), foreground: color("background"), soft: color("warning-soft") },
        info: { DEFAULT: color("info"), soft: color("info-soft") },
        special: { DEFAULT: color("special"), soft: color("special-soft") },
        muted: { DEFAULT: color("muted"), foreground: color("text-secondary") },
        accent: { DEFAULT: color("accent"), foreground: color("text-primary") },
        popover: { DEFAULT: color("surface-elevated"), foreground: color("text-primary") },
        card: { DEFAULT: color("card"), foreground: color("text-primary") },
      },
      borderRadius: { sm: "var(--radius-sm)", md: "var(--radius-md)", lg: "var(--radius-lg)", xl: "var(--radius-xl)", "2xl": "var(--radius-xl)" },
      boxShadow: { soft: "var(--shadow-soft)", card: "var(--shadow-card)", float: "var(--shadow-float)" },
      backgroundImage: { hero: "var(--gradient-hero)", quote: "var(--gradient-quote)" },
      transitionDuration: { 160: "160ms", 220: "220ms" },
      keyframes: {
        "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
        "accordion-up": { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
        "pulse-glow": { "0%, 100%": { opacity: "1" }, "50%": { opacity: "0.7" } },
        "ring-progress": { from: { strokeDashoffset: "283" }, to: { strokeDashoffset: "var(--progress-offset)" } },
      },
      animation: {
        "accordion-down": "accordion-down .2s ease-out", "accordion-up": "accordion-up .2s ease-out",
        "pulse-glow": "pulse-glow 2s ease-out infinite", "ring-progress": "ring-progress .22s ease-out forwards",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
};
export default config;
