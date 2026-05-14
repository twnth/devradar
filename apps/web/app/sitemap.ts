import type { MetadataRoute } from "next";
import { absoluteUrl, getSiteUrl } from "@/lib/seo";

async function fetchPublicUrls(path: string) {
  const apiBaseUrl =
    process.env.API_BASE_URL ??
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    process.env.APP_BASE_URL;

  if (!apiBaseUrl) {
    return [];
  }

  try {
    const response = await fetch(`${apiBaseUrl}${path}`, {
      next: { revalidate: 3600 }
    });

    if (!response.ok) {
      return [];
    }

    const payload = (await response.json()) as
      | Array<{ id: string; publishedAt?: string; modifiedAt?: string }>
      | { data?: Array<{ id: string; publishedAt?: string; modifiedAt?: string }> };

    return Array.isArray(payload) ? payload : Array.isArray(payload.data) ? payload.data : [];
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/feed"),
      changeFrequency: "hourly",
      priority: 0.9
    },
    {
      url: absoluteUrl("/security"),
      changeFrequency: "hourly",
      priority: 0.9
    }
  ];

  const [feedItems, securityItems] = await Promise.all([
    fetchPublicUrls("/api/v1/feed?limit=50"),
    fetchPublicUrls("/api/v1/security/incidents?limit=50")
  ]);

  const feedRoutes: MetadataRoute.Sitemap = feedItems.map((item) => ({
    url: new URL(`/feed/${item.id}`, siteUrl).toString(),
    lastModified: item.publishedAt ? new Date(item.publishedAt) : undefined,
    changeFrequency: "daily",
    priority: 0.7
  }));

  const securityRoutes: MetadataRoute.Sitemap = securityItems.map((item) => ({
    url: new URL(`/security/${item.id}`, siteUrl).toString(),
    lastModified: item.modifiedAt ? new Date(item.modifiedAt) : undefined,
    changeFrequency: "daily",
    priority: 0.8
  }));

  return [...staticRoutes, ...feedRoutes, ...securityRoutes];
}
