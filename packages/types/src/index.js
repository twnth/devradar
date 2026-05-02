"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizedSecurityStagingSchema = exports.normalizedFeedStagingSchema = exports.incidentQuerySchema = exports.feedQuerySchema = exports.dashboardSummarySchema = exports.userAlertSchema = exports.watchlistItemSchema = exports.securityIncidentSchema = exports.securityImpactBriefingSchema = exports.feedBriefingSchema = exports.feedItemSchema = exports.sourceSchema = exports.sourceTypeSchema = exports.impactConfidenceSchema = exports.exploitStatusSchema = exports.alertSeveritySchema = exports.severitySchema = exports.feedCategorySchema = void 0;
const zod_1 = require("zod");
exports.feedCategorySchema = zod_1.z.enum(["ai", "web", "app", "backend", "security"]);
exports.severitySchema = zod_1.z.enum(["critical", "high", "medium", "low", "unknown"]);
exports.alertSeveritySchema = zod_1.z.enum(["critical", "high", "medium", "low", "info"]);
exports.exploitStatusSchema = zod_1.z.enum(["known_exploited", "suspected", "none", "unknown"]);
exports.impactConfidenceSchema = zod_1.z.enum(["exact", "likely", "no_match", "unknown"]);
exports.sourceTypeSchema = zod_1.z.enum(["news", "security"]);
exports.sourceSchema = zod_1.z.object({
    id: zod_1.z.string(),
    key: zod_1.z.string(),
    name: zod_1.z.string(),
    type: exports.sourceTypeSchema,
    enabled: zod_1.z.boolean(),
    pollIntervalMinutes: zod_1.z.number()
});
exports.feedItemSchema = zod_1.z.object({
    id: zod_1.z.string(),
    sourceId: zod_1.z.string(),
    externalId: zod_1.z.string(),
    title: zod_1.z.string(),
    slug: zod_1.z.string(),
    url: zod_1.z.string().url(),
    sourceName: zod_1.z.string(),
    author: zod_1.z.string().nullable().optional(),
    publishedAt: zod_1.z.string(),
    fetchedAt: zod_1.z.string(),
    category: exports.feedCategorySchema,
    tags: zod_1.z.array(zod_1.z.string()),
    summaryKo: zod_1.z.string().max(120),
    whyItMattersKo: zod_1.z.string().max(80),
    actionLabel: zod_1.z.enum(["Read", "Watch", "Upgrade now"]),
    importanceScore: zod_1.z.number(),
    discussionScore: zod_1.z.number(),
    freshnessScore: zod_1.z.number(),
    finalScore: zod_1.z.number(),
    canonicalUrl: zod_1.z.string().url(),
    dedupeKey: zod_1.z.string(),
    imageUrl: zod_1.z.string().url().nullable().optional(),
    rawPayload: zod_1.z.record(zod_1.z.any())
});
exports.feedBriefingSchema = zod_1.z.object({
    title: zod_1.z.string().max(100),
    summary: zod_1.z.string().max(520),
    keyPoints: zod_1.z.array(zod_1.z.string().max(220)).min(3).max(5)
});
exports.securityImpactBriefingSchema = zod_1.z.object({
    title: zod_1.z.string().max(80),
    intro: zod_1.z.string().max(220),
    sideEffects: zod_1.z.array(zod_1.z.string().max(180)).min(2).max(4),
    operationalRisk: zod_1.z.string().max(140)
});
exports.securityIncidentSchema = zod_1.z.object({
    id: zod_1.z.string(),
    canonicalKey: zod_1.z.string(),
    title: zod_1.z.string(),
    summaryKo: zod_1.z.string().max(120),
    whyItMattersKo: zod_1.z.string().max(80),
    packageName: zod_1.z.string(),
    ecosystem: zod_1.z.string(),
    severity: exports.severitySchema,
    affectedVersionRanges: zod_1.z.array(zod_1.z.string()),
    fixedVersions: zod_1.z.array(zod_1.z.string()),
    aliases: zod_1.z.array(zod_1.z.string()),
    references: zod_1.z.array(zod_1.z.string().url()),
    exploitStatus: exports.exploitStatusSchema,
    publishedAt: zod_1.z.string(),
    modifiedAt: zod_1.z.string(),
    sourcePriority: zod_1.z.number(),
    actionRequired: zod_1.z.boolean(),
    recommendation: zod_1.z.string()
});
exports.watchlistItemSchema = zod_1.z.object({
    id: zod_1.z.string(),
    packageName: zod_1.z.string(),
    ecosystem: zod_1.z.string(),
    currentVersion: zod_1.z.string().nullable().optional(),
    isActive: zod_1.z.boolean(),
    impactConfidence: exports.impactConfidenceSchema.optional()
});
exports.userAlertSchema = zod_1.z.object({
    id: zod_1.z.string(),
    type: zod_1.z.enum(["security", "feed"]),
    title: zod_1.z.string(),
    body: zod_1.z.string(),
    severity: exports.alertSeveritySchema,
    status: zod_1.z.enum(["unread", "read", "archived"]),
    createdAt: zod_1.z.string(),
    readAt: zod_1.z.string().nullable().optional()
});
exports.dashboardSummarySchema = zod_1.z.object({
    criticalIncidentCount: zod_1.z.number(),
    watchedAtRiskCount: zod_1.z.number(),
    todayFeedCount: zod_1.z.number(),
    topPriorityLabel: zod_1.z.string()
});
exports.feedQuerySchema = zod_1.z.object({
    category: exports.feedCategorySchema.optional(),
    tag: zod_1.z.string().optional(),
    sort: zod_1.z.enum(["latest", "important", "discussed"]).optional(),
    cursor: zod_1.z.string().optional(),
    limit: zod_1.z.coerce.number().min(1).max(50).optional()
});
exports.incidentQuerySchema = zod_1.z.object({
    severity: exports.severitySchema.optional(),
    ecosystem: zod_1.z.string().optional(),
    package: zod_1.z.string().optional(),
    onlyWatched: zod_1.z.coerce.boolean().optional(),
    cursor: zod_1.z.string().optional(),
    limit: zod_1.z.coerce.number().min(1).max(50).optional()
});
exports.normalizedFeedStagingSchema = zod_1.z.object({
    sourceKey: zod_1.z.string(),
    externalId: zod_1.z.string(),
    title: zod_1.z.string(),
    url: zod_1.z.string().url(),
    author: zod_1.z.string().optional(),
    publishedAt: zod_1.z.string(),
    category: exports.feedCategorySchema,
    tags: zod_1.z.array(zod_1.z.string()),
    rawPayload: zod_1.z.record(zod_1.z.any())
});
exports.normalizedSecurityStagingSchema = zod_1.z.object({
    sourceKey: zod_1.z.string(),
    packageName: zod_1.z.string(),
    ecosystem: zod_1.z.string(),
    title: zod_1.z.string(),
    aliases: zod_1.z.array(zod_1.z.string()),
    affectedVersionRanges: zod_1.z.array(zod_1.z.string()),
    fixedVersions: zod_1.z.array(zod_1.z.string()),
    references: zod_1.z.array(zod_1.z.string().url()),
    severity: exports.severitySchema,
    exploitStatus: exports.exploitStatusSchema,
    publishedAt: zod_1.z.string(),
    modifiedAt: zod_1.z.string(),
    rawPayload: zod_1.z.record(zod_1.z.any())
});
