import type { FeedItem, SecurityIncident, UserAlert, WatchlistItem } from "@devradar/types";
import type { FeedItem as PrismaFeedItem, SecurityIncident as PrismaIncident, UserAlert as PrismaAlert, WatchlistItem as PrismaWatchlist } from "@prisma/client";

export function mapFeedItem(record: PrismaFeedItem): FeedItem {
  return {
    id: record.id,
    sourceId: record.sourceId,
    externalId: record.externalId,
    title: record.title,
    slug: record.slug,
    url: record.url,
    sourceName: record.sourceName,
    author: record.author ?? undefined,
    publishedAt: record.publishedAt.toISOString(),
    fetchedAt: record.fetchedAt.toISOString(),
    category: record.category,
    tags: record.tags,
    summaryKo: record.summaryKo,
    whyItMattersKo: record.whyItMattersKo,
    actionLabel: record.actionLabel as FeedItem["actionLabel"],
    importanceScore: record.importanceScore,
    discussionScore: record.discussionScore,
    freshnessScore: record.freshnessScore,
    finalScore: record.finalScore,
    canonicalUrl: record.canonicalUrl,
    dedupeKey: record.dedupeKey,
    imageUrl: record.imageUrl ?? null,
    rawPayload: record.rawPayload as Record<string, unknown>
  };
}

export function mapSecurityIncident(record: PrismaIncident): SecurityIncident {
  return {
    id: record.id,
    canonicalKey: record.canonicalKey,
    title: record.title,
    summaryKo: record.summaryKo,
    whyItMattersKo: record.whyItMattersKo,
    packageName: record.packageName,
    ecosystem: record.ecosystem,
    severity: record.severity,
    affectedVersionRanges: record.affectedVersionRanges,
    fixedVersions: record.fixedVersions,
    aliases: record.aliases,
    references: record.references,
    exploitStatus: record.exploitStatus,
    publishedAt: record.publishedAt.toISOString(),
    modifiedAt: record.modifiedAt.toISOString(),
    sourcePriority: record.sourcePriority,
    actionRequired: record.actionRequired,
    recommendation: record.recommendation
  };
}

export function mapWatchlistItem(record: PrismaWatchlist, impactConfidence?: WatchlistItem["impactConfidence"]): WatchlistItem {
  return {
    id: record.id,
    packageName: record.packageName,
    ecosystem: record.ecosystem,
    currentVersion: record.currentVersion ?? undefined,
    isActive: record.isActive,
    impactConfidence
  };
}

export function mapUserAlert(record: PrismaAlert): UserAlert {
  return {
    id: record.id,
    type: record.type,
    title: record.title,
    body: record.body,
    severity: record.severity,
    status: record.status,
    createdAt: record.createdAt.toISOString(),
    readAt: record.readAt?.toISOString() ?? null
  };
}
