/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@devradar/ui", "@devradar/types", "@devradar/utils"],
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: "http://3.38.45.86:4000/api/v1/:path*"
      }
    ];
  }
};

export default nextConfig;
