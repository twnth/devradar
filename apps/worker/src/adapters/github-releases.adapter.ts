import type { NormalizedFeedStaging } from "@devradar/types";
import { normalizedFeedStagingSchema } from "@devradar/types";
import type { FeedSourceAdapter } from "../lib/adapter";

const watchedRepos = [
  { owner: "vercel", repo: "next.js", category: "web" as const, tags: ["Next.js", "Release"] },
  { owner: "vitejs", repo: "vite", category: "web" as const, tags: ["Vite", "Release"] },
  { owner: "facebook", repo: "react", category: "web" as const, tags: ["React", "Release"] }
];

export class GitHubReleasesAdapter implements FeedSourceAdapter {
  key = "github-releases";

  async fetch(): Promise<NormalizedFeedStaging[]> {
    const releases = await Promise.all(
      watchedRepos.map(async (repo) => {
        const response = await fetch(`https://api.github.com/repos/${repo.owner}/${repo.repo}/releases?per_page=2`, {
          headers: {
            "user-agent": "DevRadarWorker/1.0"
          }
        });
        const data = (await response.json()) as Array<Record<string, unknown>>;

        return data.map((release) =>
          normalizedFeedStagingSchema.parse({
            sourceKey: `${this.key}:${repo.repo}`,
            externalId: String(release.id),
            title: String(release.name ?? release.tag_name),
            url: String(release.html_url),
            author: String((release.author as { login?: string } | undefined)?.login ?? "github"),
            publishedAt: String(release.published_at),
            category: repo.category,
            tags: repo.tags,
            rawPayload: release
          })
        );
      })
    );

    return releases.flat();
  }
}
