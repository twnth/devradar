import type { Queue } from "bullmq";

function readPollingHours(envKey: string, fallbackHours: number) {
  const rawValue = process.env[envKey];
  if (!rawValue) return fallbackHours;

  const parsed = Number(rawValue);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallbackHours;
}

function hoursToMs(hours: number) {
  return hours * 60 * 60 * 1000;
}

export async function registerRecurringJobs(queues: {
  feedIngest: Queue;
  securityIngest: Queue;
}) {
  const pollingHours = {
    hackerNews: readPollingHours("WORKER_HN_POLL_HOURS", 2),
    githubReleases: readPollingHours("WORKER_GITHUB_RELEASES_POLL_HOURS", 4),
    osv: readPollingHours("WORKER_OSV_POLL_HOURS", 2),
    githubAdvisories: readPollingHours("WORKER_GITHUB_ADVISORIES_POLL_HOURS", 2),
    nvd: readPollingHours("WORKER_NVD_POLL_HOURS", 6),
    cisaKev: readPollingHours("WORKER_CISA_KEV_POLL_HOURS", 12)
  };

  console.log("Registering recurring worker jobs");
  console.log(
    JSON.stringify(
      {
        hackerNewsHours: pollingHours.hackerNews,
        githubReleasesHours: pollingHours.githubReleases,
        osvHours: pollingHours.osv,
        githubAdvisoriesHours: pollingHours.githubAdvisories,
        nvdHours: pollingHours.nvd,
        cisaKevHours: pollingHours.cisaKev
      },
      null,
      2
    )
  );

  await queues.feedIngest.upsertJobScheduler("ingest-hn", {
    every: hoursToMs(pollingHours.hackerNews)
  }, {
    name: "ingest-hn",
    data: { source: "hacker-news" }
  });

  await queues.feedIngest.upsertJobScheduler("ingest-github-releases", {
    every: hoursToMs(pollingHours.githubReleases)
  }, {
    name: "ingest-github-releases",
    data: { source: "github-releases" }
  });

  await queues.securityIngest.upsertJobScheduler("ingest-osv", {
    every: hoursToMs(pollingHours.osv)
  }, {
    name: "ingest-osv",
    data: { source: "osv" }
  });

  await queues.securityIngest.upsertJobScheduler("ingest-github-advisories", {
    every: hoursToMs(pollingHours.githubAdvisories)
  }, {
    name: "ingest-github-advisories",
    data: { source: "github-advisories" }
  });

  await queues.securityIngest.upsertJobScheduler("ingest-nvd", {
    every: hoursToMs(pollingHours.nvd)
  }, {
    name: "ingest-nvd",
    data: { source: "nvd" }
  });

  await queues.securityIngest.upsertJobScheduler("ingest-cisa-kev", {
    every: hoursToMs(pollingHours.cisaKev)
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

  console.log(`Startup ingest jobs queued at ${new Date(startedAt).toISOString()}`);
}
