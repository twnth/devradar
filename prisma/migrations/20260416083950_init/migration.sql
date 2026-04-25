-- CreateEnum
CREATE TYPE "SourceType" AS ENUM ('news', 'security');

-- CreateEnum
CREATE TYPE "FeedCategory" AS ENUM ('ai', 'web', 'app', 'backend', 'security');

-- CreateEnum
CREATE TYPE "IncidentSeverity" AS ENUM ('critical', 'high', 'medium', 'low', 'unknown');

-- CreateEnum
CREATE TYPE "ExploitStatus" AS ENUM ('known_exploited', 'suspected', 'none', 'unknown');

-- CreateEnum
CREATE TYPE "AlertType" AS ENUM ('security', 'feed');

-- CreateEnum
CREATE TYPE "AlertSeverity" AS ENUM ('critical', 'high', 'medium', 'low', 'info');

-- CreateEnum
CREATE TYPE "AlertStatus" AS ENUM ('unread', 'read', 'archived');

-- CreateEnum
CREATE TYPE "RepoProvider" AS ENUM ('github');

-- CreateEnum
CREATE TYPE "DependencySourceType" AS ENUM ('manifest', 'lockfile', 'dependency_graph');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Source" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "SourceType" NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "pollIntervalMinutes" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Source_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeedItem" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "canonicalUrl" TEXT NOT NULL,
    "dedupeKey" TEXT NOT NULL,
    "sourceName" TEXT NOT NULL,
    "author" TEXT,
    "publishedAt" TIMESTAMP(3) NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL,
    "category" "FeedCategory" NOT NULL,
    "tags" TEXT[],
    "summaryKo" TEXT NOT NULL,
    "whyItMattersKo" TEXT NOT NULL,
    "actionLabel" TEXT NOT NULL,
    "importanceScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "discussionScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "freshnessScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "finalScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "imageUrl" TEXT,
    "rawPayload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeedItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SecurityIncident" (
    "id" TEXT NOT NULL,
    "canonicalKey" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summaryKo" TEXT NOT NULL,
    "whyItMattersKo" TEXT NOT NULL,
    "packageName" TEXT NOT NULL,
    "ecosystem" TEXT NOT NULL,
    "severity" "IncidentSeverity" NOT NULL,
    "affectedVersionRanges" TEXT[],
    "fixedVersions" TEXT[],
    "aliases" TEXT[],
    "references" TEXT[],
    "exploitStatus" "ExploitStatus" NOT NULL DEFAULT 'unknown',
    "publishedAt" TIMESTAMP(3) NOT NULL,
    "modifiedAt" TIMESTAMP(3) NOT NULL,
    "sourcePriority" INTEGER NOT NULL,
    "actionRequired" BOOLEAN NOT NULL DEFAULT false,
    "recommendation" TEXT NOT NULL,
    "rawPayload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SecurityIncident_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SecurityIncidentPackage" (
    "id" TEXT NOT NULL,
    "incidentId" TEXT NOT NULL,
    "packageName" TEXT NOT NULL,
    "ecosystem" TEXT NOT NULL,
    "affectedVersionRanges" TEXT[],
    "fixedVersions" TEXT[],

    CONSTRAINT "SecurityIncidentPackage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WatchlistItem" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "packageName" TEXT NOT NULL,
    "ecosystem" TEXT NOT NULL,
    "currentVersion" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WatchlistItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAlert" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "AlertType" NOT NULL,
    "incidentId" TEXT,
    "feedItemId" TEXT,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "severity" "AlertSeverity" NOT NULL,
    "status" "AlertStatus" NOT NULL DEFAULT 'unread',
    "channelState" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP(3),

    CONSTRAINT "UserAlert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RepoConnection" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" "RepoProvider" NOT NULL,
    "repoOwner" TEXT NOT NULL,
    "repoName" TEXT NOT NULL,
    "repoExternalId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "installedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSyncedAt" TIMESTAMP(3),

    CONSTRAINT "RepoConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RepoDependencySnapshot" (
    "id" TEXT NOT NULL,
    "repoConnectionId" TEXT NOT NULL,
    "commitSha" TEXT NOT NULL,
    "manifestPath" TEXT NOT NULL,
    "ecosystem" TEXT NOT NULL,
    "packageName" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "sourceType" "DependencySourceType" NOT NULL,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RepoDependencySnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "Source_key_key" ON "Source"("key");

-- CreateIndex
CREATE UNIQUE INDEX "FeedItem_slug_key" ON "FeedItem"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "FeedItem_dedupeKey_key" ON "FeedItem"("dedupeKey");

-- CreateIndex
CREATE INDEX "FeedItem_publishedAt_idx" ON "FeedItem"("publishedAt" DESC);

-- CreateIndex
CREATE INDEX "FeedItem_category_idx" ON "FeedItem"("category");

-- CreateIndex
CREATE INDEX "FeedItem_tags_idx" ON "FeedItem"("tags");

-- CreateIndex
CREATE UNIQUE INDEX "FeedItem_sourceId_externalId_key" ON "FeedItem"("sourceId", "externalId");

-- CreateIndex
CREATE UNIQUE INDEX "SecurityIncident_canonicalKey_key" ON "SecurityIncident"("canonicalKey");

-- CreateIndex
CREATE INDEX "SecurityIncident_severity_idx" ON "SecurityIncident"("severity");

-- CreateIndex
CREATE INDEX "SecurityIncident_packageName_idx" ON "SecurityIncident"("packageName");

-- CreateIndex
CREATE UNIQUE INDEX "WatchlistItem_userId_packageName_ecosystem_key" ON "WatchlistItem"("userId", "packageName", "ecosystem");

-- CreateIndex
CREATE INDEX "UserAlert_userId_status_createdAt_idx" ON "UserAlert"("userId", "status", "createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "RepoDependencySnapshot_repoConnectionId_commitSha_manifestP_key" ON "RepoDependencySnapshot"("repoConnectionId", "commitSha", "manifestPath", "packageName");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedItem" ADD CONSTRAINT "FeedItem_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SecurityIncidentPackage" ADD CONSTRAINT "SecurityIncidentPackage_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "SecurityIncident"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WatchlistItem" ADD CONSTRAINT "WatchlistItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAlert" ADD CONSTRAINT "UserAlert_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAlert" ADD CONSTRAINT "UserAlert_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "SecurityIncident"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAlert" ADD CONSTRAINT "UserAlert_feedItemId_fkey" FOREIGN KEY ("feedItemId") REFERENCES "FeedItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepoConnection" ADD CONSTRAINT "RepoConnection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepoDependencySnapshot" ADD CONSTRAINT "RepoDependencySnapshot_repoConnectionId_fkey" FOREIGN KEY ("repoConnectionId") REFERENCES "RepoConnection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
