import path from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const rootEnvPath = path.resolve(currentDir, "../../.env.local");

if (!process.env.NEXT_PUBLIC_API_BASE_URL && !process.env.API_BASE_URL) {
  try {
    process.loadEnvFile(rootEnvPath);
  } catch {
    // Vercel and other hosted environments provide env vars directly.
  }
}

const apiBaseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL ?? process.env.API_BASE_URL ?? "").replace(/\/$/, "");

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@devradar/ui", "@devradar/types", "@devradar/utils"],
  async rewrites() {
    if (!apiBaseUrl) {
      return [];
    }

    return [
      {
        source: "/api/v1/:path*",
        destination: `${apiBaseUrl}/api/v1/:path*`
      }
    ];
  }
};

export default nextConfig;
