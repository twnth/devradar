import { Controller, Get, Inject, Module, Param, Query } from "@nestjs/common";
import { feedQuerySchema } from "@devradar/types";
import { mapFeedItem } from "../common/mappers";
import {
  generateFeedBriefing,
  hasOpenAIKey,
  normalizeCachedFeedBriefing
} from "../common/feed-briefing";
import { PrismaService } from "../common/prisma.service";

@Controller("api/v1/feed")
class FeedController {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  @Get()
  async list(@Query() query: Record<string, string | undefined>) {
    const parsed = feedQuerySchema.safeParse(query);
    const category = parsed.success ? parsed.data.category : undefined;
    const tag = parsed.success ? parsed.data.tag : undefined;
    const sort = parsed.success ? parsed.data.sort ?? "latest" : "latest";
    const limit = parsed.success ? parsed.data.limit ?? 20 : 20;

    if (this.prisma.isReady()) {
      try {
        const orderBy =
          sort === "important"
            ? { finalScore: "desc" as const }
            : sort === "discussed"
              ? { discussionScore: "desc" as const }
              : { publishedAt: "desc" as const };

        const items = await this.prisma.feedItem.findMany({
          where: {
            ...(category ? { category } : {}),
            ...(tag ? { tags: { has: tag } } : {})
          },
          orderBy,
          take: limit
        });

        if (items.length > 0) {
          return {
            data: items.map(mapFeedItem),
            nextCursor: null
          };
        }
      } catch (error) {
        console.error("Failed to query feed items", error);
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
        const record = await this.prisma.feedItem.findFirst({
          where: {
            OR: [{ id }, { slug: id }]
          }
        });

        if (record) {
          return mapFeedItem(record);
        }
      } catch (error) {
        console.error("Failed to query feed item", error);
      }
    }

    return undefined;
  }

  @Get(":id/briefing")
  async briefing(@Param("id") id: string) {
    if (!this.prisma.isReady()) {
      return null;
    }

    try {
      const record = await this.prisma.feedItem.findFirst({
        where: {
          OR: [{ id }, { slug: id }]
        }
      });

      if (!record) {
        return null;
      }

      const cachedBriefing = normalizeCachedFeedBriefing(record.aiBriefing);
      if (cachedBriefing) {
        return cachedBriefing;
      }

      if (!hasOpenAIKey()) {
        return null;
      }

      const briefing = await generateFeedBriefing(record);

      if (!briefing) {
        return null;
      }

      await this.prisma.feedItem.update({
        where: { id: record.id },
        data: {
          aiBriefing: briefing,
          aiBriefingGeneratedAt: new Date()
        }
      });

      return briefing;
    } catch (error) {
      console.error("Failed to generate feed briefing", error);
      return null;
    }
  }
}

@Module({
  providers: [PrismaService],
  controllers: [FeedController]
})
export class FeedModule {}
