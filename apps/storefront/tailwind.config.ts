import type { Config } from "tailwindcss"
import plugin from "tailwindcss/plugin"

export default {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundColor: {
        primary: "rgb(var(--bg-primary) / <alpha-value>)",
        secondary: "rgb(var(--bg-secondary) / <alpha-value>)",
        tertiary: "rgb(var(--bg-tertiary) / <alpha-value>)",
        disabled: "rgba(var(--bg-disabled))",
        component: {
          DEFAULT: "rgba(var(--bg-component-primary))",
          hover: "rgba(var(--bg-component-primary-hover))",
          secondary: {
            DEFAULT: "rgba(var(--bg-component-secondary))",
            hover: "rgba(var(--bg-component-secondary-hover))",
          },
        },
        action: {
          DEFAULT: "rgba(var(--bg-action-primary))",
          hover: "rgba(var(--bg-action-primary-hover))",
          pressed: "rgba(var(--bg-action-primary-pressed))",
          secondary: {
            DEFAULT: "var(--bg-action-secondary)",
            hover: "var(--bg-action-secondary-hover)",
            pressed: "var(--bg-action-secondary-pressed)",
          },
          tertiary: {
            DEFAULT: "var(--bg-action-tertiary)",
            hover: "var(--bg-action-tertiary-hover)",
            pressed: "var(--bg-action-tertiary-pressed)",
          },
        },
        positive: {
          DEFAULT: "rgba(var(--bg-positive-primary))",
          hover: "rgba(var(--bg-positive-primary-hover))",
          pressed: "rgba(var(--bg-positive-primary-pressed))",
          secondary: {
            DEFAULT: "rgba(var(--bg-positive-secondary))",
            hover: "rgba(var(--bg-positive-secondary-hover))",
            pressed: "rgba(var(--bg-positive-secondary-pressed))",
          },
        },
        negative: {
          DEFAULT: "rgba(var(--bg-negative-primary))",
          hover: "rgba(var(--bg-negative-primary-hover))",
          pressed: "rgba(var(--bg-negative-primary-pressed))",
          secondary: {
            DEFAULT: "rgba(var(--bg-negative-secondary))",
            hover: "rgba(var(--bg-negative-secondary-hover))",
            pressed: "rgba(var(--bg-negative-secondary-pressed))",
          },
        },
        warning: {
          DEFAULT: "rgba(var(--bg-warning-primary))",
          hover: "rgba(var(--bg-warning-primary-hover))",
          pressed: "rgba(var(--bg-warning-primary-pressed))",
          secondary: {
            DEFAULT: "rgba(var(--bg-warning-secondary))",
            hover: "rgba(var(--bg-warning-secondary-hover))",
            pressed: "rgba(var(--bg-warning-secondary-pressed))",
          },
        },
      },
      // Content tokens live in textColor only. Putting them in `colors`
      // also generated bg-* utilities, so bg-tertiary (navy) and
      // text-tertiary (intended white) could resolve to the same paint.
      textColor: {
        primary: "rgb(var(--content-primary) / <alpha-value>)",
        secondary: "rgb(var(--content-secondary) / <alpha-value>)",
        tertiary: "rgb(var(--content-tertiary) / <alpha-value>)",
        disabled: "rgb(var(--content-disabled) / <alpha-value>)",
        action: {
          DEFAULT: "rgb(var(--content-action-primary) / <alpha-value>)",
          hover: "rgb(var(--content-action-primary-hover) / <alpha-value>)",
          pressed: "rgb(var(--content-action-primary-pressed) / <alpha-value>)",
          on: {
            primary: "#ffffff",
            secondary: "rgb(var(--content-action-on-secondary) / <alpha-value>)",
            tertiary: "rgb(var(--content-action-on-tertiary) / <alpha-value>)",
          },
        },
        positive: {
          DEFAULT: "rgb(var(--content-positive-primary) / <alpha-value>)",
          on: {
            primary: "rgb(var(--content-positive-on-primary) / <alpha-value>)",
            secondary: "rgb(var(--content-positive-on-secondary) / <alpha-value>)",
          },
        },
        negative: {
          DEFAULT: "rgb(var(--content-negative-primary) / <alpha-value>)",
          on: {
            primary: "rgb(var(--content-negative-on-primary) / <alpha-value>)",
            secondary: "rgb(var(--content-negative-on-secondary) / <alpha-value>)",
          },
        },
        warning: {
          DEFAULT: "rgb(var(--content-warning-primary) / <alpha-value>)",
          on: {
            primary: "rgb(var(--content-warning-on-primary) / <alpha-value>)",
            secondary: "rgb(var(--content-warning-on-secondary) / <alpha-value>)",
          },
        },
      },
      borderColor: {
        DEFAULT: "rgba(var(--border-primary))",
        primary: "rgba(var(--border-primary))",
        secondary: "rgba(var(--border-secondary))",
        action: "rgba(var(--border-action))",
        negative: {
          DEFAULT: "rgba(var(--border-negative-primary))",
          secondary: "rgba(var(--border-negative-secondary))",
        },
        positive: {
          DEFAULT: "rgba(var(--border-positive-primary))",
          secondary: "rgba(var(--border-positive-secondary))",
        },
        warning: {
          DEFAULT: "rgba(var(--border-warning-primary))",
          secondary: "rgba(var(--border-warning-secondary))",
        },
        disabled: "rgba(var(--border-disabled))",
      },
      borderRadius: {
        xs: "4px",
        sm: "8px",
        md: "16px",
        full: "1000px",
      },
      fill: {
        primary: "#ffffff",
        secondary: "rgb(var(--content-action-on-secondary) / <alpha-value>)",
        tertiary: "rgb(var(--content-tertiary) / <alpha-value>)",
        disabled: "rgb(var(--content-disabled) / <alpha-value>)",
      },
    },
  },
  plugins: [
    plugin(function ({ addUtilities }) {
      addUtilities({
        '.scrollbar-hide': {
          /* Firefox */
          'scrollbar-width': 'none',
          /* Safari and Chrome */
          '&::-webkit-scrollbar': {
            display: 'none'
          }
        }
      })
    })
  ],
} satisfies Config
