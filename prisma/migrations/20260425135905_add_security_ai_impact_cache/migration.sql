-- AlterTable
ALTER TABLE "SecurityIncident" ADD COLUMN     "aiImpactBriefing" JSONB,
ADD COLUMN     "aiImpactGeneratedAt" TIMESTAMP(3);
