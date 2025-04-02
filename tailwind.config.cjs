const plugin = require("tailwindcss/plugin");

/** @type {import('tailwindcss').Config} */
module.exports = {
    // important: true,
    darkMode: ["class"],
    content: [
        "./pages/**/*.{ts,tsx}",
        "./components/**/*.{ts,tsx}",
        "./app/**/*.{ts,tsx}",
        "./src/**/*.{ts,tsx}",
    ],
    theme: {
        container: {
            center: true,
            padding: "2rem",
            screens: {},
        },

        colors: {
            "brand-purple": {
                DEFAULT: "hsl(var(--brand-purple) / <alpha-value>)",
                foreground:
                    "hsl(var(--brand-purple-foreground) / <alpha-value>)",
            },

            "brand-red": {
                DEFAULT: "hsl(var(--brand-red) / <alpha-value>)",
                foreground: "hsl(var(--brand-red-foreground) / <alpha-value>)",
            },

            "brand-orange": {
                DEFAULT: "hsl(var(--brand-orange) / <alpha-value>)",
                foreground:
                    "hsl(var(--brand-orange-foreground) / <alpha-value>)",
            },

            "border": "hsl(var(--border) / <alpha-value>)",
            "input": "hsl(var(--input) / <alpha-value>)",
            "ring": "hsl(var(--ring) / <alpha-value>)",
            "background": "hsl(var(--background) / <alpha-value>)",
            "foreground": "hsl(var(--foreground) / <alpha-value>)",
            "primary": {
                DEFAULT: "hsl(var(--primary) / <alpha-value>)",
                foreground: "hsl(var(--primary-foreground) / <alpha-value>)",
            },
            "secondary": {
                DEFAULT: "hsl(var(--secondary) / <alpha-value>)",
                foreground: "hsl(var(--secondary-foreground) / <alpha-value>)",
            },
            "destructive": {
                DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
                foreground:
                    "hsl(var(--destructive-foreground) / <alpha-value>)",
            },
            "muted": {
                DEFAULT: "hsl(var(--muted) / <alpha-value>)",
                foreground: "hsl(var(--muted-foreground) / <alpha-value>)",
            },
            "accent": {
                DEFAULT: "hsl(var(--accent) / <alpha-value>)",
                foreground: "hsl(var(--accent-foreground) / <alpha-value>)",
            },
            "popover": {
                DEFAULT: "hsl(var(--popover) / <alpha-value>)",
                foreground: "hsl(var(--popover-foreground) / <alpha-value>)",
            },
            "card": {
                DEFAULT: "hsl(var(--card) / <alpha-value>)",
                foreground: "hsl(var(--card-foreground) / <alpha-value>)",
            },
            "success": {
                DEFAULT: "hsl(var(--success) / <alpha-value>)",
                foreground: "hsl(var(--success-foreground) / <alpha-value>)",
            },

            "white": "rgb(255 255 255 / <alpha-value>)",
            "black": "rgb(0 0 0 / <alpha-value>)",
            "transparent": "transparent",
        },

        extend: {
            fontFamily: {
                sans: ["Inter", "sans-serif"],
                mono: ["Roboto Mono", "monospace"],
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
            },
            backgroundImage: {
                barberpole:
                    "repeating-linear-gradient(-45deg, transparent, transparent 1rem, #fafafa 1rem, #fafafa 2rem)",
            },
            backgroundSize: {
                barberpole: "200% 200%",
            },
            keyframes: {
                "accordion-down": {
                    from: { height: 0 },
                    to: { height: "var(--radix-accordion-content-height)" },
                },
                "accordion-up": {
                    from: { height: "var(--radix-accordion-content-height)" },
                    to: { height: 0 },
                },

                "collapsible-down": {
                    from: { height: 0 },
                    to: { height: "var(--radix-collapsible-content-height)" },
                },
                "collapsible-up": {
                    from: { height: "var(--radix-collapsible-content-height)" },
                    to: { height: 0 },
                },

                "barberpole": {
                    to: { backgroundPosition: "100% 100%" },
                },
                "fill-right": {
                    from: { width: 0 },
                    to: { width: "var(--animation-width)" },
                },
            },
            animation: {
                "collapsible-down": "collapsible-down 0.2s ease-out",
                "collapsible-up": "collapsible-up 0.2s ease-out",
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
                "barberpole": "barberpole 30s linear infinite",
                "fill-right": "fill-right var(--animation-duration) linear",
            },
        },
    },
    plugins: [
        require("tailwindcss-animate"),

        plugin(({ addVariant }) => {
            addVariant("children", "& > *");

            addVariant("selected", [
                "&[data-state=checked]",
                "&[data-selected=true]",
                "&[data-state=active]",
                "&[data-state=on]",
            ]);

            addVariant("open", "&[data-state=open]");
            addVariant("hover", [
                "&:not(:disabled):not([disabled]):not([data-disabled]):hover",
            ]);
            addVariant("disabled", [
                "&:disabled",
                "&[disabled]",
                "&[data-disabled]",
            ]);
            addVariant("enabled", [
                "&:not(:disabled):not([disabled]):not([data-disabled])",
            ]);
        }),
    ],
};
