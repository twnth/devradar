import { Body, Controller, Delete, Get, Inject, Module, Param, Patch, Post, Query } from "@nestjs/common";
import { buildAlertCopy, matchesAffectedRange } from "@devradar/utils";
import { incidentQuerySchema, watchlistItemSchema } from "@devradar/types";
import { getDefaultUser } from "../common/default-user";
import { mapSecurityIncident, mapUserAlert, mapWatchlistItem } from "../common/mappers";
import { PrismaService } from "../common/prisma.service";
import { generateSecurityImpactBriefing } from "../common/security-impact-briefing";

@Controller("api/v1/security/incidents")
class SecurityController {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  @Get()
  async list(@Query() query: Record<string, string | undefined>) {
    const parsed = incidentQuerySchema.safeParse(query);
    const severity = parsed.success ? parsed.data.severity : undefined;
    const ecosystem = parsed.success ? parsed.data.ecosystem : undefined;
    const packageName = parsed.success ? parsed.data.package : undefined;
    const onlyWatched = parsed.success ? parsed.data.onlyWatched : false;
    const limit = parsed.success ? parsed.data.limit ?? 20 : 20;

    if (this.prisma.isReady()) {
      try {
        let watchedPackages: string[] | undefined;
        if (onlyWatched) {
          const defaultUser = await getDefaultUser(this.prisma);
          watchedPackages = defaultUser
            ? (
                await this.prisma.watchlistItem.findMany({
                  where: { userId: defaultUser.id, isActive: true },
                  select: { packageName: true }
                })
              ).map((item) => item.packageName)
            : [];
        }

        const items = await this.prisma.securityIncident.findMany({
          where: {
            ...(severity ? { severity } : {}),
            ...(ecosystem ? { ecosystem } : {}),
            ...(packageName ? { packageName } : {}),
            ...(onlyWatched ? { packageName: { in: watchedPackages } } : {})
          },
          orderBy: [
            { sourcePriority: "desc" },
            { publishedAt: "desc" }
          ],
          take: limit
        });

        if (items.length > 0) {
          return {
            data: items.map(mapSecurityIncident),
            nextCursor: null
          };
        }
      } catch (error) {
        console.error("Failed to query security incidents", error);
      }
    }

    return {
      data: [],
      nextCursor: null
    };
  }

  @Get(":id")
  async detail(@Param("id") id: string) {
    if (this.prisma.isReady()) {
      try {
        const record = await this.prisma.securityIncident.findFirst({
          where: {
            OR: [{ id }, { canonicalKey: id }]
          }
        });

        if (record) {
          return mapSecurityIncident(record);
        }
      } catch (error) {
        console.error("Failed to query security incident", error);
      }
    }

    return undefined;
  }

  @Get(":id/impact")
  async impact(@Param("id") id: string) {
    if (!this.prisma.isReady()) {
      return null;
    }

    try {
      const record = await this.prisma.securityIncident.findFirst({
        where: {
          OR: [{ id }, { canonicalKey: id }]
        }
      });

      if (!record) {
        return null;
      }

      if (record.aiImpactBriefing) {
        return record.aiImpactBriefing;
      }

      if (!process.env.OPENAI_API_KEY) {
        return null;
      }

      const impact = await generateSecurityImpactBriefing(record);

      if (!impact) {
        return null;
      }

      await this.prisma.securityIncident.update({
        where: { id: record.id },
        data: {
          aiImpactBriefing: impact,
          aiImpactGeneratedAt: new Date()
        }
      });

      return impact;
    } catch (error) {
      console.error("Failed to generate security impact briefing", error);
      return null;
    }
  }
}

@Controller("api/v1/watchlist")
class WatchlistController {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  @Get()
  async list() {
    if (this.prisma.isReady()) {
      const defaultUser = await getDefaultUser(this.prisma);
      if (defaultUser) {
        const [items, incidents] = await Promise.all([
          this.prisma.watchlistItem.findMany({
            where: { userId: defaultUser.id },
            orderBy: { createdAt: "asc" }
          }),
          this.prisma.securityIncident.findMany()
        ]);

        if (items.length > 0) {
          return items.map((item) => {
            const related = incidents.find(
              (incident) =>
                incident.packageName === item.packageName &&
                incident.ecosystem.toLowerCase() === item.ecosystem.toLowerCase()
            );

            return mapWatchlistItem(
              item,
              related
                ? matchesAffectedRange(
                    item.currentVersion,
                    related.affectedVersionRanges,
                    item.ecosystem.toLowerCase()
                  )
                : "no_match"
            );
          });
        }
      }
    }

    return [];
  }

