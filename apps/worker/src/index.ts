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
      const adapter = feedAdapters[job.data.source as keyof typeof feedAdapters];
      if (!adapter) return [];
      const items = await adapter.fetch();
      await queues.feedNormalize.add("normalize-feed", items, {
        jobId: `${job.name}:${job.timestamp}`,
        attempts: 5,
        backoff: {
          type: "exponential",
          delay: 1_000
        }
      });
      return items.length;
    },
    { connection }
  );

  new Worker(
    "security-ingest",
    async (job) => {
      const adapter = securityAdapters[job.data.source as keyof typeof securityAdapters];
      if (!adapter) return [];
      const incidents = await adapter.fetch();
      await queues.securityNormalize.add("normalize-security", incidents, {
        jobId: `${job.name}:${job.timestamp}`,
        attempts: 5,
        backoff: {
          type: "exponential",
          delay: 1_000
        }
      });
      return incidents.length;
    },
    { connection }
  );

  if (process.env.CRON_ENABLED !== "false") {
    await registerRecurringJobs({
      feedIngest: queues.feedIngest as Queue,
      securityIngest: queues.securityIngest as Queue
    });
  }

  console.log("DevRadar worker started");
}

bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});
