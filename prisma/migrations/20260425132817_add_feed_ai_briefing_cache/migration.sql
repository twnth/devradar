-- AlterTable
ALTER TABLE "FeedItem" ADD COLUMN     "aiBriefing" JSONB,
ADD COLUMN     "aiBriefingGeneratedAt" TIMESTAMP(3);