  @Post()
  async create(@Body() body: unknown) {
    const parsed = watchlistItemSchema.pick({
      packageName: true,
      ecosystem: true,
      currentVersion: true
    }).safeParse(body);

    if (!parsed.success) {
      return { error: parsed.error.flatten() };
    }

    if (this.prisma.isReady()) {
      const defaultUser = await getDefaultUser(this.prisma);
      if (defaultUser) {
        const record = await this.prisma.watchlistItem.upsert({
          where: {
            userId_packageName_ecosystem: {
              userId: defaultUser.id,
              packageName: parsed.data.packageName,
              ecosystem: parsed.data.ecosystem
            }
          },
          update: {
            currentVersion: parsed.data.currentVersion ?? null,
            isActive: true
          },
          create: {
            userId: defaultUser.id,
            packageName: parsed.data.packageName,
            ecosystem: parsed.data.ecosystem,
            currentVersion: parsed.data.currentVersion ?? null,
            isActive: true
          }
        });

        return mapWatchlistItem(record);
      }
    }

    return { error: "Database is not ready." };
  }

  @Patch(":id")
  async update(@Param("id") id: string, @Body() body: Record<string, unknown>) {
    if (this.prisma.isReady()) {
      const record = await this.prisma.watchlistItem.update({
        where: { id },
        data: {
          currentVersion:
            typeof body.currentVersion === "string" ? body.currentVersion : undefined,
          isActive: typeof body.isActive === "boolean" ? body.isActive : undefined
        }
      });

      return mapWatchlistItem(record);
    }

    return {
      id,
      ...body
    };
  }

  @Delete(":id")
  async remove(@Param("id") id: string) {
    if (this.prisma.isReady()) {
      await this.prisma.watchlistItem.delete({
        where: { id }
      });
    }

    return {
      id,
      deleted: true
    };
  }
}

@Controller("api/v1/alerts")
class AlertsController {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  @Get()
  async list() {
    if (this.prisma.isReady()) {
      const defaultUser = await getDefaultUser(this.prisma);
      if (defaultUser) {
        const alerts = await this.prisma.userAlert.findMany({
          where: { userId: defaultUser.id },
          orderBy: { createdAt: "desc" }
        });

        if (alerts.length > 0) {
          return alerts.map(mapUserAlert);
        }
      }
    }

    return [];
  }

  @Patch(":id/read")
  async markRead(@Param("id") id: string) {
    if (this.prisma.isReady()) {
      const record = await this.prisma.userAlert.update({
        where: { id },
        data: {
          status: "read",
          readAt: new Date()
        }
      });

      return mapUserAlert(record);
    }

    return {
      id,
      status: "read"
    };
  }

  @Patch(":id/archive")
  async archive(@Param("id") id: string) {
    if (this.prisma.isReady()) {
      const record = await this.prisma.userAlert.update({
        where: { id },
        data: {
          status: "archived"
        }
      });

      return mapUserAlert(record);
    }

    return {
      id,
      status: "archived"
    };
  }
}

@Controller("api/v1/settings")
class SettingsController {
  @Get()
  async getSettings() {
    return {
      notifications: {
        email: true,
        inApp: true,
        webPush: false
      },
      digestHour: "09:00",
      theme: "dark",
      sourceFilters: []
    };
  }

  @Patch()
  update(@Body() body: Record<string, unknown>) {
    return body;
  }
}

@Controller("api/v1/devtools")
class DevtoolsController {
  @Get("alert-copy/:packageName")
  preview(@Param("packageName") packageName: string) {
    return buildAlertCopy({
      packageName,
      severity: "high",
      fixedVersion: "latest"
    });
  }
}

@Module({
  providers: [PrismaService],
  controllers: [
    SecurityController,
    WatchlistController,
    AlertsController,
    SettingsController,
    DevtoolsController
  ]
})
export class SecurityModule {}
