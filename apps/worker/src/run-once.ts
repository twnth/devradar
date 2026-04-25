import { CisaKevAdapter } from "./adapters/cisa-kev.adapter";
import { GitHubAdvisoriesAdapter } from "./adapters/github-advisories.adapter";
import { GitHubReleasesAdapter } from "./adapters/github-releases.adapter";
import { HackerNewsAdapter } from "./adapters/hacker-news.adapter";
import { NvdAdapter } from "./adapters/nvd.adapter";
import { OsvAdapter } from "./adapters/osv.adapter";
import { prisma } from "./lib/prisma";
import { persistFeedItems, persistSecurityIncidents } from "./lib/persistence";

const feedAdapters = [
  new HackerNewsAdapter(),
  new GitHubReleasesAdapter()
];

const securityAdapters = [
  new OsvAdapter(),
  new GitHubAdvisoriesAdapter(),
  new NvdAdapter(),
  new CisaKevAdapter()
];

async function main() {
  let feedCount = 0;
  let securityCount = 0;

  for (const adapter of feedAdapters) {
    try {
      const items = await adapter.fetch();
      const persisted = await persistFeedItems(items);
      feedCount += persisted.length;
      console.log(`feed:${adapter.key} fetched=${items.length} persisted=${persisted.length}`);
    } catch (error) {
      console.error(`feed:${adapter.key} failed`, error);
    }
  }

  for (const adapter of securityAdapters) {
    try {
      const incidents = await adapter.fetch();
      const persisted = await persistSecurityIncidents(incidents);
      securityCount += persisted.length;
      console.log(`security:${adapter.key} fetched=${incidents.length} persisted=${persisted.length}`);
    } catch (error) {
      console.error(`security:${adapter.key} failed`, error);
    }
  }

  console.log(`run-once complete feed=${feedCount} security=${securityCount}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
