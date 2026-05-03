import net from "node:net";
import { Queue, Worker } from "bullmq";
import { CisaKevAdapter } from "./adapters/cisa-kev.adapter";
import { GitHubAdvisoriesAdapter } from "./adapters/github-advisories.adapter";
import { GitHubReleasesAdapter } from "./adapters/github-releases.adapter";
import { HackerNewsAdapter } from "./adapters/hacker-news.adapter";
import { NvdAdapter } from "./adapters/nvd.adapter";
import { OsvAdapter } from "./adapters/osv.adapter";
import { createQueues, createWorkers } from "./jobs/pipeline";
import { registerRecurringJobs } from "./jobs/scheduler";
import { persistFeedItems, persistSecurityIncidents } from "./lib/persistence";

const redisUrl = process.env.REDIS_URL ?? "redis://localhost:6379";
const connection = { url: redisUrl };

const feedAdapters = {
  "hacker-news": new HackerNewsAdapter(),
  "github-releases": new GitHubReleasesAdapter()
};

const securityAdapters = {
  osv: new OsvAdapter(),
  "github-advisories": new GitHubAdvisoriesAdapter(),
  nvd: new NvdAdapter(),
  "cisa-kev": new CisaKevAdapter()
};

async function ensureRedisAvailable(redisConnectionUrl: string) {
  const parsed = new URL(redisConnectionUrl);
  const host = parsed.hostname || "127.0.0.1";
  const port = Number(parsed.port || 6379);

  await new Promise<void>((resolve, reject) => {
    const socket = net.createConnection({ host, port });

    socket.once("connect", () => {
      socket.end();
      resolve();
    });

    socket.once("error", (error) => {
      socket.destroy();
      reject(error);
    });

    socket.setTimeout(1_500, () => {
      socket.destroy();
      reject(new Error(`Redis connection timeout: ${host}:${port}`));
    });
  });
}

async function bootstrap() {
  try {
    await ensureRedisAvailable(redisUrl);
  } catch {
    console.error("");
    console.error("DevRadar worker could not connect to Redis.");
    console.error(`REDIS_URL: ${redisUrl}`);
    console.error("");
    console.error("Start Redis first, then run the worker again.");
    console.error("Examples:");
    console.error("  brew services start redis");
    console.error("  docker run --name devradar-redis -p 6379:6379 redis:7");
    process.exit(1);
  }

  const queues = createQueues({ connection });
  createWorkers({ connection });

  new Worker(
    "feed-ingest",
    async (job) => {
      console.log(`[worker][feed-ingest] start name=${job.name} source=${job.data.source} id=${job.id ?? "unknown"}`);
      const adapter = feedAdapters[job.data.source as keyof typeof feedAdapters];
      if (!adapter) return [];
      const items = await adapter.fetch();
      console.log(`[worker][feed-ingest] fetched source=${job.data.source} count=${items.length}`);
      const persisted = await persistFeedItems(items);
      console.log(`[worker][feed-ingest] persisted source=${job.data.source} count=${persisted.length}`);
      return persisted.length;
    },
    { connection }
  );

  new Worker(
    "security-ingest",
    async (job) => {
      console.log(`[worker][security-ingest] start name=${job.name} source=${job.data.source} id=${job.id ?? "unknown"}`);
      const adapter = securityAdapters[job.data.source as keyof typeof securityAdapters];
      if (!adapter) return [];
      const incidents = await adapter.fetch();
      console.log(`[worker][security-ingest] fetched source=${job.data.source} count=${incidents.length}`);
      const persisted = await persistSecurityIncidents(incidents);
      console.log(`[worker][security-ingest] persisted source=${job.data.source} count=${persisted.length}`);

      await Promise.all(
        persisted.map((incident) =>
          queues.securityMatch.add(
            "match-watchlists",
            { incidentId: incident.id },
            { jobId: `incident-match:${incident.id}` }
          )
        )
      );

      console.log(`[worker][security-ingest] queued-match source=${job.data.source} count=${persisted.length}`);
      return persisted.length;
    },
    { connection }
  );

  console.log(`CRON_ENABLED=${process.env.CRON_ENABLED ?? "undefined"}`);

  if (process.env.CRON_ENABLED !== "false") {
    await registerRecurringJobs({
      feedIngest: queues.feedIngest as Queue,
      securityIngest: queues.securityIngest as Queue
    });
  } else {
    console.log("Recurring worker jobs are disabled by CRON_ENABLED=false");
  }

  console.log("DevRadar worker started");
}

bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});
