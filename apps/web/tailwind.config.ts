import type { Config } from "tailwindcss";
import { devradarTailwindPreset } from "@devradar/config/tailwind-preset";

const config: Config = {
  presets: [devradarTailwindPreset],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}"
  ]
};

export default config;
