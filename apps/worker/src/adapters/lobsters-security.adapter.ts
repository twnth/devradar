import type { NormalizedFeedStaging } from "@devradar/types";
import { normalizedFeedStagingSchema } from "@devradar/types";
import type { FeedSourceAdapter } from "../lib/adapter";

function decodeHtml(value: string) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'");
}

function extractTagValues(itemXml: string) {
  return Array.from(itemXml.matchAll(/<category>([\s\S]*?)<\/category>/g))
    .map((match) => decodeHtml(match[1]?.trim() ?? ""))
    .filter(Boolean);
}

export class LobstersSecurityAdapter implements FeedSourceAdapter {
  key = "lobsters-security";

  async fetch(): Promise<NormalizedFeedStaging[]> {
    const response = await fetch("https://lobste.rs/t/security.rss", {
      headers: {
        "user-agent": "DevRadarWorker/1.0"
      }
    });

    if (!response.ok) {
      return [];
    }

    const xml = await response.text();
    const items = Array.from(xml.matchAll(/<item>([\s\S]*?)<\/item>/g))
      .map((match) => match[1] ?? "")
      .slice(0, 20);

    return items.map((itemXml) => {
      const title = decodeHtml(itemXml.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.trim() ?? "");
      const url = decodeHtml(itemXml.match(/<link>([\s\S]*?)<\/link>/)?.[1]?.trim() ?? "");
      const guid = decodeHtml(itemXml.match(/<guid[^>]*>([\s\S]*?)<\/guid>/)?.[1]?.trim() ?? url);
      const author = decodeHtml(itemXml.match(/<dc:creator>([\s\S]*?)<\/dc:creator>/)?.[1]?.trim() ?? "");
      const publishedAt = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1]?.trim() ?? "";
      const categories = extractTagValues(itemXml);

      return normalizedFeedStagingSchema.parse({
        sourceKey: this.key,
        externalId: guid,
        title,
        url,
        author: author || undefined,
        publishedAt: publishedAt ? new Date(publishedAt).toISOString() : new Date().toISOString(),
        category: "security",
        tags: Array.from(new Set(["Lobsters", "Security", ...categories])),
        rawPayload: {
          title,
          url,
          guid,
          author,
          publishedAt,
          categories
        }
      });
    });
  }
}
