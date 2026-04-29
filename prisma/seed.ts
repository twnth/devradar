import { PrismaClient, SourceType } from "@prisma/client";

const prisma = new PrismaClient();

function readPollingHours(envKey: string, fallbackHours: number) {
  const rawValue = process.env[envKey];
  if (!rawValue) return fallbackHours;

  const parsed = Number(rawValue);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallbackHours;
}

function toMinutes(hours: number) {
  return Math.round(hours * 60);
}

const pollingMinutes = {
  hackerNews: toMinutes(readPollingHours("WORKER_HN_POLL_HOURS", 2)),
  githubReleases: toMinutes(readPollingHours("WORKER_GITHUB_RELEASES_POLL_HOURS", 4)),
  githubAdvisories: toMinutes(readPollingHours("WORKER_GITHUB_ADVISORIES_POLL_HOURS", 2)),
  osv: toMinutes(readPollingHours("WORKER_OSV_POLL_HOURS", 2)),
  nvd: toMinutes(readPollingHours("WORKER_NVD_POLL_HOURS", 6)),
  cisaKev: toMinutes(readPollingHours("WORKER_CISA_KEV_POLL_HOURS", 12))
};

const sourceSeeds = [
  { key: "hacker-news", name: "Hacker News", type: SourceType.news, pollIntervalMinutes: pollingMinutes.hackerNews },
  { key: "github-releases:next.js", name: "Next.js Releases", type: SourceType.news, pollIntervalMinutes: pollingMinutes.githubReleases },
  { key: "github-releases:vercel", name: "Vercel Releases", type: SourceType.news, pollIntervalMinutes: pollingMinutes.githubReleases },
  { key: "github-releases:vite", name: "Vite Releases", type: SourceType.news, pollIntervalMinutes: pollingMinutes.githubReleases },
  { key: "github-releases:react", name: "React Releases", type: SourceType.news, pollIntervalMinutes: pollingMinutes.githubReleases },
  { key: "github-releases:nuxt", name: "Nuxt Releases", type: SourceType.news, pollIntervalMinutes: pollingMinutes.githubReleases },
  { key: "github-releases:kit", name: "SvelteKit Releases", type: SourceType.news, pollIntervalMinutes: pollingMinutes.githubReleases },
  { key: "github-releases:spring-boot", name: "Spring Boot Releases", type: SourceType.news, pollIntervalMinutes: pollingMinutes.githubReleases },
  { key: "github-releases:kotlin", name: "Kotlin Releases", type: SourceType.news, pollIntervalMinutes: pollingMinutes.githubReleases },
  { key: "github-releases:androidx", name: "AndroidX Releases", type: SourceType.news, pollIntervalMinutes: pollingMinutes.githubReleases },
  { key: "github-advisories", name: "GitHub Advisories", type: SourceType.security, pollIntervalMinutes: pollingMinutes.githubAdvisories },
  { key: "osv", name: "OSV", type: SourceType.security, pollIntervalMinutes: pollingMinutes.osv },
  { key: "nvd", name: "NVD", type: SourceType.security, pollIntervalMinutes: pollingMinutes.nvd },
  { key: "cisa-kev", name: "CISA KEV", type: SourceType.security, pollIntervalMinutes: pollingMinutes.cisaKev }
];

async function removeLegacyDemoData() {
  await prisma.userAlert.deleteMany({
    where: {
      OR: [
        { id: { startsWith: "demo-" } },
        { title: { startsWith: "읽어둘 만한 업데이트:" } }
      ]
    }
  });

  await prisma.repoDependencySnapshot.deleteMany({
    where: {
      OR: [
        { commitSha: "demo123" },
        { repoConnection: { id: "demo-repo-connection" } }
      ]
    }
  });

  await prisma.repoConnection.deleteMany({
    where: {
      OR: [
        { id: "demo-repo-connection" },
        { repoOwner: "devradar", repoName: "demo-app" }
      ]
    }
  });

  const demoUsers = await prisma.user.findMany({
    where: {
      email: {
        in: ["demo@devradar.local"]
      }
    },
    select: { id: true }
  });

  await prisma.watchlistItem.deleteMany({
    where: {
      userId: {
        in: demoUsers.map((user) => user.id)
      }
    }
  });

  await prisma.feedItem.deleteMany({
    where: {
      OR: [
        { externalId: { startsWith: "feed-" } },
        { dedupeKey: { startsWith: "demo-feed-" } },
        { url: { startsWith: "https://example.com/feed/" } }
      ]
    }
  });

  await prisma.$executeRaw`
    DELETE FROM "SecurityIncident"
    WHERE "canonicalKey" IN (
      'next-cve-2026-1001',
      'react-ghsa-react-high',
      'vite-osv-2026-vite',
      'okhttp-cve-2026-2233',
      'spring-boot-ghsa-sboot-1',
      'node-fetch-osv-2026-node-fetch',
      'axios-cve-2026-8811',
      'express-ghsa-express-mid',
      'prisma-osv-2026-prisma',
      'kotlinx-coroutines-core-cve-2026-5599'
    )
    OR "rawPayload"->>'mock' = 'true'
    OR EXISTS (
      SELECT 1
      FROM unnest("references") AS reference
      WHERE reference LIKE 'https://example.com/security/%'
    )
  `;

  await prisma.user.deleteMany({
    where: {
      email: "demo@devradar.local"
    }
  });
}

async function main() {
  await removeLegacyDemoData();

  for (const source of sourceSeeds) {
    await prisma.source.upsert({
      where: { key: source.key },
      update: {
        name: source.name,
        type: source.type,
        pollIntervalMinutes: source.pollIntervalMinutes,
        enabled: true
      },
      create: {
        ...source,
        enabled: true
      }
    });
  }

  await prisma.source.deleteMany({
    where: {
      key: {
        notIn: sourceSeeds.map((source) => source.key)
      },
      feedItems: {
        none: {}
      }
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
