import type { Config } from "tailwindcss";

export const devradarTailwindPreset: Partial<Config> = {
  darkMode: ["class"],
  theme: {
    extend: {
      colors: {
        background: "#090b12",
        foreground: "#f4f7fb",
        panel: "#111420",
        elevated: "#171b29",
        line: "#24293a",
        muted: "#9aa3b5",
        accent: "#6d8cff",
        critical: "#ef4444",
        high: "#f97316",
        medium: "#fbbf24",
        low: "#fde047",
        safe: "#22c55e"
      },
      borderRadius: {
        xl2: "1.25rem",
        xl3: "1.75rem"
      },
      boxShadow: {
        panel: "0 24px 60px rgba(4, 7, 17, 0.36)"
      }
    }
  }
};
