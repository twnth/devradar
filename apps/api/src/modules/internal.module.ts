import { Body, Controller, Module, Post, UseGuards } from "@nestjs/common";
import { normalizedFeedStagingSchema, normalizedSecurityStagingSchema } from "@devradar/types";
import { InternalGuard } from "../common/internal.guard";

@UseGuards(InternalGuard)
@Controller("internal")
class InternalController {
  @Post("ingest/feed")
  ingestFeed(@Body() body: unknown) {
    return normalizedFeedStagingSchema.array().safeParse(body);
  }

  @Post("ingest/security")
  ingestSecurity(@Body() body: unknown) {
    return normalizedSecurityStagingSchema.array().safeParse(body);
  }

  @Post("score/feed")
  scoreFeed() {
    return { queued: true, job: "score-feed" };
  }

  @Post("match/incidents")
  matchIncidents() {
    return { queued: true, job: "match-watchlists" };
  }

  @Post("notify/run")
  notify() {
    return { queued: true, job: "send-alerts" };
  }
}

@Module({
  controllers: [InternalController]
})
export class InternalModule {}
