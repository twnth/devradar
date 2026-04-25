import type { Queue } from "bullmq";

export async function registerRecurringJobs(queues: {
  feedIngest: Queue;
  securityIngest: Queue;
}) {
  await queues.feedIngest.upsertJobScheduler("ingest-hn", {
    every: 2 * 60 * 1000
  }, {
    name: "ingest-hn",
    data: { source: "hacker-news" }
  });

  await queues.feedIngest.upsertJobScheduler("ingest-github-releases", {
    every: 10 * 60 * 1000
  }, {
    name: "ingest-github-releases",
    data: { source: "github-releases" }
  });

  await queues.securityIngest.upsertJobScheduler("ingest-osv", {
    every: 5 * 60 * 1000
  }, {
    name: "ingest-osv",
    data: { source: "osv" }
  });

  await queues.securityIngest.upsertJobScheduler("ingest-cisa-kev", {
    every: 30 * 60 * 1000
  }, {
    name: "ingest-cisa-kev",
    data: { source: "cisa-kev" }
  });

  const startedAt = Date.now();

  await Promise.all([
    queues.feedIngest.add("ingest-hn", { source: "hacker-news" }, {
      jobId: `startup:ingest-hn:${startedAt}`
    }),
    queues.feedIngest.add("ingest-github-releases", { source: "github-releases" }, {
      jobId: `startup:ingest-github-releases:${startedAt}`
    }),
    queues.securityIngest.add("ingest-osv", { source: "osv" }, {
      jobId: `startup:ingest-osv:${startedAt}`
    }),
    queues.securityIngest.add("ingest-github-advisories", { source: "github-advisories" }, {
      jobId: `startup:ingest-github-advisories:${startedAt}`
    }),
    queues.securityIngest.add("ingest-nvd", { source: "nvd" }, {
      jobId: `startup:ingest-nvd:${startedAt}`
    }),
    queues.securityIngest.add("ingest-cisa-kev", { source: "cisa-kev" }, {
      jobId: `startup:ingest-cisa-kev:${startedAt}`
    })
  ]);
}
