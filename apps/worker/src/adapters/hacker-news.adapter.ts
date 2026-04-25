import type { NormalizedFeedStaging } from "@devradar/types";
import { normalizedFeedStagingSchema } from "@devradar/types";
import type { FeedSourceAdapter } from "../lib/adapter";

export class HackerNewsAdapter implements FeedSourceAdapter {
  key = "hacker-news";

  async fetch(): Promise<NormalizedFeedStaging[]> {
    const topStories = await fetch("https://hacker-news.firebaseio.com/v0/topstories.json").then((response) => response.json() as Promise<number[]>);
    const itemIds = topStories.slice(0, 10);
    const stories = await Promise.all(
      itemIds.map(async (id) => fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then((response) => response.json()))
    );

    return stories
      .filter((story) => story?.url && story?.title)
      .map((story) =>
        normalizedFeedStagingSchema.parse({
          sourceKey: this.key,
          externalId: String(story.id),
          title: story.title,
          url: story.url,
          author: story.by,
          publishedAt: new Date((story.time ?? 0) * 1000).toISOString(),
          category: "web",
          tags: ["Hacker News", "Community"],
          rawPayload: story
        })
      );
  }
}
