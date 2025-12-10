import type { Config } from "tailwindcss";


function generateColorRange(name: string, hue: number, saturation: number) {
  return {
    50: `hsl(${hue}, ${saturation}%, 95%)`,
    100: `hsl(${hue}, ${saturation}%, 90%)`,
    200: `hsl(${hue}, ${saturation}%, 80%)`,
    300: `hsl(${hue}, ${saturation}%, 70%)`,
    400: `hsl(${hue}, ${saturation}%, 60%)`,
    500: `hsl(${hue}, ${saturation}%, 50%)`,
    600: `hsl(${hue}, ${saturation}%, 40%)`,
    700: `hsl(${hue}, ${saturation}%, 30%)`,
    800: `hsl(${hue}, ${saturation}%, 20%)`,
    900: `hsl(${hue}, ${saturation}%, 10%)`,
    950: `hsl(${hue}, ${saturation}%, 5%)`,
    DEFAULT: `hsl(${hue}, ${saturation}%, 50%)`,
    foreground: `hsl(${hue}, ${saturation}%, 95%)`,
  };
}

const config: Config = {
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '5rem',
        sm: '2rem',
        lg: '4rem',
        xl: '5rem',
        '2xl': '6rem',
      },
    },
    extend: {
      typography: {
        DEFAULT: {
          css: {
            h1: {
              fontSize: "2rem",
              fontWeight: "600",
              "text-align": "center", // or as it is in css (but in quotes).
            },
                        h2: {
              fontSize: "1.5rem",
              fontWeight: "600",
              "text-align": "center", // or as it is in css (but in quotes).
            },
            a: {
              color: "#3790A3",
              textDecoration: "none",
              "&:hover": {
                  color: "#30768A",
              },
            },
            iframe: {
              width: "100%",
              height: "400px",
            },
            'blockquote p::before': { content: 'none' },
            'blockquote p::after': { content: 'none' },
          },
        },
      },
      fontWeight: {
        thin: '100',
        light: '200',
        normal: '300',
        medium: '400',
        semibold: '500',
        bold: '600',
        extrabold: '700',
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        // primary: generateColorRange("primary", 22, 72), // Adjust hue and saturation as needed
        // secondary: generateColorRange("secondary", 191, 50), // Adjust hue and saturation as needed
        primary: {
          DEFAULT: "#DB6726",
          foreground: "#FDF7EF",
          hover: "#71331D",
          50: "#FDF7EF",
          100: "#FBEDD9",
          200: "#F5D7B3",
          300: "#EFBC82",
          400: "#E79750",
          500: "#E17A2E",
          600: "#DB6726",
          700: "#AF4B1F",
          800: "#8C3D20",
          900: "#71331D",
          950: "#3D190D",
        },
        secondary: {
          DEFAULT: "#284450",
          foreground: "#F1FAFA",
          hover: "#30768A",
          50: "#F1FAFA",
          100: "#DAF0F3",
          200: "#BAE2E7",
          300: "#8ACBD6",
          400: "#53ACBD",
          500: "#3790A3",
          600: "#30768A",
          700: "#2D6071",
          800: "#2C515E",
          900: "#284450",
          950: "#162C36",
        },
        tertiary: generateColorRange("tertiary", 332, 72), // Adjust hue and saturation as needed
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
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
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
  plugins: [
		require("tailwindcss-animate"),
		require('@tailwindcss/typography'),
	],
};
export default config;
