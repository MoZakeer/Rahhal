import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class", 
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      sm: "768px", // tablet
      xl: "1440px", // desktop
    },
    extend: {
      // ربطنا ألوان Tailwind بالـ CSS Variables الخاصة بينا
      colors: {
        background: {
          DEFAULT: "var(--bg-primary)",     // كلاس: bg-background
          secondary: "var(--bg-secondary)", // كلاس: bg-background-secondary
        },
        primary: {
          DEFAULT: "var(--text-primary)",   // كلاس: text-primary
          secondary: "var(--text-secondary)",// كلاس: text-primary-secondary
        },
        brand: {
          DEFAULT: "var(--brand-primary)",  // كلاس: bg-brand أو text-brand
          hover: "var(--brand-hover)",      // كلاس: hover:bg-brand-hover
        },
        border: {
          DEFAULT: "var(--border-color)",   // كلاس: border-border
        },
        message: {
          sender: "var(--message-bg-sender)",   // كلاس: bg-message-sender
          receiver: "var(--message-bg-receiver)",// كلاس: bg-message-receiver
        }
      }
    },
  },
  plugins: [],
};

export default config;