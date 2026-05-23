/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx,mdx}",
    "./components/**/*.{ts,tsx}",
    "./content/**/*.{md,mdx}",
  ],
  theme: {
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
        // Heirloom palette
        parchment: {
          DEFAULT: "#F4ECDC",
          deep: "#EFE6D0",
        },
        cream: "#FBF6EA",
        ink: {
          DEFAULT: "#1F1A14",
          soft: "#3A3128",
          muted: "#6E5F50",
        },
        rule: {
          DEFAULT: "#C9B89A",
          soft: "#E4D8BE",
        },
        sand: "#DCC8A0",
        lingon: {
          DEFAULT: "#8E2F2A",
          deep: "#6E1F1C",
          soft: "#C58A86",
        },
        sage: "#8A9474",
        forest: "#4D5B3B",
        oliveleaf: "#6F7A52",
        mushroom: "#8C8378",
      },
      fontFamily: {
        serif: ["var(--font-cormorant)", "Cormorant Garamond", "Georgia", "serif"],
        "serif-sc": ["var(--font-cormorant-sc)", "Cormorant SC", "Cormorant Garamond", "serif"],
        hand: ["var(--font-caveat)", "Snell Roundhand", "cursive"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: "100%",
            color: "var(--tw-prose-body)",
          },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography"), require("tailwindcss-animate")],
}
