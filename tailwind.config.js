// tailwind.config.js
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          // Brand Colors
        25: "#fcf7fd",
        50: "#f6ebf9",
        100: "#ecd6f0",
        200: "#e0bee8",
        300: "#d2a3e0",
        400: "#c285d7",
        500: "#b368ce", // Primary Brand Color
        600: "#a34fc6",
        700: "#9339bd",
        800: "#8526b5",
        900: "#730fa8",
        },
        // Brand Colors
        // "brand-25": "#fcf7fd",
        // "brand-50": "#f6ebf9",
        // "brand-100": "#ecd6f0",
        // "brand-200": "#e0bee8",
        // "brand-300": "#d2a3e0",
        // "brand-400": "#c285d7",
        // "brand-500": "#b368ce", // Primary Brand Color
        // "brand-600": "#a34fc6",
        // "brand-700": "#9339bd",
        // "brand-800": "#8526b5",
        // "brand-900": "#730fa8",
        // Gray Colors
        gray: {
        25: "#fafafa",
        50: "#f2f2f2",
        100: "#e5e5e5",
        200: "#d1d1d1",
        300: "#b3b3b3",
        400: "#8c8c8c",
        500: "#6b6b6b",
        600: "#4d4d4d",
        700: "#2e2e2e",
        800: "#1f1f1f",
        900: "#111111",
        }
        // "gray-25": "var(--color-gray-25)",
        // "gray-50": "var(--color-gray-50)",
        // "gray-100": "var(--color-gray-100)",
        // "gray-200": "var(--color-gray-200)",
        // "gray-300": "var(--color-gray-300)",
        // "gray-400": "var(--color-gray-400)",
        // "gray-500": "var(--color-gray-500)",
        // "gray-600": "var(--color-gray-600)",
        // "gray-700": "var(--color-gray-700)",
        // "gray-800": "var(--color-gray-800)",
        // "gray-900": "var(--color-gray-900)",
        // // Base Colors
        // white: "var(--color-white)",
        // black: "var(--color-black)",
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
