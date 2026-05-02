import { Controller, Get, Inject, Module } from "@nestjs/common";
import { matchesAffectedRange } from "@devradar/utils";
import { getDefaultUser } from "../common/default-user";
import { PrismaService } from "../common/prisma.service";

function getKstDayRange(now = new Date()) {
  const kstOffsetMs = 9 * 60 * 60 * 1000;
  const kstNow = new Date(now.getTime() + kstOffsetMs);
  const startUtcMs =
    Date.UTC(kstNow.getUTCFullYear(), kstNow.getUTCMonth(), kstNow.getUTCDate()) - kstOffsetMs;

  return {
    gte: new Date(startUtcMs),
    lt: new Date(startUtcMs + 24 * 60 * 60 * 1000)
  };
}

@Controller("api/v1/dashboard")
class DashboardController {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  @Get("summary")
  async summary() {
    const empty = {
      criticalIncidentCount: 0,
      watchedAtRiskCount: 0,
      todayFeedCount: 0,
      topPriorityLabel: "-"
    };

    if (!this.prisma.isReady()) {
      return empty;
    }

    try {
      const defaultUser = await getDefaultUser(this.prisma);
      const todayRange = getKstDayRange();

      const [criticalIncidentCount, todayFeedCount, topPriorityIncident, watchlistItems, incidents] =
        await Promise.all([
          this.prisma.securityIncident.count({
            where: {
              severity: {
                in: ["critical", "high"]
              }
            }
          }),
          this.prisma.feedItem.count({
            where: {
              publishedAt: {
                gte: todayRange.gte,
                lt: todayRange.lt
              }
            }
          }),
          this.prisma.securityIncident.findFirst({
            where: {
              severity: {
                in: ["critical", "high", "medium", "low", "unknown"]
              }
            },
            orderBy: [{ sourcePriority: "desc" }, { publishedAt: "desc" }]
          }),
          defaultUser
            ? this.prisma.watchlistItem.findMany({
                where: {
                  userId: defaultUser.id,
                  isActive: true
                }
              })
            : Promise.resolve([]),
          this.prisma.securityIncident.findMany()
        ]);

      const watchedAtRiskCount = watchlistItems.filter((item) => {
        const related = incidents.find(
          (incident) =>
            incident.packageName === item.packageName &&
            incident.ecosystem.toLowerCase() === item.ecosystem.toLowerCase()
        );

        if (!related) {
          return false;
        }

        const confidence = matchesAffectedRange(
          item.currentVersion,
          related.affectedVersionRanges,
          item.ecosystem.toLowerCase()
        );

        return confidence === "exact" || confidence === "likely";
      }).length;

      return {
        criticalIncidentCount,
        watchedAtRiskCount,
        todayFeedCount,
        topPriorityLabel: topPriorityIncident?.packageName ?? "-"
      };
    } catch (error) {
      console.error("Failed to build dashboard summary", error);
      return empty;
    }
  }
}

@Module({
  controllers: [DashboardController]
})
export class DashboardModule {}
