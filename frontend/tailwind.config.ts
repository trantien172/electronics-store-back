import type { Config } from "tailwindcss";

// ============================================
// Legacy Tailwind config retained while the application uses Tailwind v4 CSS tokens.
// The canonical palette lives in src/app/globals.css.
// ============================================

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Primary (Amber) ──────────────────
        primary: {
          50:  "var(--color-primary-50)",
          100: "var(--color-primary-100)",
          200: "var(--color-primary-200)",
          DEFAULT: "var(--color-primary-200)",
          400: "var(--color-primary-400)",
          600: "var(--color-primary-600)",
          800: "var(--color-primary-800)",
          900: "var(--color-primary-900)",
        },
        // ── Neutral (Charcoal) ───────────────
        neutral: {
          50:  "var(--color-neutral-50)",
          100: "var(--color-neutral-100)",
          200: "var(--color-neutral-200)",
          400: "var(--color-neutral-400)",
          600: "var(--color-neutral-600)",
          800: "var(--color-neutral-800)",
          900: "var(--color-neutral-900)",
        },
        // ── Semantic ────────────────────────
        success: {
          DEFAULT: "var(--color-success)",
          bg:      "var(--color-success-bg)",
        },
        warning: {
          DEFAULT: "var(--color-warning)",
          bg:      "var(--color-warning-bg)",
        },
        danger: {
          DEFAULT: "var(--color-danger)",
          bg:      "var(--color-danger-bg)",
        },
        info: {
          DEFAULT: "var(--color-info)",
          bg:      "var(--color-info-bg)",
        },
        // ── Brand Surfaces ───────────────────
        surface: {
          dark:  "var(--color-surface-dark)",
          dark2: "var(--color-surface-dark2)",
          light: "var(--color-surface-light)",
          muted: "var(--color-surface-muted)",
        },
      },

      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },

      borderRadius: {
        sm:  "4px",
        md:  "8px",
        lg:  "12px",
        xl:  "16px",
        "2xl": "20px",
      },

      boxShadow: {
        card:  "0 1px 3px rgba(0,0,0,0.08)",
        focus: "0 0 0 3px rgba(239,159,39,0.25)", // amber focus ring
      },
    },
  },
  plugins: [],
};

export default config;
