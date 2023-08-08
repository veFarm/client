/** @type {import('tailwindcss').Config} */
/**
 * @see {@link https://tailwindcss.com/docs/customizing-colors#naming-your-colors}
 * Observation. We use css variables instead instead of hard coding the
 * values so that we can have multiple themes.
 */
module.exports = {
  content: ["./src/**/*.{html,js,svelte,ts}"],
  theme: {
    extend: {
      colors: {
        primary: "rgb(var(--color-primary) / <alpha-value>)",
        "primary-100": "rgb(var(--color-primary-100) / <alpha-value>)",
        secondary: "rgb(var(--color-secondary) / <alpha-value>)",
        "secondary-100": "rgb(var(--color-secondary-100) / <alpha-value>)",
        body: "rgb(var(--color-body) / <alpha-value>)",
        background: "rgb(var(--color-background) / <alpha-value>)",
        highlight: "rgb(var(--color-highlight) / <alpha-value>)",
        muted: "rgb(var(--color-muted) / <alpha-value>)",
        accent: "rgb(var(--color-accent) / <alpha-value>)",
        danger: "rgb(var(--color-danger) / <alpha-value>)",
        "danger-100": "rgb(var(--color-danger-100) / <alpha-value>)",
        disabled: "rgb(var(--color-disabled) / <alpha-value>)",
        backdrop: "rgb(var(--color-backdrop) / 0.5)",
      },
    },
  },
  plugins: [],
  darkMode: "class",
};
