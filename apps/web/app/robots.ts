import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: [
      {
        userAgent: "Google-InspectionTool",
        allow: "/",
        disallow: ["/watchlist", "/alerts", "/settings", "/login"]
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/watchlist", "/alerts", "/settings", "/login"]
      },
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/watchlist", "/alerts", "/settings", "/login"]
      }
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl
  };
}
