import { feedBriefingSchema } from "@devradar/types";
import type { FeedBriefing } from "@devradar/types";
import type { FeedItem as PrismaFeedItem } from "@prisma/client";

const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";
const FEED_BRIEFING_MODEL = "gpt-4o-mini";

type OpenAIResponse = {
  output?: Array<{
    type?: string;
    content?: Array<{
      type?: string;
      text?: string;
      refusal?: string;
    }>;
  }>;
};

function extractOutputText(payload: OpenAIResponse) {
  const texts: string[] = [];

  for (const item of payload.output ?? []) {
    if (item.type !== "message") {
      continue;
    }

    for (const content of item.content ?? []) {
      if (content.type === "output_text" && typeof content.text === "string") {
        texts.push(content.text);
      }
    }
  }

  return texts.join("").trim();
}

function buildFeedInput(feed: PrismaFeedItem) {
  const rawPayload = feed.rawPayload as Record<string, unknown>;
  const body =
    typeof rawPayload.body === "string" && rawPayload.body.trim().length > 0
      ? rawPayload.body.trim().slice(0, 4000)
      : null;

  return {
    title: feed.title,
    sourceName: feed.sourceName,
    category: feed.category,
    tags: feed.tags,
    summaryKo: feed.summaryKo,
    whyItMattersKo: feed.whyItMattersKo,
    actionLabel: feed.actionLabel,
    url: feed.url,
    author: feed.author,
    publishedAt: feed.publishedAt.toISOString(),
    rawPreview: body,
    score: typeof rawPayload.score === "number" ? rawPayload.score : null,
    comments:
      typeof rawPayload.descendants === "number" ? rawPayload.descendants : null,
    releaseTag: typeof rawPayload.tag_name === "string" ? rawPayload.tag_name : null
  };
}

export function hasOpenAIKey() {
  return Boolean(process.env.OPENAI_API_KEY);
}

export function normalizeCachedFeedBriefing(value: unknown): FeedBriefing | null {
  const parsed = feedBriefingSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

export async function generateFeedBriefing(feed: PrismaFeedItem): Promise<FeedBriefing | null> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return null;
  }

  const response = await fetch(OPENAI_RESPONSES_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: FEED_BRIEFING_MODEL,
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text:
                "You are writing Korean summaries for developers reading software news and release updates. Use only the provided source data. Do not invent breaking changes, CVEs, migration steps, or facts that are not present in the source. Keep the tone direct and practical. Make the summary materially useful, not generic. The summary should explain what the item is about in 3 to 5 sentences when enough source data exists."
            }
          ]
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: JSON.stringify(buildFeedInput(feed))
            }
          ]
        }
      ],
      text: {
        format: {
          type: "json_schema",
          name: "feed_briefing",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              title: { type: "string" },
              summary: { type: "string" },
              keyPoints: {
                type: "array",
                items: { type: "string" },
                minItems: 3,
                maxItems: 5
              }
            },
            required: ["title", "summary", "keyPoints"]
          }
        }
      }
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI briefing request failed: ${response.status}`);
  }

  const payload = (await response.json()) as OpenAIResponse;
  const text = extractOutputText(payload);

  if (!text) {
    return null;
  }

  return feedBriefingSchema.parse(JSON.parse(text));
}
