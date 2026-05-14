import type { NormalizedFeedStaging } from "@devradar/types";
import { normalizedFeedStagingSchema } from "@devradar/types";
import type { FeedSourceAdapter } from "../lib/adapter";

const monthLinePattern =
  /^(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}$/;

function stripHtml(value: string) {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, "\n")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/\u00a0/g, " ");
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function isNoiseLine(value: string) {
  return [
    "CI/CD Incidents",
    "Top CI/CD Security Incidents",
    "Attack Technique",
    "Description",
    "Impact"
  ].includes(value);
}

export class StepSecurityIncidentsAdapter implements FeedSourceAdapter {
  key = "step-security-incidents";

  async fetch(): Promise<NormalizedFeedStaging[]> {
    const response = await fetch("https://www.stepsecurity.io/incidents", {
      headers: {
        "user-agent": "DevRadarWorker/1.0"
      }
    });

    if (!response.ok) {
      return [];
    }

    const html = await response.text();
    const lines = stripHtml(html)
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const parsedItems: Array<{
      title: string;
      publishedAt: string;
      summary: string;
    }> = [];

    for (let index = 1; index < lines.length; index += 1) {
      const line = lines[index];
      if (!monthLinePattern.test(line)) {
        continue;
      }

      const title = lines[index - 1]?.trim() ?? "";
      if (!title || isNoiseLine(title) || title.length < 12) {
        continue;
      }

      let summary = "";
      for (let cursor = index + 1; cursor < lines.length; cursor += 1) {
        const candidate = lines[cursor];
        if (!candidate || isNoiseLine(candidate) || monthLinePattern.test(candidate)) {
          continue;
        }
        if (candidate.length < 24) {
          continue;
        }
        summary = candidate;
        break;
      }

      const publishedAt = new Date(`${line} 01 00:00:00 UTC`).toISOString();
      const dedupeKey = `${title}::${line}`;

      if (!parsedItems.some((item) => `${item.title}::${item.publishedAt}` === `${title}::${publishedAt}`)) {
        parsedItems.push({
          title,
          publishedAt,
          summary: summary || "공급망 보안 사고와 CI/CD 침해 사례를 다룹니다."
        });
      }
    }

    return parsedItems.slice(0, 20).map((item) =>
      normalizedFeedStagingSchema.parse({
        sourceKey: this.key,
        externalId: slugify(`${item.title}-${item.publishedAt}`),
        title: item.title,
        url: "https://www.stepsecurity.io/incidents",
        publishedAt: item.publishedAt,
        category: "security",
        tags: ["StepSecurity", "Supply Chain", "Security"],
        rawPayload: item
      })
    );
  }
}
