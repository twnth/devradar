import { Queue, Worker } from "bullmq";
import { calculateFeedScore, calculateSecurityPriority, createFeedDedupeKey, matchesAffectedRange, shouldTriggerImmediateAlert } from "@devradar/utils";
import type { NormalizedFeedStaging, NormalizedSecurityStaging } from "@devradar/types";
import { buildAlertCopy } from "@devradar/utils";
import { prisma } from "../lib/prisma";
import { persistFeedItems, persistSecurityIncidents } from "../lib/persistence";

type PipelineContext = {
  connection: { url: string };
};

export function createQueues(context: PipelineContext) {
  return {
    feedIngest: new Queue("feed-ingest", { connection: context.connection }),
    feedNormalize: new Queue("feed-normalize", { connection: context.connection }),
    feedScore: new Queue("feed-score", { connection: context.connection }),
    securityIngest: new Queue("security-ingest", { connection: context.connection }),
    securityNormalize: new Queue("security-normalize", { connection: context.connection }),
    securityMerge: new Queue("security-merge", { connection: context.connection }),
    securityMatch: new Queue("security-match", { connection: context.connection }),
    securityNotify: new Queue("security-notify", { connection: context.connection })
  };
}

export function createWorkers(context: PipelineContext) {
  const queues = createQueues(context);

  const workers = [
    new Worker(
      "feed-normalize",
      async (job) => {
        const items = job.data as NormalizedFeedStaging[];
        console.log(`[worker][feed-normalize] start name=${job.name} id=${job.id ?? "unknown"} count=${items.length}`);
        const persisted = await persistFeedItems(items);
        console.log(`[worker][feed-normalize] persisted count=${persisted.length}`);
        return persisted;
      },
      { connection: context.connection }
    ),
    new Worker(
      "feed-score",
      async (job) => {
        return (job.data as Array<{ importanceScore: number; discussionScore: number; freshnessScore: number; interestMatchScore: number }>).map((item) => calculateFeedScore(item));
      },
      { connection: context.connection }
    ),
    new Worker(
      "security-normalize",
      async (job) => {
        const incoming = job.data as NormalizedSecurityStaging[];
        console.log(`[worker][security-normalize] start name=${job.name} id=${job.id ?? "unknown"} count=${incoming.length}`);
        const incidents = await persistSecurityIncidents(
          incoming
        );
        console.log(`[worker][security-normalize] persisted count=${incidents.length}`);

        return Promise.all(
          incidents.map((incident) =>
            queues.securityMatch.add(
              "match-watchlists",
              {
                incidentId: incident.id
              },
              {
                jobId: `incident-match:${incident.id}`
              }
            )
          )
        );
      },
      { connection: context.connection }
    ),
    new Worker(
      "security-match",
      async (job) => {
        const data = job.data as {
          incidentId: string;
        };
        console.log(`[worker][security-match] start incidentId=${data.incidentId} id=${job.id ?? "unknown"}`);

        const incident = await prisma.securityIncident.findUnique({
          where: { id: data.incidentId }
        });

        if (!incident) {
          console.log(`[worker][security-match] skip missing incidentId=${data.incidentId}`);
          return [];
        }

        const watchlist = await prisma.watchlistItem.findMany({
          where: {
            packageName: incident.packageName,
            ecosystem: incident.ecosystem,
            isActive: true
          }
        });

        const results = [];

        for (const watch of watchlist) {
          const confidence = matchesAffectedRange(
            watch.currentVersion,
            incident.affectedVersionRanges,
            incident.ecosystem.toLowerCase()
          );
          const immediate = shouldTriggerImmediateAlert({
          severity: incident.severity,
          packageMatched: true,
          currentVersionConfidence: confidence,
          exploitStatus: incident.exploitStatus
          });

          const priorityScore = calculateSecurityPriority({
            severity: incident.severity,
            watchedPackage: true,
            knownExploited: incident.exploitStatus === "known_exploited",
            hasFixedVersion: incident.fixedVersions.length > 0,
            publishedWithin48h:
              incident.publishedAt.getTime() > Date.now() - 48 * 60 * 60 * 1000
          });

          if (immediate || confidence === "likely") {
            const copy = buildAlertCopy({
              packageName: incident.packageName,
              severity: incident.severity,
              fixedVersion: incident.fixedVersions[0]
            });

            await prisma.userAlert.upsert({
              where: {
                id: `${watch.userId}-${incident.id}`
              },
              update: {
                title: copy.title,
                body: copy.body,
                severity:
                  incident.severity === "critical"
                    ? "critical"
                    : incident.severity === "high"
                      ? "high"
                      : incident.severity === "medium"
                        ? "medium"
                        : "low",
                status: "unread",
                channelState: {
                  inApp: true,
                  confidence,
                  priorityScore
                }
              },
              create: {
                id: `${watch.userId}-${incident.id}`,
                userId: watch.userId,
                type: "security",
                incidentId: incident.id,
                title: copy.title,
                body: copy.body,
                severity:
                  incident.severity === "critical"
                    ? "critical"
                    : incident.severity === "high"
                      ? "high"
                      : incident.severity === "medium"
                        ? "medium"
                        : "low",
                status: "unread",
                channelState: {
                  inApp: true,
                  confidence,
                  priorityScore
                }
              }
            });
          }

          results.push({
            watchlistId: watch.id,
            confidence,
            immediate,
            priorityScore
          });
        }

        console.log(`[worker][security-match] completed incidentId=${data.incidentId} watchMatches=${results.length}`);

        return results;
      },
      { connection: context.connection }
    )
  ];

  for (const worker of workers) {
    worker.on("failed", (job, error) => {
      console.error(
        `[worker][${worker.name}] failed job=${job?.name ?? "unknown"} id=${job?.id ?? "unknown"}`,
        error
      );
    });

    worker.on("error", (error) => {
      console.error(`[worker][${worker.name}] worker-error`, error);
    });
  }

  return workers;
}
