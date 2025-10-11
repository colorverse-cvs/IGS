// tailwind.config.js
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Brand Colors
        "brand-25": "var(--color-brand-25)",
        "brand-50": "var(--color-brand-50)",
        "brand-100": "var(--color-brand-100)",
        "brand-200": "var(--color-brand-200)",
        "brand-300": "var(--color-brand-300)",
        "brand-400": "var(--color-brand-400)",
        "brand-500": "var(--color-brand-500)", // Primary Brand Color
        "brand-600": "var(--color-brand-600)",
        "brand-700": "var(--color-brand-700)",
        "brand-800": "var(--color-brand-800)",
        "brand-900": "var(--color-brand-900)",
        // Gray Colors
        "gray-25": "var(--color-gray-25)",
        "gray-50": "var(--color-gray-50)",
        "gray-100": "var(--color-gray-100)",
        "gray-200": "var(--color-gray-200)",
        "gray-300": "var(--color-gray-300)",
        "gray-400": "var(--color-gray-400)",
        "gray-500": "var(--color-gray-500)",
        "gray-600": "var(--color-gray-600)",
        "gray-700": "var(--color-gray-700)",
        "gray-800": "var(--color-gray-800)",
        "gray-900": "var(--color-gray-900)",
        // Base Colors
        white: "var(--color-white)",
        black: "var(--color-black)",
      },
      borderRadius: {
        xs: "var(--border-xs)",
        sm: "var(--border-sm)",
        md: "var(--border-md)",
        lg: "var(--border-lg)", // Standard for cards
        xl: "var(--border-xl)",
        "2xl": "var(--border-2xl)",
        "3xl": "var(--border-3xl)",
        "4xl": "var(--border-4xl)",
        full: "var(--circle)", // Use 'full' for very large radius
      },
    },
  },
};
