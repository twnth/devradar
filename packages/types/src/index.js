import { z } from "zod";
export const feedCategorySchema = z.enum(["ai", "web", "app", "backend", "security"]);
export const severitySchema = z.enum(["critical", "high", "medium", "low", "unknown"]);
export const alertSeveritySchema = z.enum(["critical", "high", "medium", "low", "info"]);
export const exploitStatusSchema = z.enum(["known_exploited", "suspected", "none", "unknown"]);
export const impactConfidenceSchema = z.enum(["exact", "likely", "no_match", "unknown"]);
export const sourceTypeSchema = z.enum(["news", "security"]);
export const sourceSchema = z.object({
    id: z.string(),
    key: z.string(),
    name: z.string(),
    type: sourceTypeSchema,
    enabled: z.boolean(),
    pollIntervalMinutes: z.number()
});
export const feedItemSchema = z.object({
    id: z.string(),
    sourceId: z.string(),
    externalId: z.string(),
    title: z.string(),
    slug: z.string(),
    url: z.string().url(),
    sourceName: z.string(),
    author: z.string().nullable().optional(),
    publishedAt: z.string(),
    fetchedAt: z.string(),
    category: feedCategorySchema,
    tags: z.array(z.string()),
    summaryKo: z.string().max(120),
    whyItMattersKo: z.string().max(80),
    actionLabel: z.enum(["Read", "Watch", "Upgrade now"]),
    importanceScore: z.number(),
    discussionScore: z.number(),
    freshnessScore: z.number(),
    finalScore: z.number(),
    canonicalUrl: z.string().url(),
    dedupeKey: z.string(),
    imageUrl: z.string().url().nullable().optional(),
    rawPayload: z.record(z.any())
});
export const securityIncidentSchema = z.object({
    id: z.string(),
    canonicalKey: z.string(),
    title: z.string(),
    summaryKo: z.string().max(120),
    whyItMattersKo: z.string().max(80),
    packageName: z.string(),
    ecosystem: z.string(),
    severity: severitySchema,
    affectedVersionRanges: z.array(z.string()),
    fixedVersions: z.array(z.string()),
    aliases: z.array(z.string()),
    references: z.array(z.string().url()),
    exploitStatus: exploitStatusSchema,
    publishedAt: z.string(),
    modifiedAt: z.string(),
    sourcePriority: z.number(),
    actionRequired: z.boolean(),
    recommendation: z.string()
});
export const watchlistItemSchema = z.object({
    id: z.string(),
    packageName: z.string(),
    ecosystem: z.string(),
    currentVersion: z.string().nullable().optional(),
    isActive: z.boolean(),
    impactConfidence: impactConfidenceSchema.optional()
});
export const userAlertSchema = z.object({
    id: z.string(),
    type: z.enum(["security", "feed"]),
    title: z.string(),
    body: z.string(),
    severity: alertSeveritySchema,
    status: z.enum(["unread", "read", "archived"]),
    createdAt: z.string(),
    readAt: z.string().nullable().optional()
});
export const feedQuerySchema = z.object({
    category: feedCategorySchema.optional(),
    tag: z.string().optional(),
    sort: z.enum(["latest", "important", "discussed"]).optional(),
    cursor: z.string().optional(),
    limit: z.coerce.number().min(1).max(50).optional()
});
export const incidentQuerySchema = z.object({
    severity: severitySchema.optional(),
    ecosystem: z.string().optional(),
    package: z.string().optional(),
    onlyWatched: z.coerce.boolean().optional(),
    cursor: z.string().optional(),
    limit: z.coerce.number().min(1).max(50).optional()
});
export const normalizedFeedStagingSchema = z.object({
    sourceKey: z.string(),
    externalId: z.string(),
    title: z.string(),
    url: z.string().url(),
    author: z.string().optional(),
    publishedAt: z.string(),
    category: feedCategorySchema,
    tags: z.array(z.string()),
    rawPayload: z.record(z.any())
});
export const normalizedSecurityStagingSchema = z.object({
    sourceKey: z.string(),
    packageName: z.string(),
    ecosystem: z.string(),
    title: z.string(),
    aliases: z.array(z.string()),
    affectedVersionRanges: z.array(z.string()),
    fixedVersions: z.array(z.string()),
    references: z.array(z.string().url()),
    severity: severitySchema,
    exploitStatus: exploitStatusSchema,
    publishedAt: z.string(),
    modifiedAt: z.string(),
    rawPayload: z.record(z.any())
});
